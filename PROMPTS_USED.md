# Prompts Used

A record of the prompts used to plan and build LinkWatcher, in order.
ChatGPT was used for planning and architecture. Claude was used for all code generation.

---

## ChatGPT — Planning & Architecture

**Prompt:**

> Personal "Web Monitor + Summary"
>
> Build a web app where I can:
> * Add 3–8 links I care about (pricing page, docs page, policy page)
> * Click "check now" to fetch them
> * The app shows what changed since last check (diff view)
> * The app generates a short summary of changes with citations/snippets
> * Keep a history of the last 5 checks per link
>
> Make it your own: for example, add alerts, tags, or grouping by project.
>
> The tech stack can be Next.js or the MERN stack, whichever you see fit. I want to make a working application rather than a feature-overloaded production-grade public app. You have to design the app and plan the architecture of the project. Generate a project structure, app features, frontend and backend structures, database tables, etc., everything clearly organized.
>
> Note: I will use Claude for coding, so don't generate any code.

ChatGPT produced: tech stack recommendation (Next.js + MongoDB), MVP feature list, data models (`links`, `checks`, `projects`, `notifications`), API contract, backend flow, LLM prompt template, UI component list, and dev task checklist. That output was passed as context to Claude for all subsequent coding steps.

---

## Claude — Phase 1 (MVP)

### Step 1 — Project Init & Folder Structure

> See, you don't have to do everything at once. We will go step by step, generating code for the application part by part.
> Do not use conversational fillers, preambles, or post-session summaries. Provide only requested.

> Q: Where do we start?
> A: Next.js project init + folder structure

Claude produced: `npx create-next-app` command with flags, full `src/` folder structure, `.env.local` template, and `src/lib/models.ts` with TypeScript interfaces for `Link`, `Snippet`, and `Check`.

---

### Step 2 — MongoDB Connection + Models

> Yes proceed to next step

Claude produced: `src/lib/mongodb.ts` (connection singleton with dev/prod global caching), `src/lib/seed-indexes.ts` (index setup for `links.url`, `checks.linkId + checkedAt`), and a one-time `GET /api/seed` route.

---

### Step 3 — Core Library Files

> What about other models normalize.ts, diff.ts, summarize.ts

Claude produced:

- `src/lib/normalize.ts` — server-side fetch with 10s timeout, Cheerio-based HTML stripping (scripts, styles, event handlers), whitespace collapse, SHA-256 hash
- `src/lib/diff.ts` — diff-match-patch wrapper, semantic cleanup, `diffHtml` builder with `<ins>`/`<del>` spans, snippet extractor (up to 5 changed hunks with context)
- `src/lib/summarize.ts` — LLM API call, JSON output parsing with markdown fence strip, graceful fallback if no API key

---

### Step 4 — API Routes

> Yes now its time for API routes.

Claude produced all Next.js App Router API routes:

- `POST /api/links` — add link, enforce 8-link cap, reject duplicates (HTTP 409)
- `GET /api/links` — list all links sorted newest first
- `DELETE /api/links/:id` — remove link + cascade delete all its checks
- `POST /api/checks/:linkId` — full pipeline: fetch → normalize → hash compare → diff → summarize → store → prune to 5
- `GET /api/checks/:linkId` — last 5 checks for a link
- `GET /api/checks/:linkId/:checkId` — single check detail
- `POST /api/summarize` — internal LLM summarizer endpoint

---

### Step 5 — Frontend Components & Pages

> Yes generate frontend components

Claude produced (dark industrial design, Syne + DM Mono fonts, acid green `#c8ff00` accent):

- `src/app/globals.css` — full design system with CSS variables, diff color tokens, button/card/tag utility classes, animations
- `src/components/AddLinkForm.tsx` — expandable inline form with URL validation and error display
- `src/components/DiffViewer.tsx` — renders `diffHtml` with legend for added/removed/unchanged
- `src/components/HistoryList.tsx` — accordion list of last 5 checks, each expandable to snippets + diff
- `src/components/LinkCard.tsx` — URL, label, tags, last-checked time, inline check result with severity badge
- `src/app/layout.tsx` — sticky header with logo
- `src/app/page.tsx` — dashboard with Check All and link count
- `src/app/link/[id]/page.tsx` — link detail with latest check, snippets, diff viewer, history, JSON export

---

## Claude — Phase 2 (Nice-to-Have Features)

### Step 6 — DB Schema Updates + New Models

> Again went to chatgpt to plan and design the nice-to-have features and provided Claude with a ready to use prompt for Phase 2 development

Claude produced:
> Q: Which features do you want to build in Phase 2?
> A: Alerts (Email + Slack), Tags & Project Grouping, Dashboard Stats, Export (JSON/CSV)
>
> Q: Where do we start?
> A: DB schema updates + new models


- `src/lib/models.ts` updated — added `Project`, `Notification`, `AlertSettings` interfaces; extended `Link` with `projectId`, `checkFrequency`; extended `Check` with `severity`, `keywordTriggers`
- `src/lib/mongodb.ts` updated — added `getProjectsCollection()`, `getNotificationsCollection()`
- `src/lib/seed-indexes.ts` updated — added indexes for `projects.name` (unique), `notifications.linkId`, `checks.severity`, optional 90-day TTL
- `src/lib/keywords.ts` — new file; keyword lists for major/moderate severity, `detectKeywords()` and `mergeSeverity()` helpers

---

### Step 7 — Notification Service

> Yes go ahead for notification service

Claude produced `src/lib/notifications.ts`:

- `sendEmail()` — Resend API call with styled dark HTML email template matching app design
- `sendSlack()` — Slack Incoming Webhook with Block Kit: severity color bar, summary, snippets, View Page button
- `dispatchNotifications()` — severity threshold gate, fires both channels in parallel, stores sent/failed records in `notifications` collection
- `POST /api/notifications/test` — test endpoint for verifying email and Slack before going live
- Wired into `POST /api/checks/:linkId` as a non-blocking fire-and-forget after check completes

---

### Step 8 — Projects & Tags API + UI

> Yes go for next step

Claude produced:

- `POST/GET /api/projects` — create and list projects (name unique index, 409 on duplicate)
- `GET/PATCH/DELETE /api/projects/:id` — manage single project; DELETE unassigns links rather than deleting them
- `GET /api/links` updated — supports `?projectId=` and `?tag=` query filters
- `POST /api/links` updated — accepts `projectId` and `checkFrequency` fields
- `src/components/Sidebar.tsx` — sticky sidebar with Projects, Tags, Severity filter using Next.js `useSearchParams` for URL-driven state
- `src/components/ProjectForm.tsx` — create/edit form with name, description, email toggle + address, Slack toggle + webhook URL, severity threshold picker
- `src/app/projects/new/page.tsx` — new project page
- `src/app/projects/[id]/page.tsx` — project detail with inline edit, delete, and filtered link list
- `src/app/page.tsx` updated — sidebar layout, filter-aware link fetching, dynamic heading
- `src/components/AddLinkForm.tsx` updated — project selector dropdown (fetched on open)

---

### Step 9 — Stats API + Dashboard Panel

> Hey sorry i forgot stats api + dashboard page that we were just about to do. So complete those

Claude produced:

- `GET /api/stats` — MongoDB aggregation: total links, changes in last 7 days, severity counts (major/moderate/minor), most active link by change frequency, day-by-day change counts for last 7 days (sparkline data)
- `src/components/StatsPanel.tsx` — four stat cards + CSS bar sparkline for 7-day activity + most active link row; fetched client-side on mount with skeleton loading state
- `src/app/page.tsx` updated — StatsPanel inserted between header and links list

---

