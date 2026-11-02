#!/usr/bin/env bash
# Supervisor del contenedor all-in-one (Render Free).
#
#   tini (PID 1) -> este script -> FastAPI (127.0.0.1:8010) y luego Node SSR (0.0.0.0:$PORT)
#
# - FastAPI solo escucha en loopback; el navegador nunca llega a ese puerto.
# - No ejecuta migraciones SQL ni modifica datos al arrancar.
# - Si muere cualquiera de los dos procesos, se apaga el otro y el contenedor termina con error
#   (Render lo reinicia).
# - SIGTERM / SIGINT se reenvían a ambos procesos antes de salir.
# - No imprime variables de entorno ni secretos.
set -uo pipefail

APP_ROOT="${APP_ROOT:-/srv/app}"
PY="${PY:-/opt/venv/bin/python}"
API_HOST="127.0.0.1"
API_PORT="8010"
export PORT="${PORT:-10000}"
export HOST="${HOST:-0.0.0.0}"
export AGENT_API_URL="http://${API_HOST}:${API_PORT}"

API_PID=""
WEB_PID=""

log() {
  printf '[supervisor] %s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

shutdown() {
  local code="${1:-0}"
  log "apagando procesos (codigo ${code})"
  [[ -n "${WEB_PID}" ]] && kill -TERM "${WEB_PID}" 2>/dev/null
  [[ -n "${API_PID}" ]] && kill -TERM "${API_PID}" 2>/dev/null
  [[ -n "${WEB_PID}" ]] && wait "${WEB_PID}" 2>/dev/null
  [[ -n "${API_PID}" ]] && wait "${API_PID}" 2>/dev/null
  exit "${code}"
}

trap 'shutdown 0' TERM INT

# 1. FastAPI: un solo worker, sin --reload, solo loopback.
log "arrancando FastAPI en ${API_HOST}:${API_PORT}"
"${PY}" -m uvicorn app.main:app \
  --host "${API_HOST}" --port "${API_PORT}" \
  --workers 1 --no-server-header --log-level warning &
API_PID=$!

# 2. Esperar al health check de FastAPI antes de aceptar tráfico.
#    Plazo por reloj (240 s): con 0,1 vCPU la importación de FastAPI tarda ~60 s en el plan Free.
#    La sonda usa /dev/tcp (sin lanzar Python en cada intento).
probe_api() {
  exec 3<>"/dev/tcp/${API_HOST}/${API_PORT}" 2>/dev/null || return 1
  printf 'GET /api/v1/health HTTP/1.0
Host: %s
Connection: close

' "${API_HOST}" >&3
  local line=""
  IFS= read -r line <&3 || true
  exec 3>&- 3<&-
  [[ "${line}" == *" 200 "* ]]
}

deadline=$(( $(date +%s) + 240 ))
ready=0
while [[ $(date +%s) -lt ${deadline} ]]; do
  if ! kill -0 "${API_PID}" 2>/dev/null; then
    log "FastAPI terminó durante el arranque"
    shutdown 1
  fi
  if probe_api; then
    ready=1
    break
  fi
  sleep 1
done
if [[ "${ready}" -ne 1 ]]; then
  log "FastAPI no respondió al health check en 240 s"
  shutdown 1
fi
log "FastAPI operativo"

# 3. Node.js SSR (servidor Nitro node-server generado por el build).
log "arrancando Node SSR en ${HOST}:${PORT}"
node "${APP_ROOT}/.output/server/index.mjs" &
WEB_PID=$!

# 4. Supervisión: esperar a que cualquiera de los dos termine.
wait -n
status=$?
if ! kill -0 "${API_PID}" 2>/dev/null; then
  log "FastAPI terminó (codigo ${status}); apagando Node"
else
  log "Node SSR terminó (codigo ${status}); apagando FastAPI"
fi
shutdown 1
