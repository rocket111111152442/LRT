// Avis Google de Lullin Web, lus via l'API Google Places (New).
// La clé reste côté serveur (variable d'environnement GOOGLE_PLACES_API_KEY).
// La fiche est trouvée par son identifiant GOOGLE_PLACE_ID s'il est défini, sinon
// par une recherche dont le résultat doit s'appeler « Lullin web ».
// Réponse mise en cache 12 h sur le CDN de Vercel : environ deux appels Google par jour.

const PLACES = 'https://places.googleapis.com/v1';
const SEARCH_QUERIES = ['Lullin web', 'Lullin web création de site internet', 'Lullin web agence web'];
// « Lullin » seul désigne aussi une commune de Haute-Savoie : on exige « Lullin web ».
const NAME_PATTERN = /lullin[\s-]*web/i;
const CACHE_OK = 'public, max-age=0, s-maxage=43200, stale-while-revalidate=86400';
const CACHE_ERROR = 'public, max-age=0, s-maxage=600';

type GoogleReview = {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
};

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  googleMapsLinks?: { writeAReviewUri?: string; reviewsUri?: string };
  reviews?: GoogleReview[];
};

function reply(status: number, body: Record<string, unknown>, cache: string) {
  return Response.json(body, { status, headers: { 'Cache-Control': cache } });
}

type Match = { id: string | null; candidates: string[] };

async function findPlaceId(key: string): Promise<Match> {
  const fromEnv = process.env.GOOGLE_PLACE_ID?.trim();
  if (fromEnv) return { id: fromEnv, candidates: [] };
  const candidates: string[] = [];
  // Plusieurs formulations : une fiche sans adresse publique (zone desservie) ne sort
  // pas toujours en premier. On garde le premier résultat nommé « Lullin web ».
  for (const textQuery of SEARCH_QUERIES) {
    const res = await fetch(`${PLACES}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.id,places.displayName',
      },
      body: JSON.stringify({ textQuery, languageCode: 'fr', pageSize: 10 }),
    });
    if (!res.ok) throw new Error(`search ${res.status}`);
    const data = (await res.json()) as { places?: Array<{ id?: string; displayName?: { text?: string } }> };
    for (const place of data.places ?? []) {
      const name = place.displayName?.text ?? '';
      if (candidates.length < 10) candidates.push(name);
      if (place.id && NAME_PATTERN.test(name)) return { id: place.id, candidates };
    }
  }
  return { id: null, candidates };
}

async function loadPlace(key: string, id: string): Promise<GooglePlace> {
  const fields = 'id,displayName,rating,userRatingCount,googleMapsUri,googleMapsLinks,reviews';
  const res = await fetch(`${PLACES}/places/${encodeURIComponent(id)}?languageCode=fr&regionCode=FR`, {
    headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': fields },
  });
  if (!res.ok) throw new Error(`details ${res.status}`);
  return (await res.json()) as GooglePlace;
}

export async function GET() {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) return reply(503, { ok: false, reason: 'not_configured' }, CACHE_ERROR);

  try {
    const { id, candidates } = await findPlaceId(key);
    // Les noms trouvés aident à diagnostiquer une fiche introuvable (données publiques).
    if (!id) return reply(404, { ok: false, reason: 'not_found', candidates }, CACHE_ERROR);
    const place = await loadPlace(key, id);
    const name = place.displayName?.text ?? '';
    // Garde-fou : sans identifiant fixé, on n'affiche jamais les avis d'une autre entreprise.
    if (!process.env.GOOGLE_PLACE_ID && !NAME_PATTERN.test(name)) {
      return reply(404, { ok: false, reason: 'not_found' }, CACHE_ERROR);
    }

    const reviews = (place.reviews ?? [])
      .map((review) => ({
        author: review.authorAttribution?.displayName ?? 'Client Google',
        authorUrl: review.authorAttribution?.uri ?? null,
        photo: review.authorAttribution?.photoUri ?? null,
        rating: review.rating ?? 0,
        text: (review.originalText?.text ?? review.text?.text ?? '').trim(),
        time: review.relativePublishTimeDescription ?? '',
        publishedAt: review.publishTime ?? null,
      }))
      .filter((review) => review.text.length > 0);

    return reply(
      200,
      {
        ok: true,
        name,
        rating: place.rating ?? null,
        total: place.userRatingCount ?? 0,
        url: place.googleMapsLinks?.reviewsUri ?? place.googleMapsUri ?? null,
        writeUrl: place.googleMapsLinks?.writeAReviewUri ?? null,
        reviews,
      },
      CACHE_OK,
    );
  } catch (error) {
    console.error('google-reviews', error instanceof Error ? error.message : error);
    return reply(502, { ok: false, reason: 'upstream' }, CACHE_ERROR);
  }
}
