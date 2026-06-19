import { spawnSync } from "node:child_process";
import "dotenv/config";

const isVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";

if (process.env.SKIP_PRISMA_MIGRATE === "true") {
  console.log("Prisma migrate deploy skipped with SKIP_PRISMA_MIGRATE=true.");
  process.exit(0);
}

if (!isVercel) {
  console.log("Prisma migrate deploy skipped outside Vercel.");
  process.exit(0);
}

if (process.env.DATABASE_PROVIDER === "firebase") {
  console.log("Prisma migrate deploy skipped because DATABASE_PROVIDER=firebase.");
  process.exit(0);
}

if (!process.env.DATABASE_URL) {
  console.log("Prisma migrate deploy skipped because DATABASE_URL is missing.");
  process.exit(0);
}

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["prisma", "migrate", "deploy"], {
  env: process.env,
  stdio: "inherit",
});

process.exit(result.status ?? 1);
