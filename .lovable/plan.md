## Direction change: populate, don't create

You're right — we have enough pages. The problem is empty tables. This turn is about **filling the existing product with realistic, coherent demo data** so every workspace looks alive, and a focused **design polish pass** on top. No new CRUD pages.

## What I will do

### 1. Master seed migration (one migration, idempotent)

A single SQL migration that inserts a large, coherent, cross-linked dataset into the existing tables. Idempotent via stable synthetic UUIDs + `ON CONFLICT DO NOTHING`, so re-runs don't duplicate and real user data is never touched.

**Demo companies (12)** — realistic brands with logos (Dicebear-generated avatar URLs, stored in `profiles.avatar_url`): Northwind Analytics, Helios Robotics, Kestrel Bank, Lumen Health, Meridian Retail, Orbit Logistics, Prism Media, Solstice Energy, Tessera Games, Vantage Legal, Voyage Travel, Zenith Foods. Each gets a `profiles` row with role=`company`, headline, bio, location, website.

**Demo candidates (120)** — realistic names, roles, locations, skills, education/experience JSON, avatar URLs, `is_public=true`, `completion_pct` populated by trigger. Names drawn from a mixed international pool so lists don't look generated.

**Jobs (36)** — 3 per company, spanning PM, Design, Data, Eng, Ops, Marketing, Sales. Real titles, salary bands, remote/hybrid/onsite, requirements arrays, `status='published'`.

**Challenges (24)** — 2 per company, real briefs (e.g. "Design a churn-reduction experiment for a D2C skincare brand", "Build a fraud-scoring rubric for SMB lending"), difficulty, duration, evidence dimensions, `status='published'`.

**Applications (~280)** — candidates spread across jobs with realistic status distribution (submitted / in_review / interview / offer / rejected).

**Submissions + attempts (~180)** — with scores 45–95, AI feedback text, links to challenges. Scores ≥70 auto-fire the certificate trigger, so **certificates populate for free**.

**Message threads + messages (~90 threads, ~400 messages)** — candidate ↔ company conversations tied to real applications, mix of read/unread, realistic recruiter tone.

**Notifications (~600)** — profile viewed, challenge invitation, interview scheduled, certificate earned, application status changes, job recommendations. Mix of read/unread across the last 30 days.

**Campaigns (~20)** — active/paused hiring campaigns per company with metrics.

**Interview sessions (~40)** — completed AI interview transcripts with turns and summaries.

**Saved jobs (~200)** — candidates ↔ jobs.

All timestamps back-dated across the last 90 days with a realistic distribution (not all "just now").

### 2. Demo-account access

- Ensure the currently signed-in demo candidate (`useAuth().user`) sees populated data by also inserting rows scoped to their id when they belong to the demo cohort — or, simpler and safer: keep the seed under demo user ids and add a small helper so the Candidate workspace, when the current user has no rows, transparently displays the "demo candidate" cohort's data read-only. I'll implement the first approach for the currently signed-in candidate account you're testing with; tell me the email and I'll wire their id in.
- For company + university demo review, I'll create one seed company account + one seed university account with known emails (`demo-company@proofolio.dev`, `demo-university@proofolio.dev`) via the auth admin API inside a one-shot server function, then link them as owners of the seeded companies/universities.

### 3. University seed

Populate `profiles` (role=university) for 4 universities, link ~40 seeded candidates as their students via a lightweight `university_students` join we already have or add if missing (I'll check first, no schema change if avoidable), seed partnership_requests and campus challenge rows.

### 4. Design polish pass (no restructure)

Scoped, surgical, no redesign:
- Refine tokens in `src/styles.css`: tighter type scale, better line-heights, richer surface tokens, subtle gradient tokens (`--gradient-surface`, `--gradient-primary-soft`), refined shadow tokens (`--shadow-card`, `--shadow-elev`, `--shadow-glow`).
- Upgrade the shared card treatment used across dashboards: softer border, layered shadow, hover lift + border-tint transition.
- Upgrade `PageHeader` spacing + tracking.
- Upgrade `DashboardShell` sidebar: active-state pill, section labels, denser rhythm.
- Add a reusable `StatCard` and `TrendSparkline` used by Overview / Analytics.
- Replace the plain `<Badge>` status pills with tone-aware variants already present but with tuned contrast.
- Nothing gets removed. No route changes.

### 5. Verify

- `tsgo --noEmit` + `bun run build`.
- Playwright: log in as the demo candidate, walk Challenges → Results → Jobs → Applications → Certificates → Messages → Notifications, screenshot each, confirm they're populated. Same for company demo account across Overview / Jobs / Candidates / Analytics / Messages.
- Report row counts per table after seed.

## Out of scope for this turn

- No new routes.
- No schema changes unless a seed insert requires one (I'll call it out and ask first).
- No AI Career Roadmap / Interview Prep rebuild — those are net-new features, not populate work; I'll queue them for a follow-up turn.
- No Billing UI rebuild — surfacing usage/invoices needs Stripe wiring; I'll queue it separately.

## One thing I need from you before I run this

Please confirm:
1. **Your demo candidate email** (the account you're logged in as at `/candidate/*`) so I can attach the seeded applications/submissions/messages/certificates/notifications to *your* user id — otherwise your workspace will still look empty even after the seed lands.
2. OK to create `demo-company@proofolio.dev` and `demo-university@proofolio.dev` with a shared password you choose, so you can log in and see the Company/University sides populated too?

Once you confirm those two, I'll ship the seed + polish pass in one go.