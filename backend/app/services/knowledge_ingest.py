"""Ingesta reproducible y controlada de conocimiento comercial aprobado hacia Supabase (pgvector).

Flujo (`python -m app.services.knowledge_ingest`):
  1. Valida la estructura documental (idioma, tipo, identificador, fuente, sin datos personales).
  2. Divide en fragmentos y calcula el hash SHA-256 de cada fragmento.
  3. Obtiene embeddings solo para hashes no cacheados (mismo modelo y dimensión que las consultas).
  4. Genera SQL idempotente: no borra nada, no sobrescribe fragmentos existentes y no publica
     por defecto. Publicar exige --publish y --approved-by.

Nunca escribe secretos en el SQL, en la salida ni en los logs.
"""

import argparse
import hashlib
import json
import math
import os
import re
import sys
import time
from collections.abc import Sequence
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import httpx

from app.core.config import Settings, get_settings
from app.integrations.embeddings import EmbeddingError, EmbeddingProvider, build_embedding_provider
from app.services.text_guard import redact_pii

DEFAULT_SOURCE = Path(__file__).resolve().parent.parent / "knowledge" / "approved_public_es.json"
ALLOWED_LOCALES = frozenset({"es", "en", "pt-BR"})
ALLOWED_KINDS = frozenset({"faq", "product", "plan", "blog", "other"})
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]{1,80}$")
VERSION_RE = re.compile(r"^[A-Za-z0-9._-]{1,32}$")
UUID_RE = re.compile(r"^[0-9a-fA-F-]{36}$")
MAX_CHUNK_CHARS = 800
EMBED_BATCH = 32
EMBEDDING_DIMENSION = 2048


class IngestError(ValueError):
    """Error de validación con mensaje seguro (sin contenido completo ni secretos)."""


@dataclass(frozen=True)
class SourceDoc:
    slug: str
    locale: str
    kind: str
    source_reference: str
    text: str


@dataclass(frozen=True)
class ChunkRow:
    slug: str
    chunk_index: int
    locale: str
    content: str
    content_sha256: str


def content_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def load_documents(path: Path) -> tuple[str, list[SourceDoc]]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        raise IngestError("no se pudo leer el archivo de conocimiento") from exc
    version = str(data.get("version", ""))
    if not VERSION_RE.match(version):
        raise IngestError("versión del conocimiento no válida")
    entries = data.get("entries")
    if not isinstance(entries, list) or not entries:
        raise IngestError("el archivo no contiene entradas")

    docs: list[SourceDoc] = []
    seen: set[str] = set()
    for index, entry in enumerate(entries):
        if not isinstance(entry, dict):
            raise IngestError(f"entrada {index} no es un objeto")
        slug = str(entry.get("id", ""))
        if not SLUG_RE.match(slug):
            raise IngestError(f"identificador no válido en la entrada {index}")
        if slug in seen:
            raise IngestError(f"identificador duplicado: {slug}")
        seen.add(slug)
        locale = str(entry.get("locale", ""))
        if locale not in ALLOWED_LOCALES:
            raise IngestError(f"idioma no soportado en {slug}")
        kind = str(entry.get("kind", "faq"))
        if kind not in ALLOWED_KINDS:
            raise IngestError(f"tipo no soportado en {slug}")
        source_reference = str(entry.get("source", "")).strip()
        if not source_reference or len(source_reference) > 200:
            raise IngestError(f"referencia de fuente ausente o demasiado larga en {slug}")
        question = str(entry.get("question", "")).strip()
        answer = str(entry.get("answer", "")).strip()
        if not question or not answer:
            raise IngestError(f"pregunta o respuesta vacía en {slug}")
        text = f"{question}\n{answer}"
        if redact_pii(text) != text:
            # Ningún dato personal entra al índice ni a los embeddings.
            raise IngestError(f"datos personales detectados en {slug}; corregir la fuente")
        docs.append(SourceDoc(slug, locale, kind, source_reference, text))
    return version, docs


def chunk_text(text: str, max_chars: int = MAX_CHUNK_CHARS) -> list[str]:
    """Divide por párrafos y, si hace falta, por frases. Nunca devuelve fragmentos vacíos."""
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n|\n", text) if p.strip()]
    chunks: list[str] = []
    current = ""
    for paragraph in paragraphs:
        pieces = (
            [paragraph] if len(paragraph) <= max_chars else re.split(r"(?<=[.!?])\s+", paragraph)
        )
        for piece in pieces:
            piece = piece.strip()
            if not piece:
                continue
            if len(piece) > max_chars:
                piece = piece[:max_chars]
            candidate = f"{current}\n{piece}".strip() if current else piece
            if len(candidate) <= max_chars:
                current = candidate
            else:
                chunks.append(current)
                current = piece
    if current:
        chunks.append(current)
    return chunks


def build_chunks(docs: Sequence[SourceDoc]) -> list[ChunkRow]:
    rows: list[ChunkRow] = []
    for doc in docs:
        for index, content in enumerate(chunk_text(doc.text)):
            rows.append(ChunkRow(doc.slug, index, doc.locale, content, content_hash(content)))
    return rows


def load_cache(path: Path | None, model: str) -> dict[str, list[float]]:
    if path is None or not path.exists():
        return {}
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("model") != model or data.get("dimension") != EMBEDDING_DIMENSION:
        return {}  # caché de otro modelo o dimensión: no se reutiliza
    return {k: list(map(float, v)) for k, v in data.get("vectors", {}).items()}


def save_cache(path: Path, model: str, vectors: dict[str, list[float]]) -> None:
    payload = {"model": model, "dimension": EMBEDDING_DIMENSION, "vectors": vectors}
    path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")


async def embed_missing(
    provider: EmbeddingProvider, chunks: Sequence[ChunkRow], cache: dict[str, list[float]]
) -> dict[str, list[float]]:
    missing: list[ChunkRow] = []
    seen: set[str] = set()
    for row in chunks:
        if row.content_sha256 not in cache and row.content_sha256 not in seen:
            seen.add(row.content_sha256)
            missing.append(row)
    for start in range(0, len(missing), EMBED_BATCH):
        batch = missing[start : start + EMBED_BATCH]
        vectors = await provider.embed([row.content for row in batch])
        for row, vector in zip(batch, vectors, strict=True):
            cache[row.content_sha256] = vector
    return cache


def sql_string(value: str) -> str:
    if "\x00" in value:
        raise IngestError("carácter nulo en el contenido")
    return "'" + value.replace("'", "''") + "'"


def sql_vector(vector: Sequence[float]) -> str:
    if len(vector) != EMBEDDING_DIMENSION or not all(math.isfinite(x) for x in vector):
        raise IngestError("embedding con dimensión o valores no válidos")
    return "'[" + ",".join(repr(float(x)) for x in vector) + "]'"


def render_sql(
    *,
    version: str,
    docs: Sequence[SourceDoc],
    chunks: Sequence[ChunkRow],
    vectors: dict[str, list[float]],
    model: str,
    publish: bool,
    approved_by: str | None,
) -> str:
    """SQL idempotente. Todos los literales pasan por sql_string() o sql_vector() (escapados)."""
    if publish and not approved_by:
        raise IngestError("publicar exige --approved-by")
    if approved_by is not None and not UUID_RE.match(approved_by):
        raise IngestError("--approved-by debe ser un UUID")
    lines: list[str] = [
        "begin;",
        f"-- versión {version} · modelo {model} · dimensión {EMBEDDING_DIMENSION}",
    ]

    # 1. Metadatos de fuentes: no cambia la aprobación de fuentes existentes.
    source_rows = ",\n".join(
        f"  ({sql_string(d.slug)}, {sql_string(d.locale)}, {sql_string(d.kind)}, "
        f"{sql_string(d.source_reference)})"
        for d in docs
    )
    lines.append(
        "insert into public.knowledge_sources (slug, locale, kind, source_reference) values\n"
        + source_rows
        + "\non conflict (slug) do update set source_reference = excluded.source_reference;"
    )

    # 2. Publicación explícita con aprobador identificado.
    if publish:
        slugs = ", ".join(sql_string(d.slug) for d in docs)
        lines.append(
            "update public.knowledge_sources set approved = true, "  # noqa: S608 (literales escapados con sql_string)
            f"published_version = {sql_string(version)} where slug in ({slugs});"
        )

    # 3. Fragmentos: inmutables por (fuente, versión, hash). Nunca se actualizan ni se borran.
    chunk_rows = []
    for row in chunks:
        if row.content_sha256 not in vectors:
            raise IngestError("falta embedding para un fragmento")
        chunk_rows.append(
            f"  ({sql_string(row.slug)}, {row.chunk_index}, {sql_string(row.locale)}, "
            f"{sql_string(row.content)}, {sql_string(row.content_sha256)}, "
            f"{sql_vector(vectors[row.content_sha256])})"
        )
    columns = (
        "source_id, version, chunk_index, locale, content, content_sha256, "
        "embedding, embedding_model, embedding_dim"
    )
    lines.append(
        "with incoming(slug, chunk_index, locale, content, content_sha256, vec) as (values\n"
        + ",\n".join(chunk_rows)
        + "\n)\n"
        f"insert into public.knowledge_chunks ({columns})\n"
        f"select ks.id, {sql_string(version)}, i.chunk_index, i.locale, i.content, "
        f"i.content_sha256, i.vec::extensions.halfvec(2048), {sql_string(model)}, 2048\n"
        "from incoming i join public.knowledge_sources ks on ks.slug = i.slug\n"
        "on conflict do nothing;"
    )

    # 4. Trazabilidad de la ejecución (sin contenido).
    creator = f"{sql_string(approved_by)}::uuid" if approved_by else "null"
    lines.append(
        "insert into public.knowledge_ingestion_runs (version, embedding_model, embedding_dim, "  # noqa: S608 (literales escapados con sql_string)
        "status, sources_seen, chunks_written, chunks_skipped, finished_at, created_by) values "
        f"({sql_string(version)}, {sql_string(model)}, 2048, 'succeeded', {len(docs)}, "
        f"{len(chunks)}, 0, now(), {creator});"
    )
    lines.append("commit;")
    return "\n".join(lines) + "\n"


async def run(
    args: argparse.Namespace, settings: Settings, provider: EmbeddingProvider | None
) -> dict[str, Any]:
    version, docs = load_documents(args.source)
    chunks = build_chunks(docs)
    summary: dict[str, Any] = {
        "source_version": version,
        "sources": len(docs),
        "chunks": len(chunks),
        "publish": bool(args.publish),
        "dry_run": bool(args.dry_run),
    }
    if args.dry_run:
        summary["unique_chunk_hashes"] = len({c.content_sha256 for c in chunks})
        return summary

    if provider is None:
        raise IngestError("embeddings no configurados (OPENROUTER_API_KEY y RAG_EMBEDDING_MODEL)")
    cache = load_cache(args.cache, provider.model)
    summary["cache_hits"] = sum(1 for c in chunks if c.content_sha256 in cache)
    vectors = await embed_missing(provider, chunks, cache)
    summary["embedded_now"] = len({c.content_sha256 for c in chunks}) - summary["cache_hits"]
    if args.cache:
        save_cache(args.cache, provider.model, vectors)
    if args.remote:
        url = os.environ.get("SUPABASE_URL", "")
        secret = os.environ.get("SUPABASE_SECRET_KEY", "")
        if not url or not secret:
            raise IngestError(
                "SUPABASE_URL y SUPABASE_SECRET_KEY deben estar en el entorno del proceso"
            )
        writer = RemoteWriter(url, secret)
        summary["remote"] = await write_remote(
            docs=docs,
            chunks=chunks,
            vectors=vectors,
            version=version,
            model=provider.model,
            publish=args.publish,
            approved_by=args.approved_by,
            writer=writer,
        )
        return summary
    sql = render_sql(
        version=version,
        docs=docs,
        chunks=chunks,
        vectors=vectors,
        model=provider.model,
        publish=args.publish,
        approved_by=args.approved_by,
    )
    if args.emit_sql:
        Path(args.emit_sql).write_text(sql, encoding="utf-8")
        summary["sql_file_written"] = True
    summary["embedding_model"] = provider.model
    summary["dimension"] = EMBEDDING_DIMENSION
    return summary


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Ingesta de conocimiento aprobado (pgvector)")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--dry-run", action="store_true", help="valida y fragmenta sin embeddings")
    parser.add_argument("--cache", type=Path, default=None, help="caché local de embeddings (JSON)")
    parser.add_argument("--emit-sql", type=Path, default=None, help="escribe el SQL idempotente")
    parser.add_argument(
        "--publish", action="store_true", help="publica la versión (requiere aprobación)"
    )
    parser.add_argument("--approved-by", default=None, help="UUID del aprobador")
    parser.add_argument(
        "--remote",
        action="store_true",
        help="escribe en Supabase vía REST (clave de servidor del entorno)",
    )
    args = parser.parse_args(argv)

    import asyncio

    settings = get_settings()
    provider = None if args.dry_run else build_embedding_provider(settings)
    try:
        summary = asyncio.run(run(args, settings, provider))
    except (IngestError, EmbeddingError) as exc:
        kind = getattr(exc, "kind", "validation")
        print(json.dumps({"ok": False, "error": str(exc), "kind": kind}, ensure_ascii=False))
        return 1
    print(json.dumps({"ok": True, **summary}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())


# ---------- Escritura remota (Supabase REST con clave de servidor) ----------

REMOTE_BATCH = 20


class RemoteWriter:
    """Escribe en Supabase vía PostgREST. Clave de servidor solo en `apikey`; nunca se registra."""

    def __init__(
        self, base_url: str, secret: str, transport: httpx.AsyncBaseTransport | None = None
    ) -> None:
        self._base = base_url.rstrip("/")
        self._secret = secret
        self._transport = transport

    async def _request(
        self, method: str, path: str, *, params=None, body=None, prefer: str = ""
    ) -> httpx.Response:
        headers = {"apikey": self._secret, "Content-Type": "application/json"}
        if prefer:
            headers["Prefer"] = prefer
        try:
            async with httpx.AsyncClient(
                base_url=self._base, timeout=60, transport=self._transport
            ) as client:
                response = await client.request(
                    method, path, params=params, json=body, headers=headers
                )
        except httpx.HTTPError as exc:
            raise IngestError("error de red al escribir en Supabase") from exc
        if response.status_code >= 400:
            raise IngestError(f"Supabase respondió HTTP {response.status_code} al escribir {path}")
        return response

    async def upsert_sources(self, docs: Sequence[SourceDoc]) -> dict[str, str]:
        rows = [
            {
                "slug": d.slug,
                "locale": d.locale,
                "kind": d.kind,
                "source_reference": d.source_reference,
            }
            for d in docs
        ]
        response = await self._request(
            "POST",
            "/rest/v1/knowledge_sources",
            params={"on_conflict": "slug"},
            body=rows,
            prefer="resolution=merge-duplicates,return=representation",
        )
        return {row["slug"]: row["id"] for row in response.json()}

    async def insert_chunks(
        self,
        chunks: Sequence[ChunkRow],
        vectors: dict[str, list[float]],
        source_ids: dict[str, str],
        version: str,
        model: str,
    ) -> tuple[int, int]:
        written = 0
        for start in range(0, len(chunks), REMOTE_BATCH):
            batch = chunks[start : start + REMOTE_BATCH]
            rows = []
            for row in batch:
                if row.slug not in source_ids:
                    raise IngestError("fuente sin identificador remoto")
                rows.append(
                    {
                        "source_id": source_ids[row.slug],
                        "version": version,
                        "chunk_index": row.chunk_index,
                        "locale": row.locale,
                        "content": row.content,
                        "content_sha256": row.content_sha256,
                        "embedding": sql_vector(vectors[row.content_sha256]).strip("'"),
                        "embedding_model": model,
                        "embedding_dim": EMBEDDING_DIMENSION,
                    }
                )
            response = await self._request(
                "POST",
                "/rest/v1/knowledge_chunks",
                params={"on_conflict": "source_id,version,content_sha256"},
                body=rows,
                prefer="resolution=ignore-duplicates,return=representation",
            )
            written += len(response.json())
        return written, len(chunks) - written

    async def record_run(
        self,
        *,
        version: str,
        model: str,
        sources: int,
        written: int,
        skipped: int,
        approved_by: str | None,
        status: str,
    ) -> None:
        body = {
            "version": version,
            "embedding_model": model,
            "embedding_dim": EMBEDDING_DIMENSION,
            "status": status,
            "sources_seen": sources,
            "chunks_written": written,
            "chunks_skipped": skipped,
            "finished_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "created_by": approved_by,
        }
        await self._request(
            "POST", "/rest/v1/knowledge_ingestion_runs", body=body, prefer="return=minimal"
        )

    async def verify_approver(self, approver_id: str) -> None:
        """El aprobador debe tener perfil activo y un rol autorizado (publisher o admin)."""
        profile = await self._request(
            "GET",
            "/rest/v1/profiles",
            params={"user_id": f"eq.{approver_id}", "select": "user_id,active"},
        )
        rows = profile.json()
        if not rows or rows[0].get("active") is not True:
            raise IngestError("el aprobador no tiene perfil activo")
        roles = await self._request(
            "GET",
            "/rest/v1/role_assignments",
            params={"user_id": f"eq.{approver_id}", "select": "role"},
        )
        if not any(r.get("role") in ("publisher", "admin") for r in roles.json()):
            raise IngestError("el aprobador no tiene un rol autorizado para publicar")

    async def publish(self, slugs: Sequence[str], version: str) -> int:
        in_list = ",".join(slugs)
        response = await self._request(
            "PATCH",
            "/rest/v1/knowledge_sources",
            params={"slug": f"in.({in_list})"},
            body={"approved": True, "published_version": version},
            prefer="return=representation",
        )
        return len(response.json())


async def write_remote(
    *,
    docs: Sequence[SourceDoc],
    chunks: Sequence[ChunkRow],
    vectors: dict[str, list[float]],
    version: str,
    model: str,
    publish: bool,
    approved_by: str | None,
    writer: RemoteWriter,
) -> dict[str, Any]:
    if publish and not approved_by:
        raise IngestError("publicar exige --approved-by (usuario real de Supabase Auth)")
    if publish:
        await writer.verify_approver(approved_by)  # antes de cualquier escritura
    source_ids = await writer.upsert_sources(docs)
    written, skipped = await writer.insert_chunks(chunks, vectors, source_ids, version, model)
    await writer.record_run(
        version=version,
        model=model,
        sources=len(docs),
        written=written,
        skipped=skipped,
        approved_by=approved_by,
        status="succeeded",
    )
    result: dict[str, Any] = {
        "sources_upserted": len(source_ids),
        "chunks_written": written,
        "chunks_skipped": skipped,
        "published": 0,
    }
    if publish:
        result["published"] = await writer.publish([d.slug for d in docs], version)
    return result
