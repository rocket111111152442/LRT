import { NextResponse } from "next/server";
import { isBlobConfigured } from "@/lib/admin/blobStore";

/**
 * Diagnostic temporaire : confirme si BLOB_READ_WRITE_TOKEN est vu par le
 * runtime de ce déploiement, sans jamais exposer sa valeur. À retirer une
 * fois le dépannage de la connexion Blob terminé.
 */
export async function GET() {
  return NextResponse.json({
    blobConfigured: isBlobConfigured(),
    vercelEnv: process.env.VERCEL_ENV ?? null,
    gitBranch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
  });
}
