// Client serveur de l'API AgoraPlus (QualiRépar / Bonus Réparation).
//
// Principes :
// - Tous les appels se font côté serveur, jamais dans le navigateur.
// - Chaque atelier utilise SA propre clé API (passée en header X-API-Key) : on
//   n'utilise aucune clé globale Qoravo.
// - Aucune erreur réseau AgoraPlus ne doit bloquer la création d'une fiche ou la
//   génération d'une facture : ces fonctions renvoient toujours un résultat
//   { ok, ... } et ne lèvent pas d'exception au-delà du timeout géré ici.
//
// Le contrat exact (noms de champs) provient de la doc AgoraPlus ; il est
// centralisé ici pour être ajusté facilement après un test avec de vrais
// identifiants. Doc : https://support.agoraplus.com/fr/support/solutions/articles/43000672495

const DEFAULT_BASE_URL = "https://api.agoraplus.com";
const REQUEST_TIMEOUT_MS = 12_000;

// Codes éco-organismes renvoyés par CalculateEcoSupport.
export const ECO_ORGANIZATIONS: Record<string, string> = {
  "44": "Ecologic",
  "45": "Ecosystem",
};

function baseUrl() {
  const url = process.env.AGORAPLUS_BASE_URL?.trim();
  return url && /^https?:\/\//.test(url) ? url.replace(/\/$/, "") : DEFAULT_BASE_URL;
}

export type AgoraResult<T = unknown> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
};

type RequestOptions = {
  method?: "GET" | "POST";
  apiKey: string;
  query?: Record<string, string | number | undefined>;
  body?: unknown;
};

async function agoraRequest<T = unknown>(
  path: string,
  { method = "GET", apiKey, query, body }: RequestOptions,
): Promise<AgoraResult<T>> {
  if (!apiKey) {
    return { ok: false, status: 0, error: "Clé API AgoraPlus manquante." };
  }

  const url = new URL(`${baseUrl()}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), {
      method,
      headers: {
        "X-API-Key": apiKey,
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    let data: unknown = undefined;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const message =
        (data && typeof data === "object" && "ResponseErrorMessage" in data
          ? String((data as Record<string, unknown>).ResponseErrorMessage)
          : null) ||
        (data && typeof data === "object" && "ErrorMessage" in data
          ? String((data as Record<string, unknown>).ErrorMessage)
          : null) ||
        `Erreur AgoraPlus (HTTP ${res.status}).`;
      return { ok: false, status: res.status, error: message, data: data as T };
    }

    return { ok: true, status: res.status, data: data as T };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      status: 0,
      error: aborted
        ? "Délai dépassé : AgoraPlus n'a pas répondu."
        : "AgoraPlus injoignable pour le moment.",
    };
  } finally {
    clearTimeout(timeout);
  }
}

// --- Endpoints ---

export type AgoraBrand = { BrandId?: string | number; BrandName?: string };
export type AgoraProductType = {
  ProductId?: string | number;
  ProductName?: string;
  EligibilityStartDate?: string;
  EligibilityEndDate?: string;
  RepairCodes?: string[];
  IRISSymptoms?: string[];
};

export function printBrandList(apiKey: string) {
  return agoraRequest<AgoraBrand[] | { Brands?: AgoraBrand[] }>("/PrintBrandList", {
    method: "GET",
    apiKey,
  });
}

export function printProductTypeList(apiKey: string) {
  return agoraRequest<AgoraProductType[] | { ProductTypes?: AgoraProductType[] }>(
    "/PrintProductTypeList",
    { method: "GET", apiKey },
  );
}

/** Vérifie que la clé API est valide en appelant un endpoint léger. */
export async function testConnection(apiKey: string): Promise<AgoraResult> {
  const result = await printBrandList(apiKey);
  if (result.status === 401 || result.status === 403) {
    return { ok: false, status: result.status, error: "Clé API refusée par AgoraPlus." };
  }
  return result;
}

export type EcoSupport = {
  EcoOrganizationId?: string | number;
  SupportAmount?: { Amount?: number; Currency?: string };
};

export function calculateEcoSupport(
  apiKey: string,
  params: {
    totalAmountExclVatCents: number;
    brandId?: string;
    productId?: string;
    symptom?: string;
    repairCode?: string;
  },
) {
  return agoraRequest<EcoSupport>("/CalculateEcoSupport", {
    method: "POST",
    apiKey,
    body: {
      TotalAmountExclVAT: Math.round(params.totalAmountExclVatCents) / 100,
      TotalAmountExclVAT_Currency: "EUR",
      BrandId: params.brandId,
      ProductId: params.productId,
      IRISSymptom: params.symptom,
      RepairCode: params.repairCode,
    },
  });
}

export type CreateSupportResult = {
  RequestId?: string;
  EcoOrganizationId?: string | number;
  IsValid?: boolean;
  ErrorMessage?: string;
};

export function createSupportRequest(
  apiKey: string,
  params: {
    siteId?: string;
    quoteNumber?: string;
    callDate?: string;
    consumer?: Record<string, unknown>;
    product?: Record<string, unknown>;
    quote?: Record<string, unknown>;
    spareParts?: unknown[];
  },
) {
  return agoraRequest<CreateSupportResult>("/CreateSupportRequest", {
    method: "POST",
    apiKey,
    query: {
      CallDate: params.callDate ?? new Date().toISOString(),
      RepairSiteId: params.siteId,
      QuoteNumber: params.quoteNumber,
    },
    body: {
      Consumer: params.consumer ?? {},
      Product: params.product ?? {},
      Quote: params.quote ?? {},
      SpareParts: params.spareParts ?? [],
    },
  });
}

export type SupportStatus = {
  RequestId?: string;
  LastStatus?: string; // Waiting / Accepted / Refused
  Comment?: string;
  CreateDate?: string;
};

export function getSupportRequestStatus(apiKey: string, requestId: string) {
  return agoraRequest<SupportStatus>("/GetSupportRequestStatus", {
    method: "GET",
    apiKey,
    query: { RequestId: requestId },
  });
}

export function ecoOrganizationName(id: string | number | undefined): string | null {
  if (id === undefined || id === null) return null;
  return ECO_ORGANIZATIONS[String(id)] ?? null;
}
