# Logixtic API (backend)

Servicio FastAPI independiente del frontend de Logixtic. **No confundir con el frontend**
(React/TanStack Start, publicado desde Lovable): este directorio no sirve la landing ni se
despliega en Lovable Cloud. Fase actual: foundation (health, configuración pública, adaptador
OpenRouter en dry-run). No hay base de datos, autenticación ni endpoints de ROI/IA todavía.

El servicio **arranca sin claves reales**: las variables de OpenRouter son opcionales y
`AGENT_DRY_RUN=true` por defecto.

## Requisitos

- Python 3.12 o superior (`py -3.12 --version`).
- PowerShell de Windows. Todos los comandos usan el `.venv` local; no se modifica el Python global.

## Preparar el entorno (PowerShell)

Desde la carpeta `backend`:

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
```

Si PowerShell bloquea la activación, ejecutar una vez en la sesión:
`Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.

Las versiones de dependencias están fijadas con `==` en `pyproject.toml`.

## Configuración

```powershell
Copy-Item .env.example .env
```

`.env` está excluido de Git. Dejar las claves vacías para desarrollo. Nunca escribir claves
reales en `.env.example` ni en el código. Variables principales:

| Variable | Valor por defecto | Nota |
| --- | --- | --- |
| `APP_ENV` | `development` | `development`, `test`, `staging` o `production`. |
| `API_HOST` / `API_PORT` | `127.0.0.1` / `8000` | |
| `CORS_ALLOW_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Lista explícita. `*` está prohibido. |
| `OPENROUTER_*` | vacías | Opcionales en desarrollo. |
| `AGENT_DRY_RUN` | `true` | Con `true` no hay llamadas de red a OpenRouter. |

## Ejecutar

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Endpoints:

- `GET http://127.0.0.1:8000/api/v1/health`: estado del proceso.
- `GET http://127.0.0.1:8000/api/v1/config/public`: configuración no sensible (nunca claves).

## Pruebas y lint

```powershell
pytest -q
ruff check .
ruff format --check .
```

Las pruebas son offline: no requieren Lovable Cloud, OpenRouter ni red. El cliente de OpenRouter
se prueba en modo dry-run con un transporte que falla si se intenta una llamada.

## Estructura

```text
backend/
├── app/
│   ├── main.py                  # create_app(), CORS, routers
│   ├── api/deps.py              # inyección de Settings
│   ├── api/v1/health.py         # GET /api/v1/health
│   ├── api/v1/config.py         # GET /api/v1/config/public
│   ├── core/config.py           # Settings (pydantic-settings) y validaciones
│   ├── core/logging.py          # logging JSON con campos allowlisted
│   ├── core/security.py         # esqueleto; sin autenticación falsa
│   └── integrations/openrouter_client.py  # contrato y dry-run
├── tests/                       # pytest, offline
├── .env.example
└── pyproject.toml
```

## Pendiente (fases futuras)

- Autenticación JWT de Lovable Cloud Auth y RBAC (Fase 4).
- Base de datos SQLAlchemy/Alembic, sólo tras confirmar recursos de Lovable Cloud.
- Contratos de ROI (`/api/v1/roi`) e IA (`/api/v1/ai`), y el hosting (Render u otro).
