import { NextRequest, NextResponse } from "next/server";
import { getProjectsCollection } from "@/lib/mongodb";
import { Project } from "@/lib/models";

export async function GET() {
  try {
    const projects = await getProjectsCollection();
    const result = await projects.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, alertSettings } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const projects = await getProjectsCollection();

    const doc: Project = {
      name: name.trim(),
      description: description?.trim() ?? "",
      createdAt: new Date(),
      alertSettings: {
        emailEnabled: alertSettings?.emailEnabled ?? false,
        emailTo: alertSettings?.emailTo ?? "",
        slackEnabled: alertSettings?.slackEnabled ?? false,
        slackWebhookUrl: alertSettings?.slackWebhookUrl ?? "",
        severityThreshold: alertSettings?.severityThreshold ?? "moderate",
      },
    };

    const result = await projects.insertOne(doc);
    return NextResponse.json({ _id: result.insertedId, ...doc }, { status: 201 });
  } catch (err: any) {
    if (err.code === 11000) {
      return NextResponse.json({ error: "Project name already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}