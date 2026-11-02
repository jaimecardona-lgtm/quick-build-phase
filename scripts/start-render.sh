#!/usr/bin/env bash
# Supervisor del contenedor all-in-one (Render Free).
#
#   tini (PID 1) -> este script -> Node SSR (0.0.0.0:$PORT)  y  FastAPI (127.0.0.1:8010), a la vez
#
# - Node abre el puerto público de inmediato; no espera a FastAPI.
# - FastAPI solo escucha en loopback; el navegador nunca llega a ese puerto.
# - /healthz (Node) responde 503 mientras FastAPI no está listo y 200 cuando lo está.
# - Durante TODO el ciclo de vida se comprueba que ambos procesos sigan vivos. Si cualquiera
#   termina, se apaga el otro y el contenedor termina con código 1 (Render lo reinicia).
# - SIGTERM / SIGINT se reenvían a ambos procesos y el script sale con código 0.
# - La sonda de FastAPI es silenciosa: no genera "Connection refused" en los logs.
# - No ejecuta migraciones SQL ni modifica datos al arrancar. No imprime secretos.
set -uo pipefail

APP_ROOT="${APP_ROOT:-/srv/app}"
PY="${PY:-/opt/venv/bin/python}"
API_HOST="127.0.0.1"
API_PORT="8010"
# Plazo máximo para que FastAPI quede listo. Con 0,1 vCPU la importación tarda ~60 s.
API_READY_TIMEOUT="${API_READY_TIMEOUT:-600}"
export PORT="${PORT:-10000}"
export HOST="${HOST:-0.0.0.0}"
export AGENT_API_URL="http://${API_HOST}:${API_PORT}"

API_PID=""
WEB_PID=""
API_READY=0

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

# Sonda silenciosa de FastAPI. La subshell aísla los errores de conexión (sin spam en logs).
# Devuelve 0 solo si FastAPI responde 200 en /api/v1/health.
probe_api() {
  (
    exec 3<>"/dev/tcp/${API_HOST}/${API_PORT}" || exit 1
    printf 'GET /api/v1/health HTTP/1.0\r\nHost: %s\r\nConnection: close\r\n\r\n' "${API_HOST}" >&3
    IFS= read -r line <&3 || true
    [[ "${line}" == *" 200 "* ]]
  ) 2>/dev/null
}

# 1. Arrancar ambos procesos a la vez. Node primero para que el puerto público abra cuanto antes.
log "arrancando Node SSR en ${HOST}:${PORT}"
node "${APP_ROOT}/.output/server/index.mjs" &
WEB_PID=$!

log "arrancando FastAPI en ${API_HOST}:${API_PORT}"
"${PY}" -m uvicorn app.main:app \
  --host "${API_HOST}" --port "${API_PORT}" \
  --workers 1 --no-server-header --log-level warning &
API_PID=$!

# 2. Bucle de supervisión: vigila ambos procesos durante el arranque y después.
#    Cuando FastAPI responde por primera vez, se registra una sola vez.
deadline=$(( $(date +%s) + API_READY_TIMEOUT ))
last_wait_log=0
while true; do
  if ! kill -0 "${WEB_PID}" 2>/dev/null; then
    log "Node SSR terminó durante la supervisión; apagando FastAPI"
    shutdown 1
  fi
  if ! kill -0 "${API_PID}" 2>/dev/null; then
    log "FastAPI terminó; apagando Node SSR"
    shutdown 1
  fi
  if [[ "${API_READY}" -eq 0 ]]; then
    if probe_api; then
      API_READY=1
      log "FastAPI operativo; /healthz devuelve 200"
    else
      now=$(date +%s)
      if [[ $(( now - last_wait_log )) -ge 60 ]]; then
        log "esperando a FastAPI (healthz en 503 hasta que esté listo)"
        last_wait_log=${now}
      fi
      if [[ ${now} -ge ${deadline} ]]; then
        log "FastAPI no quedó listo en ${API_READY_TIMEOUT} s"
        shutdown 1
      fi
    fi
  fi
  sleep 1
done
