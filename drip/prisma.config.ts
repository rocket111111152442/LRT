import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  // Prisma 7 lit l'URL de la base ici plutôt que dans le bloc `datasource` du
  // schéma. L'application, elle, passe par l'adaptateur pg (src/lib/prisma.ts).
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
