/**
 * Script pour lancer le seed seul (sans démarrer le serveur).
 * Usage: npm run seed
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { runSeed } from "../seed.js";

dotenv.config();

async function main() {
  await connectDB();
  await runSeed();
  await mongoose.disconnect();
  console.log("Seed terminé.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
