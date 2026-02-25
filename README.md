# LinkWatcher

A single-user web app that monitors 3–8 web pages for content changes, generates AI summaries of what changed, and sends alerts via email or Slack.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | MongoDB Atlas (free tier) |
| LLM | Google Gemini 1.5 Flash (free tier) |
| Email alerts | Resend (free tier, 3k emails/mo) |
| Diff engine | diff-match-patch |
| HTML parsing | Cheerio |
| Hosting | Vercel |

---

## How to Run

### 1. Clone and install

```bash
git clone <your-repo-url>
cd linkwatcher
npm install
```

### 2. Set environment variables

Create `.env.local` in the project root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/linkwatcher?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_key_here
RESEND_API_KEY=your_resend_key_here   # optional — only needed for email alerts
```

**Where to get keys (all free):**
- **MongoDB URI** → [mongodb.com/atlas](https://mongodb.com/atlas) — free M0 cluster, no card required
- **Gemini API key** → [aistudio.google.com](https://aistudio.google.com) → Get API key, no card required
- **Resend API key** → [resend.com](https://resend.com) → free tier, no card required

### 3. Seed database indexes

```bash
npm run dev
# then visit:
curl http://localhost:3000/api/seed
# delete src/app/api/seed/ folder after running once
```

### 4. Run locally

```bash
npm run dev
# open http://localhost:3000
```

### 5. Deploy to Vercel

```bash
npm install -g vercel
vercel
# add your env variables in Vercel dashboard → Settings → Environment Variables
```

---

## Pages

| Route | Purpose |
|---|---|
| `/` | Dashboard — all links, check now, filter by project/tag |
| `/home` | Landing page with steps and feature list |
| `/status` | System health — server, MongoDB, Gemini |
| `/projects/new` | Create a new project |
| `/projects/[id]` | Project detail + alert settings |
| `/link/[id]` | Link detail — latest diff, summary, history |

---

## API Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/links` | List links (supports `?projectId=` `?tag=`) |
| POST | `/api/links` | Add a link |
| DELETE | `/api/links/:id` | Remove link + cascade delete checks |
| POST | `/api/checks/:linkId` | Trigger a check (fetch → diff → summarize → store) |
| GET | `/api/checks/:linkId` | Get last 5 checks |
| GET | `/api/checks/:linkId/:checkId` | Get single check detail |
| GET | `/api/projects` | List projects |
| POST | `/api/projects` | Create project |
| PATCH | `/api/projects/:id` | Update project / alert settings |
| DELETE | `/api/projects/:id` | Delete project (unassigns links) |
| GET | `/api/stats` | Dashboard stats (total, changes, severity counts) |
| GET | `/api/export/link/:linkId` | Export check history as JSON or CSV |
| POST | `/api/notifications/test` | Test email/Slack alert manually |
| GET | `/api/status` | Health check — server, DB, LLM |

---

## What Is Done

- Add / remove links (max 8 enforced)
- Server-side page fetch with 10s timeout and User-Agent header
- HTML normalization — strips scripts, styles, event handlers, collapses whitespace
- SHA-256 content hashing — skips diff if page unchanged
- Word-level diff via diff-match-patch with color-coded HTML output
- Snippet extraction from changed diff hunks (up to 5 per check)
- Keyword-triggered severity detection (price, terms, deprecated, security, etc.)
- LLM summary via Gemini 1.5 Flash — returns summary, highlights, severity tag
- Check history: last 5 per link, auto-pruned on insert
- Projects — group links, configure per-project alert settings
- Tags — tag links, filter by tag in sidebar
- Email alerts via Resend with styled HTML template
- Slack alerts via Incoming Webhooks with Block Kit layout
- Alert severity threshold — only notify at or above chosen level
- Notification log stored in MongoDB
- Export check history as JSON (per link)
- Status page with live MongoDB + Gemini health checks
- Landing/home page with steps and feature list
- Input validation — URL format, duplicate detection, 8-link cap, error states

---

## What Is NOT Done

These are listed in the original spec as "nice-to-have" and were intentionally skipped for MVP:

- **Automatic periodic checks** — no cron job; all checks are manual. Could add with Vercel Cron or GitHub Actions.
- **Multi-user auth** — single-user only. Could add NextAuth for multi-user.
- **JS-rendered pages** — only static HTML is fetched. Pages that require JavaScript to render (React SPAs, etc.) will return empty or partial content. Could add Playwright/Puppeteer support.
- **CSV export** — JSON export is implemented; CSV is not.
- **Email from custom domain** — Resend sends from `onboarding@resend.dev` on free tier. Configure a custom domain in Resend dashboard for production.
- **Two-check diff comparison** — history shows individual checks but does not support comparing any two arbitrary checks side-by-side.
- **Dashboard analytics / stats widgets** — stats API was designed but the frontend stats panel was not built.

---

## Known Limitations

- Pages behind login walls, paywalls, or with heavy bot protection (Cloudflare, etc.) will fail or return blocked content.
- Very large pages (>200k chars) are truncated before diffing.
- Gemini free tier is rate-limited to 15 requests/minute. Checking many links at once may hit this.
- `dangerouslySetInnerHTML` is used in DiffViewer to render diff HTML — the content is server-generated and escaped, not user input.

---

## Project Structure

```
src/
├── app/
│   ├── home/page.tsx           # Landing page
│   ├── status/page.tsx         # Health status page
│   ├── page.tsx                # Dashboard
│   ├── link/[id]/page.tsx      # Link detail
│   ├── projects/
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   └── api/
│       ├── links/route.ts
│       ├── links/[id]/route.ts
│       ├── checks/[linkId]/route.ts
│       ├── checks/[linkId]/[checkId]/route.ts
│       ├── projects/route.ts
│       ├── projects/[id]/route.ts
│       ├── status/route.ts
│       ├── export/link/[linkId]/route.ts
│       ├── stats/route.ts
│       ├── summarize/route.ts
│       └── notifications/test/route.ts
├── lib/
│   ├── mongodb.ts
│   ├── models.ts
│   ├── normalize.ts
│   ├── diff.ts
│   ├── summarize.ts
│   ├── notifications.ts
│   ├── keywords.ts
│   └── seed-indexes.ts
└── components/
    ├── AddLinkForm.tsx
    ├── LinkCard.tsx
    ├── DiffViewer.tsx
    ├── HistoryList.tsx
    ├── Sidebar.tsx
    └── ProjectForm.tsx
```