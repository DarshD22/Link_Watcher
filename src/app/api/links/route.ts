import { NextRequest, NextResponse } from "next/server";
import { getLinksCollection } from "@/lib/mongodb";
import { Link } from "@/lib/models";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    const tag = searchParams.get("tag");

    const filter: Record<string, any> = {};
    if (projectId && ObjectId.isValid(projectId)) filter.projectId = new ObjectId(projectId);
    if (tag) filter.tags = tag;

    const links = await getLinksCollection();
    const result = await links.find(filter).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, label, tags, projectId, checkFrequency } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    try { new URL(url); } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const links = await getLinksCollection();
    const count = await links.countDocuments();
    if (count >= 8) {
      return NextResponse.json({ error: "Maximum 8 links allowed." }, { status: 400 });
    }

    const doc: Link = {
      url: url.trim(),
      label: label?.trim() ?? "",
      tags: Array.isArray(tags) ? tags : [],
      projectId: projectId && ObjectId.isValid(projectId) ? new ObjectId(projectId) : null,
      checkFrequency: checkFrequency ?? "manual",
      createdAt: new Date(),
      lastCheckedAt: null,
      lastHash: null,
    };

    const result = await links.insertOne(doc);
    return NextResponse.json({ _id: result.insertedId, ...doc }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "URL already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}