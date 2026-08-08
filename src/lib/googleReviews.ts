// Récupération de la note Google (Places API) côté serveur, avec cache.
// Clé et Place ID via variables d'environnement — inerte tant qu'ils sont absents.

export type GoogleReview = {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
};

export type GoogleRatingData = {
  rating: number;
  total: number;
  url: string;
  reviews: GoogleReview[];
};

type PlacesReview = {
  author_name?: string;
  rating?: number;
  text?: string;
  relative_time_description?: string;
};

type PlacesResult = {
  status?: string;
  result?: {
    rating?: number;
    user_ratings_total?: number;
    url?: string;
    reviews?: PlacesReview[];
  };
};

export async function getGoogleReviews(): Promise<GoogleRatingData | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!key || !placeId) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      place_id: placeId,
      fields: "rating,user_ratings_total,url,reviews",
      language: "fr",
      key,
    });

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
      // Cache 6h : on ne rappelle Google que 4 fois par jour au maximum.
      { next: { revalidate: 21600 } },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as PlacesResult;

    if (data.status !== "OK" || !data.result) {
      return null;
    }

    const result = data.result;
    const reviews: GoogleReview[] = Array.isArray(result.reviews)
      ? result.reviews
          .filter((review) => (review.rating ?? 0) >= 4 && Boolean(review.text))
          .slice(0, 6)
          .map((review) => ({
            author: String(review.author_name ?? "Client Google"),
            rating: Number(review.rating ?? 5),
            text: String(review.text ?? ""),
            relativeTime: String(review.relative_time_description ?? ""),
          }))
      : [];

    return {
      rating: Number(result.rating ?? 0),
      total: Number(result.user_ratings_total ?? 0),
      url: String(result.url ?? ""),
      reviews,
    };
  } catch {
    return null;
  }
}
