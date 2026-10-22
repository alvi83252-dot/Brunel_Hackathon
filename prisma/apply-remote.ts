import { readFileSync } from "node:fs";
import { createClient } from "@libsql/client";

loadEnvFile();

setupRemote().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function setupRemote() {
  const tursoUrl = process.env.TURSO_DATABASE_URL?.trim();
  if (!tursoUrl) {
    console.log("TURSO_DATABASE_URL is not set. Using the local SQLite file.");
    return;
  }

  const client = createClient({
    url: tursoUrl,
    authToken: process.env.TURSO_AUTH_TOKEN?.trim() || undefined,
  });

  const existing = await client.execute("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'User'");
  if (existing.rows.length === 0) {
    const sql = readFileSync("prisma/migrations/20261021210000_init/migration.sql", "utf8");
    await client.executeMultiple(sql);
    console.log("Created the shared database tables.");
  } else {
    console.log("Shared database tables already exist.");
  }
  client.close();

  const { seed } = await import("./seed.ts");
  await seed();
  const { prisma } = await import("../src/lib/prisma");
  await prisma.$disconnect();
}

function loadEnvFile() {
  try {
    const text = readFileSync(".env", "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator).trim();
      if (!key || process.env[key]) continue;
      let value = trimmed.slice(separator + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  } catch {
    // Vercel injects environment variables, so a local .env file is optional.
  }
}
