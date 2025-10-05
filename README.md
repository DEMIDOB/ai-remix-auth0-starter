# AI Remix Auth0 Starter

A minimal Remix project that demonstrates how to wire Auth0 authentication into a Remix app. The cleaning service demo has been removed so you can start from a clean, auth-only baseline.

---

## 🚀 Stack

- [Remix](https://remix.run/) (v2.16+) using the `@remix-run/express` adapter
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
│   ├── components/
│   │   └── NavBar.tsx
│   ├── entry.client.tsx
│   ├── entry.server.tsx
│   ├── providers/            # bring your own providers when you add data sources
│   ├── routes/
│   │   ├── _index.tsx        # authenticated landing page
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
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── server.js
```

> `app/providers/` is intentionally empty—use it when you introduce your own data layer or third-party integrations.

---

## 🔐 Auth0 Setup

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new **Application**:
   - Type: **Regular Web Application**
   - Callback URL: `http://localhost:3000/auth/callback`
   - Logout URL: `http://localhost:3000/auth/login`
3. Under **Settings**, copy the following values:
   - Domain
   - Client ID
   - Client Secret
4. In your project root, create a `.env` file (or copy `.env.example` if you add one):

```env
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
APP_BASE_URL=http://localhost:3000
SESSION_SECRET=a-very-secret-random-string
AUTH0_POST_LOGOUT_REDIRECT_URI=http://localhost:3000/auth/login
```

> ⚠️ Replace the values above with credentials from your Auth0 tenant before running the app.

---

## 🧑‍💻 Development

Install dependencies and start the Remix dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Login / Sign Up** to begin the Auth0 flow. Successful authentication redirects back to the protected home page and stores the user profile in the session.

---

## 📄 Available Routes

| Route             | Description                                           |
|-------------------|-------------------------------------------------------|
| `/`               | Protected landing page that shows the signed-in user |
| `/auth/login`     | Initiates Auth0 login                                 |
| `/auth/callback`  | Handles the Auth0 callback                            |
| `/auth/logout`    | Logs out and clears the Remix session                 |

---

## ➕ Extending the Starter

- Add new protected pages by calling `requireAuth` inside route loaders.
- Store additional profile data in the session or connect your own data source.
- Update `NavBar.tsx` and Tailwind styles to match your product branding.

---

## 📦 Build & Deployment

Create a production build with:

```bash
npm run build
```

Deploy the output in the `build/` directory to any Node.js-compatible host (e.g., AWS, Render, Railway).

---

## 🧠 About This Project

This repo is part of the **AI Remix Examples** series—lightweight Remix starters that integrate popular tools. This edition keeps only the Auth0 flow so you can layer in your own features without ripping out demo data first.
