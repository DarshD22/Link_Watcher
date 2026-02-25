import { ObjectId } from "mongodb";

// ─── Link ───────────────────────────────────────────────────────────────────

export interface Link {
  _id?: ObjectId;
  url: string;
  label?: string;
  projectId?: ObjectId | null;
  tags?: string[];
  checkFrequency?: "manual" | "hourly" | "daily" | "weekly";
  createdAt: Date;
  lastCheckedAt: Date | null;
  lastHash: string | null;
}

// ─── Snippet ─────────────────────────────────────────────────────────────────

export interface Snippet {
  text: string;
  context: string;
}

// ─── Check ───────────────────────────────────────────────────────────────────

export interface Check {
  _id?: ObjectId;
  linkId: ObjectId;
  checkedAt: Date;
  snapshot: string;
  diffHtml: string;
  summary: string;
  severity?: "minor" | "moderate" | "major";
  snippets: Snippet[];
  contentHash: string;
  changeType: "added" | "removed" | "modified" | "no-change" | "error";
  keywordTriggers?: string[];
  createdAt: Date;
}

// ─── Project ─────────────────────────────────────────────────────────────────

export interface AlertSettings {
  emailEnabled: boolean;
  emailTo?: string;
  slackEnabled: boolean;
  slackWebhookUrl?: string;
  severityThreshold: "minor" | "moderate" | "major";
}

export interface Project {
  _id?: ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  alertSettings: AlertSettings;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  _id?: ObjectId;
  linkId: ObjectId;
  checkId: ObjectId;
  type: "email" | "slack";
  status: "sent" | "failed";
  sentAt: Date;
  error?: string;
}