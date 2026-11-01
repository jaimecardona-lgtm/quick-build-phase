# Rapid Build Studio

Ejecuta íntegramente el archivo LOVABLE_FASE_1_ARCHIVO_UNICO.md.

Construye directamente la Fase 1 usando los nueve activos visuales adjuntos. No entregues un plan, no hagas preguntas y no construyas secciones adicionales.

Antes de terminar, verifica que todas las imágenes carguen correctamente y que no existan errores 404.

Detente cuando aparezca el mensaje:

FASE 1 LISTA PARA REVISIÓN

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://quick-build-phase.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b3bca314-ecc3-4ccf-be00-42e39ff77bd7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Sprint 01: desarrollo local (Windows PowerShell)

Frontend (TanStack Start, React 19, Vite 8):

```powershell
bun install --frozen-lockfile   # o: npm install
bun run dev                     # servidor local con SSR
bun run lint
bun run build
bun run verify:content          # prueba de preservación del copy ES / EN / PT-BR
```

Hero cinematográfico (opcional, desactivado por defecto). Crear un `.env.local` en la raíz, sin subirlo a Git:

```powershell
"VITE_LOGIXTIC_MOTION_V2=true" | Out-File -Encoding utf8 .env.local
bun run dev
```

Backend FastAPI (servicio independiente, en `backend/`):

```powershell
cd backend
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
pytest -q
```

Documentación del sprint: [docs/audit-sprint-01.md](docs/audit-sprint-01.md), [docs/content-baseline.md](docs/content-baseline.md), [docs/motion-storyboard.md](docs/motion-storyboard.md), [docs/architecture-decisions.md](docs/architecture-decisions.md), [docs/security-backlog.md](docs/security-backlog.md).
