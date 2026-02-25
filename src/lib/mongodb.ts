import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI!;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db("linkwatcher");
}

export async function getLinksCollection() {
  return (await getDb()).collection("links");
}

export async function getChecksCollection() {
  return (await getDb()).collection("checks");
}

export async function getProjectsCollection() {
  return (await getDb()).collection("projects");
}

export async function getNotificationsCollection() {
  return (await getDb()).collection("notifications");
}