import { NextRequest, NextResponse } from "next/server";
import { getLinksCollection, getChecksCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { fetchAndNormalize } from "@/lib/normalize";
import { computeDiff } from "@/lib/diff";
import { summarizeChange } from "@/lib/summarize";
import { Check } from "@/lib/models";
import { getProjectsCollection } from "@/lib/mongodb";
import { dispatchNotifications } from "@/lib/notifications";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params;

    if (!ObjectId.isValid(linkId)) {
      return NextResponse.json({ error: "Invalid linkId" }, { status: 400 });
    }

    const checks = await getChecksCollection();
    const result = await checks
      .find({ linkId: new ObjectId(linkId) })
      .sort({ checkedAt: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const { linkId } = await params;

    if (!ObjectId.isValid(linkId)) {
      return NextResponse.json({ error: "Invalid linkId" }, { status: 400 });
    }

    const oid = new ObjectId(linkId);
    const links = await getLinksCollection();
    const checks = await getChecksCollection();

    const link = await links.findOne({ _id: oid });
    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // 1. Fetch and normalize
    const { normalized, hash, error } = await fetchAndNormalize(link.url);

    if (error) {
      const errorCheck: Check = {
        linkId: oid,
        checkedAt: new Date(),
        snapshot: "",
        diffHtml: "",
        summary: `Fetch error: ${error}`,
        snippets: [],
        contentHash: "",
        changeType: "error",
        createdAt: new Date(),
      };
      await checks.insertOne(errorCheck);
      await links.updateOne({ _id: oid }, { $set: { lastCheckedAt: new Date() } });
      return NextResponse.json({ status: "error", summary: errorCheck.summary }, { status: 200 });
    }

    // 2. Check if content changed
    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;

    if (!force && link.lastHash && link.lastHash === hash) {
      await links.updateOne({ _id: oid }, { $set: { lastCheckedAt: new Date() } });
      return NextResponse.json({ status: "no-change", summary: "Content unchanged." });
    }

    // 3. Get previous snapshot for diff
    const lastCheck = await checks
      .find({ linkId: oid })
      .sort({ checkedAt: -1 })
      .limit(1)
      .toArray();

    const oldText = lastCheck[0]?.snapshot ?? "";
    const { diffHtml, snippets, changeType } = computeDiff(oldText, normalized);

    // 4. Summarize
    const summaryResult = await summarizeChange({
      url: link.url,
      checkedAt: new Date().toISOString(),
      snippets,
    });

    // 5. Store check
    const newCheck: Check = {
      linkId: oid,
      checkedAt: new Date(),
      snapshot: normalized,
      diffHtml,
      summary: summaryResult.summary,
      snippets,
      contentHash: hash,
      changeType: oldText === "" ? "added" : changeType,
      createdAt: new Date(),
    };

    const inserted = await checks.insertOne(newCheck);

// 6. Update link metadata
    await links.updateOne(
      { _id: oid },
      { $set: { lastCheckedAt: new Date(), lastHash: hash } }
    );

    // 7. Prune to last 5 checks
    const allChecks = await checks
      .find({ linkId: oid })
      .sort({ checkedAt: -1 })
      .toArray();

    if (allChecks.length > 5) {
      const toDelete = allChecks.slice(5).map((c) => c._id);
      await checks.deleteMany({ _id: { $in: toDelete } });
    }

    // 8. Dispatch notifications if project has alert settings
    if (link.projectId) {
      const projects = await getProjectsCollection();
      const project = await projects.findOne({ _id: link.projectId });
      if (project?.alertSettings) {
        dispatchNotifications({
          linkId: oid,
          checkId: inserted.insertedId,
          url: link.url,
          label: link.label,
          summary: summaryResult.summary,
          severity: summaryResult.severity ?? "minor",
          changeType: newCheck.changeType,
          snippets,
          highlights: summaryResult.highlights,
          alertSettings: project.alertSettings,
        }).catch(console.error); // fire and forget, don't block response
      }
    }

    return NextResponse.json({
      checkId: inserted.insertedId,
      status: changeType,
      summary: summaryResult.summary,
      highlights: summaryResult.highlights,
      severity: summaryResult.severity,
      diffHtml,
      snippets,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}