# Copilot Instructions for SmokePOS@0

## Project Overview
- This is a React + Vite application with a custom backend in the `smokess/` directory.
- The frontend is in `src/` (React, Vite, JSX, CSS modules), and state management uses Redux (see `state/`).
- The backend is a Node.js/Express server (`smokess/server.js`) with routes/controllers for items and sales invoices.
- Database initialization and scripts are in `smokess/` (see `initDatabase.js`, `db.js`).

## Key Patterns & Conventions
- **State Management:** Redux slices are in `state/items/itemsSlice.js` and similar files. Use Redux Toolkit conventions.
- **Component Structure:** UI components are in `src/main/renderer/`. Styles are colocated in `src/main/renderer/styles/`.
- **API Integration:** Frontend communicates with backend via HTTP (see `smokess/routes/`).
- **Backend Structure:**
  - Controllers: `smokess/controllers/`
  - Middleware: `smokess/middleware/`
  - Routes: `smokess/routes/`
- **Assets:** Images and static files are in `public/` and `src/assets/`.

## Developer Workflows
- **Start Frontend:** `npm run dev` (from project root)
- **Start Backend:** `npm install` then `node server.js` (from `smokess/`)
- **Database:** Use `initDatabase.js` to initialize. Docker Compose file is present for DB setup.
- **Build:** `npm run build` (frontend)
- **Lint:** `npx eslint .`

## Integration Points
- **Frontend/Backend:** All API calls from React go to Express endpoints defined in `smokess/routes/`.
- **Database:** Backend uses scripts in `smokess/` for DB setup and access.

## Project-Specific Notes
- Use Vite and React conventions for frontend. Avoid ejecting or custom Webpack unless necessary.
- Follow Redux Toolkit patterns for state logic.
- Keep backend logic modular: controllers for business logic, routes for endpoints, middleware for cross-cutting concerns.
- Place new images in `public/images/` or `src/assets/` as appropriate.

## Examples
- To add a new API route: create a controller in `smokess/controllers/`, add a route in `smokess/routes/`, and register it in `server.js`.
- To add a new Redux slice: create a file in `state/`, use `createSlice`, and integrate with the store in `state/store.js`.

---
If any section is unclear or missing, please provide feedback for improvement.
