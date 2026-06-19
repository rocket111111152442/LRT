const CANONICAL_APP_URL = "https://lrt.life";
const DEPRECATED_HOSTS = new Set(["lrt-mu.vercel.app", "qoravo-mu.vercel.app"]);

function normalizeUrl(value: string | undefined) {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return "";
  }

  const withProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const url = new URL(withProtocol);
    return url.origin;
  } catch {
    return "";
  }
}

function isDeprecatedUrl(value: string) {
  try {
    return DEPRECATED_HOSTS.has(new URL(value).hostname.toLowerCase());
  } catch {
    return true;
  }
}

export function getPublicAppUrl() {
  const configuredUrl = normalizeUrl(process.env.NEXT_PUBLIC_APP_URL);

  if (configuredUrl && !isDeprecatedUrl(configuredUrl)) {
    return configuredUrl;
  }

  const vercelUrl = normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL);

  if (vercelUrl && !isDeprecatedUrl(vercelUrl)) {
    return vercelUrl;
  }

  return CANONICAL_APP_URL;
}
