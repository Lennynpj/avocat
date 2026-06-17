import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "cabinet_nganga";

if (!uri) {
  console.error("MONGODB_URI manquant. Lance avec : npm run db:check");
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
try {
  await client.connect();
  const db = client.db(dbName);
  await db.command({ ping: 1 });
  await db.collection("bookings").createIndex({ id: 1 }, { unique: true });
  await db.collection("bookings").createIndex({ date: 1, hour: 1 });
  await db.collection("blocages").createIndex({ date: 1 });
  const nb = await db.collection("bookings").countDocuments();
  const nbl = await db.collection("blocages").countDocuments();
  console.log(`✅ Connexion MongoDB OK (db: ${dbName}). bookings: ${nb}, blocages: ${nbl}. Index créés.`);
} catch (e) {
  console.error("❌ Connexion MongoDB échouée :", e.message);
  process.exit(1);
} finally {
  await client.close();
}
