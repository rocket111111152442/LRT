import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { resolvePostgresConnectionString } from "../src/lib/databaseUrl";

const connectionString = process.env.DATABASE_URL;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the seed.");
}

if (!adminEmail || !adminPassword) {
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required to run the seed.");
}

const normalizedAdminEmail = adminEmail.toLowerCase();
const plainAdminPassword = adminPassword;

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: resolvePostgresConnectionString(connectionString),
  }),
});

async function main() {
  const passwordHash = await bcrypt.hash(plainAdminPassword, 12);

  await prisma.user.upsert({
    where: { email: normalizedAdminEmail },
    update: {
      passwordHash,
      role: "ADMIN",
    },
    create: {
      email: normalizedAdminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
