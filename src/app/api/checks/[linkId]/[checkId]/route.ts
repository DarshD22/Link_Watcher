import { NextRequest, NextResponse } from "next/server";
import { getChecksCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ linkId: string; checkId: string }> }
) {
  try {
    const { linkId, checkId } = await params;

    if (!ObjectId.isValid(linkId) || !ObjectId.isValid(checkId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const checks = await getChecksCollection();
    const check = await checks.findOne({
      _id: new ObjectId(checkId),
      linkId: new ObjectId(linkId),
    });

    if (!check) {
      return NextResponse.json({ error: "Check not found" }, { status: 404 });
    }

    return NextResponse.json(check);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}