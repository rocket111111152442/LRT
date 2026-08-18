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
    // Les commandes Prisma preferent la connexion directe : le pooler de
    // Supabase ne supporte pas les instructions DDL de `db push`.
    url:
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL,
  },
});
