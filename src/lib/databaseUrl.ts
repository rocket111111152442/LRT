type PrismaDevApiKey = {
  databaseUrl?: string;
};

export function resolvePostgresConnectionString(connectionString: string) {
  if (!connectionString.startsWith("prisma+postgres://")) {
    return connectionString;
  }

  const url = new URL(connectionString);
  const apiKey = url.searchParams.get("api_key");

  if (!apiKey) {
    return connectionString;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(apiKey, "base64url").toString("utf8"),
    ) as PrismaDevApiKey;

    return decoded.databaseUrl ?? connectionString;
  } catch {
    return connectionString;
  }
}
