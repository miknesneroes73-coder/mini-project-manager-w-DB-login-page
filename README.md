# Mini Project Manager — Version 3 + real DB login + frontend

This project is based directly on **Version-3-Login-Docker-PostgreSQL** from the supplied archive. The original NestJS/GraphQL/TypeORM/PostgreSQL architecture is retained. A plain HTML/CSS/JavaScript frontend has been added.

## Real login

The login is not a frontend-only fake login. The browser sends the email and password to the backend GraphQL `login` mutation. `AuthService` loads the user from PostgreSQL through `UserRepository`, verifies the stored scrypt password hash, and returns a signed JWT containing the user id, email and tenant id.

The frontend stores the returned token and sends it as `Authorization: Bearer ...` for subsequent project/phase requests. The dashboard is not shown until login succeeds.

## Demo users

Run `npm run seed:users` after the database has been started. It creates/updates these database users:

- `admin@example.com` / `Admin123!` — tenant `11111111-1111-4111-8111-111111111111`
- `tenantb@example.com` / `Admin123!` — tenant `22222222-2222-4222-8222-222222222222`

Passwords are stored as scrypt hashes, never as plain text.

## Database

Docker exposes PostgreSQL on host port **5433**:

```bash
docker compose up -d
```

Then copy `.env.example` to `.env`, install dependencies and seed the users:

```bash
npm install
npm run seed:users
npm test
npm run build
npm run start:dev
```

Backend GraphQL: `http://localhost:3000/graphql`

Frontend:

```text
cd frontend
```

Windows: `start-frontend.bat`

Mac/Linux: `./start-frontend.sh`

Frontend URL: `http://localhost:5500`

## Important

The supplied Version 3 backend already contains the real authentication logic: `AuthService`, `UserEntity`, `TypeOrmUserRepository`, scrypt password verification and signed JWT creation. The frontend uses that existing login flow rather than inventing a second authentication mechanism.
