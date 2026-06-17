import { MongoClient } from "mongodb";
import { readFileSync } from "node:fs";

// Optionnel : charge les données de démo (data/db.json) dans MongoDB.
// Pour une base vierge en production, n'exécute PAS ce script.
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "cabinet_nganga";

if (!uri) {
  console.error("MONGODB_URI manquant. Lance avec : npm run seed");
  process.exit(1);
}

const data = JSON.parse(readFileSync(new URL("../data/db.json", import.meta.url), "utf8"));
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
try {
  await client.connect();
  const db = client.db(dbName);
  for (const b of data.bookings ?? []) {
    await db.collection("bookings").updateOne({ id: b.id }, { $set: b }, { upsert: true });
  }
  for (const b of data.blocages ?? []) {
    await db.collection("blocages").updateOne({ id: b.id }, { $set: b }, { upsert: true });
  }
  await db.collection("bookings").createIndex({ id: 1 }, { unique: true });
  await db.collection("bookings").createIndex({ date: 1, hour: 1 });
  await db.collection("blocages").createIndex({ date: 1 });
  console.log(
    `✅ Seed OK : ${(data.bookings ?? []).length} bookings, ${(data.blocages ?? []).length} blocages (données de démo).`,
  );
} catch (e) {
  console.error("❌ Seed échoué :", e.message);
  process.exit(1);
} finally {
  await client.close();
}
