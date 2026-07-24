const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function isMutatingMethod(method: string) {
  return MUTATING_METHODS.has(method.toUpperCase());
}

export function normalizedOrigin(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch {
    return null;
  }
}

export function isSameOriginRequest(input: {
  origin: string | null;
  requestOrigin: string;
  fetchSite: string | null;
}) {
  if (input.fetchSite === "cross-site") {
    return false;
  }

  const origin = normalizedOrigin(input.origin);
  const requestOrigin = normalizedOrigin(input.requestOrigin);

  return !origin || (Boolean(requestOrigin) && origin === requestOrigin);
}
