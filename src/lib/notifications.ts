import { Resend } from "resend";
import { ObjectId } from "mongodb";
import { getNotificationsCollection } from "./mongodb";
import { Snippet } from "./models";

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotifyPayload {
  linkId: ObjectId;
  checkId: ObjectId;
  url: string;
  label?: string;
  summary: string;
  severity: "minor" | "moderate" | "major";
  changeType: string;
  snippets: Snippet[];
  highlights?: { title: string; snippet: string; context: string }[];
  alertSettings: {
    emailEnabled: boolean;
    emailTo?: string;
    slackEnabled: boolean;
    slackWebhookUrl?: string;
    severityThreshold: "minor" | "moderate" | "major";
  };
}

// ─── Severity helpers ─────────────────────────────────────────────────────────

const SEVERITY_RANK = { minor: 0, moderate: 1, major: 2 };

function meetsThreshold(
  severity: "minor" | "moderate" | "major",
  threshold: "minor" | "moderate" | "major"
): boolean {
  return SEVERITY_RANK[severity] >= SEVERITY_RANK[threshold];
}

const SEVERITY_COLOR = {
  minor: "#555555",
  moderate: "#ffaa00",
  major: "#ff4444",
};

const SEVERITY_EMOJI = {
  minor: "🟡",
  moderate: "🟠",
  major: "🔴",
};

// ─── Email ────────────────────────────────────────────────────────────────────

function buildEmailHtml(payload: NotifyPayload): string {
  const { url, label, summary, severity, snippets, highlights } = payload;
  const color = SEVERITY_COLOR[severity];

  const snippetRows = (highlights ?? snippets.slice(0, 2).map((s) => ({
    title: "Change detected",
    snippet: s.text,
    context: s.context,
  }))).slice(0, 3).map(
    (h) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #222;">
        <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">
          ${h.context}
        </div>
        <div style="font-size:13px;color:#e8e8e8;font-family:monospace;">
          "${h.snippet}"
        </div>
      </td>
    </tr>`
  ).join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'DM Mono',monospace,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;border-radius:6px;overflow:hidden;">

        <!-- Header -->
        <tr>
          <td style="padding:20px 28px;border-bottom:1px solid #222;background:#0d0d0d;">
            <span style="font-size:18px;font-weight:800;color:#c8ff00;letter-spacing:-0.03em;">
              LINK<span style="color:#e8e8e8;">WATCHER</span>
            </span>
            <span style="font-size:10px;color:#555;margin-left:10px;letter-spacing:0.08em;">
              PAGE CHANGE ALERT
            </span>
          </td>
        </tr>

        <!-- Severity banner -->
        <tr>
          <td style="padding:14px 28px;background:${color}18;border-bottom:1px solid ${color}44;">
            <span style="font-size:11px;font-weight:700;color:${color};letter-spacing:0.1em;text-transform:uppercase;">
              ${SEVERITY_EMOJI[severity]} ${severity} change detected
            </span>
          </td>
        </tr>

        <!-- Link info -->
        <tr>
          <td style="padding:20px 28px;border-bottom:1px solid #222;">
            <div style="font-size:11px;color:#555;letter-spacing:0.06em;margin-bottom:4px;">MONITORED PAGE</div>
            <div style="font-size:15px;font-weight:700;color:#e8e8e8;margin-bottom:6px;">${label || new URL(url).hostname}</div>
            <a href="${url}" style="font-size:12px;color:#555;text-decoration:none;">${url}</a>
          </td>
        </tr>

        <!-- Summary -->
        <tr>
          <td style="padding:20px 28px;border-bottom:1px solid #222;">
            <div style="font-size:11px;color:#555;letter-spacing:0.06em;margin-bottom:8px;">SUMMARY</div>
            <div style="font-size:13px;color:#e8e8e8;line-height:1.6;">${summary}</div>
          </td>
        </tr>

        <!-- Snippets -->
        ${snippetRows ? `
        <tr>
          <td style="padding:20px 28px;border-bottom:1px solid #222;">
            <div style="font-size:11px;color:#555;letter-spacing:0.06em;margin-bottom:8px;">KEY CHANGES</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${snippetRows}
            </table>
          </td>
        </tr>` : ""}

        <!-- CTA -->
        <tr>
          <td style="padding:20px 28px;">
            <a href="${url}" target="_blank"
               style="display:inline-block;padding:10px 20px;background:#c8ff00;color:#0a0a0a;
                      font-size:12px;font-weight:700;text-decoration:none;border-radius:3px;
                      letter-spacing:0.06em;text-transform:uppercase;">
              View Page →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:14px 28px;background:#0d0d0d;border-top:1px solid #222;">
            <span style="font-size:10px;color:#333;letter-spacing:0.06em;">
              Sent by LinkWatcher · You are receiving this because this page is being monitored.
            </span>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendEmail(payload: NotifyPayload): Promise<boolean> {
  const { alertSettings, label, url, severity } = payload;

  if (!alertSettings.emailTo) {
    console.warn("Email enabled but no emailTo set — skipping.");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: "LinkWatcher <onboarding@resend.dev>", // use resend's default sandbox sender
      to: alertSettings.emailTo,
      subject: `[${severity.toUpperCase()}] Change detected on ${label || new URL(url).hostname}`,
      html: buildEmailHtml(payload),
    });

    if (error) {
      console.error("Resend error:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Email send failed:", err);
    return false;
  }
}

// ─── Slack ────────────────────────────────────────────────────────────────────

async function sendSlack(payload: NotifyPayload): Promise<boolean> {
  const { alertSettings, url, label, summary, severity, highlights, snippets } = payload;

  if (!alertSettings.slackWebhookUrl) {
    console.warn("Slack enabled but no webhookUrl set — skipping.");
    return false;
  }

  const color = severity === "major" ? "#ff4444" : severity === "moderate" ? "#ffaa00" : "#555555";

  const topSnippets = (highlights ?? snippets.slice(0, 2).map((s) => ({
    title: "Change",
    snippet: s.text,
    context: s.context,
  }))).slice(0, 2);

  const fields = topSnippets.map((h) => ({
    title: h.context,
    value: `_"${h.snippet}"_`,
    short: false,
  }));

  const slackBody = {
    attachments: [
      {
        color,
        blocks: [
          {
            type: "header",
            text: {
              type: "plain_text",
              text: `${SEVERITY_EMOJI[severity]} ${severity.toUpperCase()} change — ${label || new URL(url).hostname}`,
            },
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: summary },
          },
          {
            type: "section",
            fields: [
              { type: "mrkdwn", text: `*URL:*\n<${url}|${url}>` },
              { type: "mrkdwn", text: `*Severity:*\n${severity}` },
            ],
          },
          ...(fields.length > 0
            ? [
                { type: "divider" },
                {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: fields.map((f) => `*${f.title}*\n${f.value}`).join("\n\n"),
                  },
                },
              ]
            : []),
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "View Page" },
                url,
                style: "primary",
              },
            ],
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(alertSettings.slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackBody),
    });

    if (!res.ok) {
      console.error("Slack webhook failed:", res.status, await res.text());
      return false;
    }

    return true;
  } catch (err) {
    console.error("Slack send failed:", err);
    return false;
  }
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

export async function dispatchNotifications(payload: NotifyPayload): Promise<void> {
  const { alertSettings, severity, linkId, checkId } = payload;

  if (!meetsThreshold(severity, alertSettings.severityThreshold)) return;

  const notifications = await getNotificationsCollection();
  const tasks: Promise<{ type: "email" | "slack"; ok: boolean }>[] = [];

  if (alertSettings.emailEnabled) {
    tasks.push(sendEmail(payload).then((ok) => ({ type: "email" as const, ok })));
  }

  if (alertSettings.slackEnabled) {
    tasks.push(sendSlack(payload).then((ok) => ({ type: "slack" as const, ok })));
  }

  const results = await Promise.allSettled(tasks);

  // Store notification records
  for (const result of results) {
    if (result.status === "fulfilled") {
      const { type, ok } = result.value;
      await notifications.insertOne({
        linkId,
        checkId,
        type,
        status: ok ? "sent" : "failed",
        sentAt: new Date(),
      });
    }
  }
}