import { NextResponse } from "next/server";
import { getLinksCollection, getChecksCollection } from "@/lib/mongodb";

export async function GET() {
  try {
    const links = await getLinksCollection();
    const checks = await getChecksCollection();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalLinks,
      changesLast7Days,
      majorChanges,
      moderateChanges,
      minorChanges,
      recentChecks,
    ] = await Promise.all([
      links.countDocuments(),

      checks.countDocuments({
        checkedAt: { $gte: sevenDaysAgo },
        changeType: { $in: ["modified", "added"] },
      }),

      checks.countDocuments({ severity: "major" }),
      checks.countDocuments({ severity: "moderate" }),
      checks.countDocuments({ severity: "minor" }),

      checks
        .find({ changeType: { $in: ["modified", "added"] } })
        .sort({ checkedAt: -1 })
        .limit(50)
        .toArray(),
    ]);

    // Find most active link (most changes total)
    const linkChangeCounts: Record<string, number> = {};
    for (const c of recentChecks) {
      const id = c.linkId.toString();
      linkChangeCounts[id] = (linkChangeCounts[id] ?? 0) + 1;
    }

    let topChangingLink = null;
    if (Object.keys(linkChangeCounts).length > 0) {
      const topId = Object.entries(linkChangeCounts).sort((a, b) => b[1] - a[1])[0][0];
      const topLink = await links.findOne({ _id: { $in: recentChecks.map((c) => c.linkId) } });
      if (topLink) {
        topChangingLink = {
          label: topLink.label || topLink.url,
          url: topLink.url,
          changeCount: linkChangeCounts[topId],
        };
      }
    }

    // Changes per day for last 7 days (sparkline data)
    const dailyCounts: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await checks.countDocuments({
        checkedAt: { $gte: dayStart, $lte: dayEnd },
        changeType: { $in: ["modified", "added"] },
      });

      dailyCounts.push({
        date: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
        count,
      });
    }

    return NextResponse.json({
      totalLinks,
      changesLast7Days,
      majorChanges,
      moderateChanges,
      minorChanges,
      topChangingLink,
      dailyCounts,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}