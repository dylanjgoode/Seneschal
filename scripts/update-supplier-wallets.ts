/**
 * Update all supplier wallet addresses to a real test address.
 * Usage: npx tsx scripts/update-supplier-wallets.ts
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { readFileSync } from "fs";
import { resolve } from "path";
import * as schema from "../src/lib/db/schema";

function loadEnv() {
  try {
    const envPath = resolve(__dirname, "../.env.development.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {}
}

loadEnv();

const sql = neon(process.env.POSTGRES_URL!);
const db = drizzle(sql, { schema });

const REAL_ADDRESS = "0x4C399318C996931f1De0eD005da000D9BB0475db";

async function main() {
  const result = await db
    .update(schema.suppliers)
    .set({ walletAddress: REAL_ADDRESS })
    .returning({ id: schema.suppliers.id, name: schema.suppliers.name });

  for (const s of result) {
    console.log(`Updated ${s.name} (${s.id}) → ${REAL_ADDRESS}`);
  }
  console.log("Done.");
}

main().catch(console.error);
