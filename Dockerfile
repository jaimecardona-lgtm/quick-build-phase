# Imagen única para Render Free (un Web Service, una URL HTTPS).
# Contiene: TanStack Start SSR (Node.js, Nitro node-server) + FastAPI (Python 3.12).
# Dos procesos supervisados por scripts/start-render.sh bajo tini.
# Sin credenciales, sin .env, sin PostgreSQL ni modelos locales.

ARG NODE_IMAGE=node:22-bookworm-slim
ARG PY_IMAGE=python:3.12-slim-bookworm

# ---------------------------------------------------------------------------------------------
# Etapa 1: build del frontend. Usa bun.lock (instalación congelada). Sin servidor Vite de dev.
# ---------------------------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS web-build
WORKDIR /app
RUN npm install -g bun@1.3.14
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile
COPY . .
# Banderas de build (no de runtime). Por defecto: agente visible en staging, planeación interna apagada.
ARG VITE_LOGIXTIC_AGENT=true
ARG VITE_PLANEACION_ENABLED=false
# Modo de build: la variante visual aprobada (Hero cinematográfico) vive en .env.forwarders-v2.
ARG VITE_BUILD_MODE=forwarders-v2
ENV NODE_ENV=production \
    VITE_LOGIXTIC_AGENT=${VITE_LOGIXTIC_AGENT} \
    VITE_PLANEACION_ENABLED=${VITE_PLANEACION_ENABLED}
RUN bun run build --mode ${VITE_BUILD_MODE} \
 && test -f .output/server/index.mjs

# ---------------------------------------------------------------------------------------------
# Etapa 2: dependencias de FastAPI en un venv (sin herramientas de desarrollo ni pruebas).
# ---------------------------------------------------------------------------------------------
FROM ${PY_IMAGE} AS api-build
ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONDONTWRITEBYTECODE=1
RUN python -m venv /opt/venv
ENV PATH=/opt/venv/bin:$PATH
COPY backend/pyproject.toml /src/backend/pyproject.toml
COPY backend/app /src/backend/app
RUN pip install --no-compile /src/backend \
 && python -m compileall -q /opt/venv/lib/python3.12/site-packages \
 && python -c "import app.main"

# ---------------------------------------------------------------------------------------------
# Etapa 3: runtime final. Python 3.12 + Node 22 (binario copiado de la etapa 1, misma familia Debian).
# ---------------------------------------------------------------------------------------------
FROM ${PY_IMAGE} AS runtime
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH=/opt/venv/bin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
    NODE_ENV=production \
    APP_ENV=staging \
    HOST=0.0.0.0 \
    PORT=10000 \
    AGENT_API_URL=http://127.0.0.1:8010 \
    PY=/opt/venv/bin/python

RUN apt-get update \
 && apt-get install -y --no-install-recommends tini ca-certificates bash passwd \
 && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

COPY --from=web-build /usr/local/bin/node /usr/local/bin/node
COPY --from=web-build /app/.output /srv/app/.output
COPY --from=api-build /opt/venv /opt/venv
COPY scripts/start-render.sh /srv/app/scripts/start-render.sh

RUN sed -i 's/\r$//' /srv/app/scripts/start-render.sh \
 && chmod 0555 /srv/app/scripts/start-render.sh \
 && node --version \
 && useradd --system --uid 10001 --no-create-home --shell /usr/sbin/nologin app \
 && chown -R root:root /srv/app \
 && find /srv/app -type f -exec chmod a-w {} + \
 && find /srv/app -type d -exec chmod 0755 {} +

USER app
WORKDIR /srv/app
EXPOSE 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD python -c "import os,urllib.request,sys; urllib.request.urlopen('http://127.0.0.1:'+os.environ.get('PORT','10000')+'/healthz', timeout=4)" || exit 1

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["/srv/app/scripts/start-render.sh"]
