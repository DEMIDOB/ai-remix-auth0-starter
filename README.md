# AI Remix Auth0 Starter

A minimal starter project built with [Remix](https://remix.run/), showcasing how to integrate [Auth0](https://auth0.com/) for authentication. This is part of a series of Remix-based AI application examples.

---

## 🚀 Stack

- [Remix](https://remix.run/) (v2.16+) using `@remix-run/express` adapter
- [React](https://reactjs.org/) (v18+)
- [Tailwind CSS](https://tailwindcss.com/) (v3.4+)
- [Auth0](https://auth0.com/) via [`remix-auth`](https://github.com/sergiodxa/remix-auth) and [`remix-auth-auth0`](https://github.com/sergiodxa/remix-auth-auth0)
- TypeScript
- Cookie-based session storage
- `.env` support via `dotenv`

---

## 📁 Project Structure

```bash
.
├── app/
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   ├── routes/
│   │   ├── auth.callback.tsx
│   │   ├── auth.login.tsx
│   │   ├── auth.logout.tsx
│   ├── services/
│   │   ├── auth.server.ts
│   │   └── session.server.ts
│   ├── styles/
│   │   └── tailwind.css
│   └── root.tsx
├── public/
├── .env
├── postcss.config.js
├── tailwind.config.ts
├── remix.config.js
├── vite.config.js
├── package.json
├── tsconfig.json
└── server.js
```

---

## 🔐 Auth0 Setup

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new **Application**:
   - Type: **Regular Web Application**
   - Callback URL: `http://localhost:3000/auth/callback`
   - Logout URL: `http://localhost:3000/`

3. Under **Settings**, copy the following values:
   - Domain
   - Client ID
   - Client Secret

4. In your project root, create a `.env` file:

```env
# .env
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
APP_BASE_URL=http://localhost:3000
SESSION_SECRET=a-very-secret-random-string
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=remix_app
SUPER_ADMIN_EMAIL=admin@example.com
```

> ⚠️ Replace values above with your actual Auth0 app credentials.

---

## 🧑‍💻 Development

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ MySQL & Database Scripts

All database scripts live in `scripts/db`. Run them from the project root:

1. `./scripts/db/01-setup-mysql.sh` — pull MySQL 8, create the `remix-mysql` container, and initialize a persistent data directory at `.data/mysql`.
2. `./scripts/db/02-cleanup-database.sh` — stop the container and delete the local data directory (irreversible; prompts for confirmation).
3. `./scripts/db/03-start-mysql.sh` — start the container and verify it accepts connections.
4. `./scripts/db/04-stop-mysql.sh` — stop the running container.
5. `./scripts/db/05-setup-migrations.sh` — scaffold migration tooling and helper scripts (also available in version control).
6. `./scripts/db/06-create-test-table.sh` — create or reset `test_table` with three sample rows.

Additional helpers:
- `./scripts/db/run-migrations.sh` runs the Node-based migration runner (checks the container is up first).
- `npm run db:migrate` applies migrations, while `npm run db:migrate:list` lists available migration files.

Default connection settings (defined in `.env`) align with the Docker scripts: host `127.0.0.1`, port `3306`, database `remix_app`, and credentials `root` / `root`.

---

## 📄 Available Routes

| Route             | Description                        |
|------------------|------------------------------------|
| `/`              | Home page (edit in `app/routes/index.tsx`) |
| `/auth/login`    | Redirects to Auth0 login           |
| `/auth/callback` | Handles Auth0 redirect             |
| `/auth/logout`   | Logs out and clears session        |

---

## 🛠 Customization Tips

- Modify `root.tsx` for layout and styles
- Use Tailwind classes in your components
- Extend `auth.server.ts` to customize Auth0 options (e.g., scopes)
- Store additional user info in sessions via `session.server.ts`

---

## 📦 Build & Deployment

```bash
npm run build
```

This creates a production-ready build in the `build/` folder. You can deploy with any Node.js-compatible host (e.g., AWS, Render, Railway).

---

## 🧠 About This Project

This repo is part of the **AI Remix Examples** series — a collection of minimal Remix apps integrating popular tools like Auth0, OpenAI, Pinecone, and more. Use them as building blocks for full-featured AI applications.

---

## 📄 License

MIT
