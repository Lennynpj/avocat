import { MongoClient, type Db } from "mongodb";

const DB_NAME = process.env.MONGODB_DB || "cabinet_nganga";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function mongoEnabled(): boolean {
  return !!process.env.MONGODB_URI;
}

// Réutilise une seule connexion entre les invocations
// (hot-reload en dev + warm starts serverless sur Vercel).
function clientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI manquant");
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri, {
      serverSelectionTimeoutMS: 8000,
    }).connect();
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  return client.db(DB_NAME);
}
