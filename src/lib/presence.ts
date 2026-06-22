// Compteur de présence "en ligne maintenant".
//
// Chaque visiteur envoie un battement (heartbeat) toutes les ~15 s avec un
// identifiant de session. On considère "en ligne" toute session vue dans les
// 35 dernières secondes.
//
// Note serverless (Vercel) : le compteur est en mémoire par instance. Pour un
// site à faible/moyen trafic (une instance chaude), le nombre est fiable. Pour
// une précision multi-instances garantie, brancher un store partagé (Redis).

const seen = new Map<string, number>();
const WINDOW_MS = 35_000;
const MAX_TRACKED = 5000; // garde-fou mémoire

function prune() {
  const cutoff = Date.now() - WINDOW_MS;
  for (const [id, lastSeen] of seen) {
    if (lastSeen < cutoff) {
      seen.delete(id);
    }
  }
}

export function heartbeat(id: string) {
  if (seen.size >= MAX_TRACKED && !seen.has(id)) {
    prune();
  }
  seen.set(id, Date.now());
}

export function onlineCount(): number {
  prune();
  return seen.size;
}
