# Role Based Access Controll System

# Role-Based Access Control (RBAC) — Frontend

This repository contains the frontend for an administrative Role-Based Access Control (RBAC) system. It provides a web UI to manage users, roles, permissions (menus), departments and monitoring features and is designed to work with a compatible backend API.
## Key features
- User management: add / edit users, assign roles and positions
- Role management: create roles, assign permissions (menu items)
- Menu & permission tree: hierarchical menu definition with icons, paths and permission keys
- Monitoring: login/online logs, operation logs, server metrics
- Reusable UI components and form modals for consistent UX

## Quick start (frontend)
1. Install dependencies

```bash
npm install
```

2. Start the dev server

```bash
npm run dev
```

3. Open the app

Visit http://localhost:5173 (or the port Vite reports)

Notes
Visit http://localhost:5173 (or the port Vite reports)

Notes
- This project expects a backend API to provide authentication and CRUD endpoints. Configure the API base URL in `src/env.ts` or the appropriate env file used by your setup.
- Backend repository: https://github.com/adrianleul/rbac-backend.git
- Combined repository (frontend + backend): https://github.com/adrianleul/RBAC.git
- In development React StrictMode is enabled; some effects may run twice (dev-only). See `src/main.tsx` for how to adjust behaviour if needed.

## Project structure (important folders)
- `src/` — application source code
   - `api/` — thin wrappers for backend HTTP endpoints
   - `components/` — reusable UI components (modals, inputs, toasts)
   - `layout/` — page layouts and admin pages (user, role, menu management)
   - `lib/`, `utils/` — helpers, data and utilities

## Contributing
- Open an issue for bugs or feature requests
- Fork, create a branch, and send a PR with tests or screenshots as appropriate

## License
- See the project root for license details (if any). If none, add a license file such as MIT.