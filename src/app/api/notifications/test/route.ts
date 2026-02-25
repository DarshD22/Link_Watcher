import { NextRequest, NextResponse } from "next/server";
import { dispatchNotifications } from "@/lib/notifications";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailTo, slackWebhookUrl } = body;

    await dispatchNotifications({
      linkId: new ObjectId(),
      checkId: new ObjectId(),
      url: "https://example.com/pricing",
      label: "Test Link",
      summary: "This is a test notification from LinkWatcher.",
      severity: "major",
      changeType: "modified",
      snippets: [{ text: "Price changed from $49 to $39", context: "Pricing section" }],
      highlights: [{ title: "Price Drop", snippet: "Price changed from $49 to $39", context: "Pricing section" }],
      alertSettings: {
        emailEnabled: !!emailTo,
        emailTo,
        slackEnabled: !!slackWebhookUrl,
        slackWebhookUrl,
        severityThreshold: "minor",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}