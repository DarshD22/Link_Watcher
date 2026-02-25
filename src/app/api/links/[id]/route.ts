import { NextRequest, NextResponse } from "next/server";
import { getLinksCollection, getChecksCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const oid = new ObjectId(id);
    const links = await getLinksCollection();
    const checks = await getChecksCollection();

    const result = await links.deleteOne({ _id: oid });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Cascade delete all checks for this link
    await checks.deleteMany({ linkId: oid });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}