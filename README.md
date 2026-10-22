# TruckWheel — Vehicle Listing & Management Platform

TruckWheel is a web application project for browsing and managing vehicle listings. The repository contains a React/Vite frontend and a Node.js/Express backend that connects to a MySQL database.

## Technology stack

- **Frontend:** React, Vite, JavaScript, CSS, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL (`mysql2`)
- **Authentication-related libraries:** bcrypt, JSON Web Token, Express sessions
- **API testing:** Postman (optional)

> This README describes the technologies found in the project files. Some advanced features may still require implementation or configuration.

## Project structure

```text
Truckspull/
├── TrucksWheel/          # React + Vite frontend
│   ├── src/
│   ├── images/
│   ├── package.json
│   └── vite.config.js
├── server/               # Express backend
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── .gitignore
├── package.json
└── package-lock.json
```

## Requirements

Install:

- Node.js (LTS recommended)
- MySQL Server
- npm (included with Node.js)

## Setup

### 1. Configure the backend

Open a terminal:

```bash
cd server
npm install
```

Copy `.env.example` to a new file named `.env`, then update the database settings:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_local_mysql_password
DB_NAME=reacttruckwheel
PORT=3000
NODE_ENV=development
```

Create the configured MySQL database before starting the backend. The application currently expects the database and relevant tables to be available; review `server.js` and your local database schema to confirm all required tables exist.

Start the backend:

```bash
npm start
```

The backend package uses `nodemon` for its start script.

### 2. Start the frontend

Open a second terminal:

```bash
cd TrucksWheel
npm install
npm run dev
```

Vite will print the local development URL in the terminal, commonly `http://localhost:5173`.

The frontend currently calls backend endpoints at `http://localhost:3000`. If you change the backend port or deploy the application, update the frontend API URLs and CORS configuration accordingly.

## Environment and security notes

- Do not commit `.env` files, database passwords, API keys, access tokens, or private keys.
- The root `.gitignore` excludes dependency folders and environment files.
- `server/.env.example` contains placeholders only; copy it to `.env` for local development.
- The admin login screen originally contained hard-coded client-side credentials. Those credentials have been removed. The admin login form must be connected to a secure backend authentication flow before admin access is enabled.
- The `/api/test-db` diagnostic endpoint is restricted to `NODE_ENV=development`. Do not enable development mode in a public production deployment.
- Before deployment, review authorization, session/JWT handling, CORS settings, error responses, and database permissions.

## Current project scope

The codebase includes vehicle listing pages and components, frontend authentication forms, an Express backend, and MySQL integration. Availability of individual flows depends on the backend routes, database schema, and local configuration.

## License

No license has been specified. Add a license file if you intend to define permissions for reuse or redistribution.
