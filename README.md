# Brunel University Hackathon Management Portal

Participant and judge portals for a Brunel University hackathon. Teams register, submit an idea and a GitHub repository, and judges score projects. The leaderboard and awards are visible only to judges.

## Run

The database is a SQLite file in this project. Docker is not required.

```bash
npm install
npm run db:setup
npm run dev
```

Open http://localhost:3000.

Copy `.env.example` to `.env` if you do not already have one. Set `AUTH_URL` to the public site address in production. Set `SMTP_HOST` and the related variables when confirmation emails should leave the machine. Until then, each confirmation is stored and shown under Emails in the participant portal.

Participants create an account at `/register/participant` with a Brunel email and student ID. Judges and sponsors create an account at `/register/judge` only when they have the `JUDGE_INVITE_CODE`. Share that code privately. Student emails stay on the participant form.

## Share on Vercel

Accounts, submissions, scores, and the leaderboard are stored in one database, so every participant and judge on the public site sees the same data. The local SQLite file is only for your machine. Vercel needs a hosted database.

1. Create a free database at [Turso](https://turso.tech). Copy the database URL (`libsql://...`) and create an auth token.
2. Import the project on Vercel and set these environment variables:

```
DATABASE_URL=file:./dev.db
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-token
AUTH_SECRET=a-long-random-string-at-least-16-characters
AUTH_URL=https://your-site.vercel.app
JUDGE_INVITE_CODE=a-private-code-shared-only-with-judges
SHOW_DEMO_ACCOUNTS=false
```

3. Deploy. The build creates the tables. Participants register on the live site. Each judge or sponsor opens `/register/judge`, enters the invite code, creates an account with their own email and password, and signs in with those details. Without `JUDGE_INVITE_CODE`, judge registration stays closed.

Leave `TURSO_DATABASE_URL` empty on your own computer. `npm run dev` keeps using the local file.
