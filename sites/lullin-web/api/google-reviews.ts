// Avis Google de Lullin Web, lus via l'API Google Places (New).
// La clé reste côté serveur (variable d'environnement GOOGLE_PLACES_API_KEY).
// La fiche est trouvée par son identifiant GOOGLE_PLACE_ID s'il est défini, sinon
// par une recherche « Lullin Web » dont le résultat doit porter le nom Lullin.
// Réponse mise en cache 12 h sur le CDN de Vercel : environ deux appels Google par jour.

const PLACES = 'https://places.googleapis.com/v1';
const SEARCH_QUERY = 'Lullin Web';
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

async function findPlaceId(key: string): Promise<string | null> {
  const fromEnv = process.env.GOOGLE_PLACE_ID?.trim();
  if (fromEnv) return fromEnv;
  // Masque « places.id » seul : recherche facturée au niveau le plus bas.
  const res = await fetch(`${PLACES}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': 'places.id',
    },
    body: JSON.stringify({ textQuery: SEARCH_QUERY, languageCode: 'fr', regionCode: 'FR' }),
  });
  if (!res.ok) throw new Error(`search ${res.status}`);
  const data = (await res.json()) as { places?: Array<{ id?: string }> };
  return data.places?.[0]?.id ?? null;
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
    const id = await findPlaceId(key);
    if (!id) return reply(404, { ok: false, reason: 'not_found' }, CACHE_ERROR);
    const place = await loadPlace(key, id);
    const name = place.displayName?.text ?? '';
    // Garde-fou : sans identifiant fixé, on n'affiche jamais les avis d'une autre entreprise.
    if (!process.env.GOOGLE_PLACE_ID && !/lullin/i.test(name)) {
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
