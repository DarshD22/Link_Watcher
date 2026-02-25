import { NextRequest, NextResponse } from "next/server";
import { getProjectsCollection, getLinksCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const projects = await getProjectsCollection();
    const project = await projects.findOne({ _id: new ObjectId(id) });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(project);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await req.json();
    const { name, description, alertSettings } = body;

    const update: Record<string, any> = {};
    if (name) update.name = name.trim();
    if (description !== undefined) update.description = description.trim();
    if (alertSettings) update.alertSettings = alertSettings;

    const projects = await getProjectsCollection();
    await projects.updateOne({ _id: new ObjectId(id) }, { $set: update });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!ObjectId.isValid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const oid = new ObjectId(id);
    const projects = await getProjectsCollection();
    const links = await getLinksCollection();

    const result = await projects.deleteOne({ _id: oid });
    if (result.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Unassign links from this project (don't delete them)
    await links.updateMany({ projectId: oid }, { $set: { projectId: null } });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}