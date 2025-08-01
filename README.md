# science-master-portal

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up your PostgreSQL database and update `.env` if needed.
3. Start the server:
   ```bash
   npm run dev
   ```

## Project Structure (MVC)
- `src/models/` — Sequelize models
- `src/controllers/` — Route logic
- `src/routes/` — Express routes
- `src/server.js` — App entry point

## Endpoints
- `GET /users` — List users
- `POST /users` — Create user

## Notes
- Database tables are auto-created on server start.
- Expand models/controllers/routes as needed.