// src/app/home/page.tsx
// A standalone landing/home page explaining LinkWatcher.
// Link this from your header or set as the root if you want a landing page before the dashboard.

export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@300;400;500&display=swap');

        .home-root {
          background: #0a0a0a;
          min-height: 100vh;
          color: #e8e8e8;
          font-family: 'DM Mono', monospace;
        }

        .home-hero {
          border-bottom: 1px solid #1a1a1a;
          padding: 80px 40px 60px;
          max-width: 860px;
          margin: 0 auto;
          position: relative;
        }

        .home-hero::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #c8ff00 40%, transparent);
        }

        .home-eyebrow {
          font-size: 10px;
          letter-spacing: 0.15em;
          color: #c8ff00;
          text-transform: uppercase;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .home-eyebrow::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: #c8ff00;
        }

        .home-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(36px, 6vw, 64px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.05;
          margin-bottom: 20px;
        }

        .home-title span { color: #c8ff00; }

        .home-subtitle {
          font-size: 14px;
          color: #666;
          line-height: 1.7;
          max-width: 520px;
          margin-bottom: 36px;
        }

        .home-cta {
          display: inline-block;
          padding: 12px 28px;
          background: #c8ff00;
          color: #0a0a0a;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          border-radius: 3px;
          transition: background 0.15s ease;
        }

        .home-cta:hover { background: #a8d600; }

        /* ── Steps ── */
        .home-steps {
          max-width: 860px;
          margin: 0 auto;
          padding: 64px 40px;
          border-bottom: 1px solid #1a1a1a;
        }

        .home-section-label {
          font-size: 10px;
          color: #444;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 32px;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2px;
        }

        .step-card {
          background: #111;
          border: 1px solid #1e1e1e;
          padding: 28px 24px;
          position: relative;
          transition: border-color 0.2s ease;
        }

        .step-card:hover { border-color: #333; }

        .step-num {
          font-family: 'Syne', sans-serif;
          font-size: 48px;
          font-weight: 800;
          color: #1e1e1e;
          line-height: 1;
          margin-bottom: 16px;
          letter-spacing: -0.04em;
        }

        .step-title {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 15px;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }

        .step-desc {
          font-size: 12px;
          color: #555;
          line-height: 1.7;
        }

        .step-accent {
          position: absolute;
          top: 0; left: 0;
          width: 3px;
          height: 0;
          background: #c8ff00;
          transition: height 0.3s ease;
        }

        .step-card:hover .step-accent { height: 100%; }

        /* ── Validation section ── */
        .home-validation {
          max-width: 860px;
          margin: 0 auto;
          padding: 64px 40px;
          border-bottom: 1px solid #1a1a1a;
        }

        .validation-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 600px) {
          .validation-grid { grid-template-columns: 1fr; }
        }

        .validation-card {
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 4px;
          padding: 20px;
        }

        .validation-label {
          font-size: 10px;
          letter-spacing: 0.1em;
          color: #444;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .validation-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 10px;
          font-size: 12px;
          line-height: 1.5;
        }

        .vi-icon { flex-shrink: 0; margin-top: 2px; }
        .vi-ok { color: #c8ff00; }
        .vi-err { color: #ff4444; }
        .vi-text { color: #888; }

        /* ── Features ── */
        .home-features {
          max-width: 860px;
          margin: 0 auto;
          padding: 64px 40px;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .feature-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid #161616;
          font-size: 13px;
        }

        .feature-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c8ff00;
          flex-shrink: 0;
        }

        .feature-name { color: #e8e8e8; flex: 1; }
        .feature-status {
          font-size: 10px;
          letter-spacing: 0.06em;
          padding: 2px 8px;
          border-radius: 2px;
          border: 1px solid;
        }

        .fs-done { color: #c8ff00; border-color: #c8ff00; }
        .fs-optional { color: #555; border-color: #333; }

        /* ── Footer ── */
        .home-footer {
          border-top: 1px solid #1a1a1a;
          padding: 24px 40px;
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
          color: #333;
        }
        .home-nav-link {
          font-size: 11px;
          color: #666;
          text-decoration: none;
          letter-spacing: 0.06em;
          transition: color 0.15s ease;
        }

        .home-nav-link:hover {
          color: #c8ff00;
        }
      `}</style>

      <div className="home-root">

        {/* Navigation Header */}
        <div style={{
          padding: "16px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #1a1a1a",
          maxWidth: 860,
          margin: "0 auto",
          width: "100%"
        }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 12, color: "#c8ff00", letterSpacing: "0.08em" }}>
            LINKWATCHER
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="/dashboard" className="home-nav-link">
              Dashboard
            </a>
            <a href="/status" className="home-nav-link">
              Status
            </a>
          </div>
        </div>

        {/* ── Hero ── */}
        <section className="home-hero">
          <div className="home-eyebrow">Page change monitor</div>
          <h1 className="home-title">
            Watch pages.<br />
            Catch <span>changes.</span><br />
            Stay informed.
          </h1>
          <p className="home-subtitle">
            LinkWatcher monitors up to 8 web pages and alerts you the moment something changes —
            pricing, policies, docs, anything. Powered by LLM-generated summaries and visual diffs.
          </p>
          <a href="/dashboard" className="home-cta">Open Dashboard →</a>
        </section>

        {/* ── How it works ── */}
        <section className="home-steps">
          <div className="home-section-label">How it works — 4 steps</div>
          <div className="steps-grid">
            {[
              {
                n: "01",
                title: "Add a link",
                desc: "Paste any URL — pricing page, docs, policy, changelog. Add a label and optional project tag.",
              },
              {
                n: "02",
                title: "Click Check Now",
                desc: "LinkWatcher fetches the page server-side, strips noise, and computes a content hash.",
              },
              {
                n: "03",
                title: "See the diff",
                desc: "If something changed, you get a color-coded diff — green for additions, red for removals.",
              },
              {
                n: "04",
                title: "Read the summary",
                desc: "An AI summary explains what changed in plain English, with severity: minor, moderate, or major.",
              },
            ].map((s) => (
              <div className="step-card" key={s.n}>
                <div className="step-accent" />
                <div className="step-num">{s.n}</div>
                <div className="step-title">{s.title}</div>
                <div className="step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Input validation ── */}
        <section className="home-validation">
          <div className="home-section-label">Input handling</div>
          <div className="validation-grid">
            <div className="validation-card">
              <div className="validation-label">What we accept</div>
              {[
                "Valid http:// or https:// URLs",
                "Optional label (any text)",
                "Tags as comma-separated words",
                "1–8 links total per account",
                "Pages with static HTML content",
              ].map((t) => (
                <div className="validation-item" key={t}>
                  <span className="vi-icon vi-ok">✓</span>
                  <span className="vi-text">{t}</span>
                </div>
              ))}
            </div>
            <div className="validation-card">
              <div className="validation-label">What we reject / warn about</div>
              {[
                "Invalid or malformed URLs → shown inline",
                "Duplicate URLs → rejected with message",
                "More than 8 links → blocked with cap notice",
                "JS-rendered pages → warns content may be empty",
                "Non-200 responses → stored as error check",
                "429 rate-limited pages → surfaced with retry hint",
              ].map((t) => (
                <div className="validation-item" key={t}>
                  <span className="vi-icon vi-err">✕</span>
                  <span className="vi-text">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature list ── */}
        <section className="home-features">
          <div className="home-section-label">Feature status</div>
          <div className="feature-list">
            {[
              ["Add / remove links (max 8)", true],
              ["Server-side fetch + HTML normalization", true],
              ["Content hash comparison (no false positives)", true],
              ["Word-level diff with color-coded HTML", true],
              ["LLM summary via Gemini (free tier)", true],
              ["Severity tagging — minor / moderate / major", true],
              ["Keyword-triggered severity boost", true],
              ["Check history (last 5 per link)", true],
              ["Projects & tag grouping", true],
              ["Sidebar filter by project / tag / severity", true],
              ["Email alerts via Resend (free tier)", true],
              ["Slack webhook alerts", true],
              ["Export history as JSON", true],
              ["Automatic periodic checks (cron)", false],
              ["Multi-user auth", false],
              ["JS-rendered page support (Playwright)", false],
              ["CSV export", false],
            ].map(([name, done]) => (
              <div className="feature-row" key={name as string}>
                <div className="feature-dot" style={{ background: done ? "#c8ff00" : "#222" }} />
                <span className="feature-name">{name as string}</span>
                <span className={`feature-status ${done ? "fs-done" : "fs-optional"}`}>
                  {done ? "done" : "optional"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <footer className="home-footer">
          <span>LINKWATCHER — MVP</span>
          <a href="/status" style={{ color: "#444", textDecoration: "none" }}>System Status →</a>
        </footer>

      </div>
    </>
  );
}