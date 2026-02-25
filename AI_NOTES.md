# AI Notes

A transparent account of how AI tools were used in this project, what was generated, and what was reviewed or debugged manually.

---

## Tools Used

| Tool | Role |
|---|---|
| ChatGPT | Planning, architecture design, feature spec, data model design |
| Claude | Code generation — all implementation files |
| Developer (me) | Debugging, integration testing, environment setup, fixes |

---

## What ChatGPT Was Used For

ChatGPT was used in the **planning and design phase** before any code was written:

- **System architecture** — deciding on Next.js + MongoDB Atlas + Vercel as the stack
- **Feature specification** — the full Phase 1 (MVP) and Phase 2 (nice-to-have) feature lists
- **Data model design** — the MongoDB collections (`links`, `checks`, `projects`, `notifications`) and their field shapes
- **API contract** — the full list of API routes and their request/response shapes
- **LLM prompt design** — the summarizer prompt template (JSON output format, severity rules, highlights structure)
- **Backend flow design** — the step-by-step pipeline: fetch → normalize → hash → diff → summarize → store → notify → prune
- **UI page structure** — which pages to build and what components belong on each

The output of this phase was a detailed spec document (the one passed to Claude for implementation).

---

## What Claude Was Used For

Claude was used for **all implementation** — translating the spec into working code:

- `src/lib/mongodb.ts` — connection singleton with dev/prod handling
- `src/lib/models.ts` — TypeScript interfaces for all collections
- `src/lib/normalize.ts` — fetch + Cheerio-based HTML normalization + SHA-256 hashing
- `src/lib/diff.ts` — diff-match-patch wrapper, diffHtml builder, snippet extractor
- `src/lib/summarize.ts` — Gemini API call with JSON output parsing and fallback
- `src/lib/keywords.ts` — keyword list and severity merger
- `src/lib/notifications.ts` — Resend email (HTML template) + Slack Block Kit dispatcher
- `src/lib/seed-indexes.ts` — MongoDB index setup
- All API route files under `src/app/api/`
- All page and component files under `src/app/` and `src/components/`
- `src/app/home/page.tsx` — landing page
- `src/app/status/page.tsx` + `src/app/api/status/route.ts` — health check system
- `README.md` and `AI_NOTES.md` — this documentation

Code was generated **iteratively, step by step** — not as a single dump. Each section (models → API → frontend → notifications → projects) was generated in a separate session step, reviewed, and then the next step was requested.

---

## What I Checked and Did Myself

- **Environment setup** — created MongoDB Atlas cluster, got Gemini API key from Google AI Studio, set up Resend account
- **Index seeding** — ran `/api/seed` manually and verified indexes in Atlas UI
- **Integration testing** — added real URLs (Vercel pricing, MDN docs, Fly.io policy) and triggered checks manually to verify the full pipeline worked end-to-end
- **Debugging** — fixed several issues that came up during testing:
  - Cheerio import syntax changed between versions; updated `import * as cheerio` to named import
  - `diff-match-patch` types package needed separate install (`@types/diff-match-patch`)
  - Gemini response occasionally returned markdown fences around JSON; added `.replace(/\`\`\`json|\`\`\`/g, '')` strip
  - MongoDB ObjectId serialization to JSON required `.toString()` in a few places
  - `useSearchParams` in Next.js App Router required wrapping in `Suspense` boundary in some pages
- **Slack webhook setup** — created a Slack app, configured Incoming Webhooks, tested with curl
- **Resend sender** — verified that the free sandbox sender (`onboarding@resend.dev`) works without domain setup
- **Deployment** — pushed to Vercel, added env variables in Vercel dashboard, verified production build

---

## Honest Assessment

The AI-generated code was **mostly correct** but required real debugging and environment work to run. The planning (ChatGPT) gave a solid, well-structured spec that made Claude's code generation much more focused and accurate than it would have been with vague prompts.

The parts that needed the most manual attention were:
- Package version compatibility (Cheerio, diff-match-patch)
- Next.js App Router-specific patterns (Suspense, route params typing)
- Environment and credentials setup (entirely manual)
- Verifying the full pipeline actually worked with real URLs (not just in theory)

The AI tools saved significant time on boilerplate and structure. The developer's role shifted from writing code to **reviewing, debugging, and integrating** it.