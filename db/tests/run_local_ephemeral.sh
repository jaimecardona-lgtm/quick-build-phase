#!/usr/bin/env bash
# Ejecuta las migraciones y pruebas RLS en un Postgres DESECHABLE local (Docker).
# Nunca apunta a Supabase ni a ninguna base compartida. La contraseña se genera al vuelo y no se guarda.
#
# Uso (desde la raíz del repo):  bash db/tests/run_local_ephemeral.sh
set -euo pipefail

IMAGE="${PG_IMAGE:-postgres:16-alpine}"
NAME="logixtic-rls-$$"
PASS="$(head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 24)"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker run -d --rm --name "$NAME" -e POSTGRES_PASSWORD="$PASS" -p 127.0.0.1::5432 "$IMAGE" >/dev/null

for _ in $(seq 1 60); do
  if docker exec "$NAME" pg_isready -U postgres >/dev/null 2>&1; then break; fi
  sleep 1
done

psql_file() {
  docker exec -i "$NAME" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -q < "$1"
}

# Rol de servicio como en Supabase (BYPASSRLS). Solo en este contenedor desechable.
docker exec -i "$NAME" psql -U postgres -v ON_ERROR_STOP=1 -q -c \
  "create role service_role nologin bypassrls;"

echo "== 0000 shim (solo local)"; psql_file "$ROOT/db/tests/0000_auth_shim_for_tests.sql"
echo "== 0001 migración";        psql_file "$ROOT/db/migrations/0001_roles_cms_leads_audit.sql"
echo "== 0002 migración";        psql_file "$ROOT/db/migrations/0002_public_ingress_hardening.sql"
echo "== 0002 pruebas RLS";      psql_file "$ROOT/db/tests/0002_ingress_test.sql"
echo "== 0001 pruebas RLS originales (locales)"; psql_file "$ROOT/db/tests/0001_rls_test.sql"
echo "RESULTADO: migraciones 0001+0002 y pruebas 0002 completadas en Postgres efímero."
