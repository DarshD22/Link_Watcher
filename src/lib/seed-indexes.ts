import { getDb } from "./mongodb";

export async function seedIndexes() {
  const db = await getDb();

  // Links
  await db.collection("links").createIndex({ url: 1 }, { unique: true });
  await db.collection("links").createIndex({ projectId: 1 });
  await db.collection("links").createIndex({ tags: 1 });

  // Checks
  await db.collection("checks").createIndex({ linkId: 1, checkedAt: -1 });
  await db.collection("checks").createIndex({ severity: 1 });
  await db.collection("checks").createIndex(
    { checkedAt: -1 },
    { expireAfterSeconds: 60 * 60 * 24 * 90 } // optional: auto-expire after 90 days
  );

  // Projects
  await db.collection("projects").createIndex({ name: 1 }, { unique: true });

  // Notifications
  await db.collection("notifications").createIndex({ linkId: 1, sentAt: -1 });
  await db.collection("notifications").createIndex({ checkId: 1 });

  console.log("All indexes created.");
}