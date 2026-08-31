import { ImageResponse } from 'next/og';

import { agence } from '@/content/site';

export const alt = `${agence.nom} — Détectives privés à Genève et en Suisse romande`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Image de partage, générée à la construction.
 *
 * Elle reprend les codes du site — fond graphite, accent champagne, marque
 * très espacée — sans dépendre d'un fichier binaire à maintenir.
 */
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'linear-gradient(140deg, #06080b 0%, #12181f 55%, #0b0f14 100%)',
        padding: 72,
      }}
    >
      {/* Marque */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            background: '#c9ab72',
            display: 'flex',
          }}
        />
        <div style={{ fontSize: 30, letterSpacing: 14, color: '#eceff3', display: 'flex' }}>
          ADIMEN
        </div>
      </div>

      {/* Accroche */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 76, lineHeight: 1.08, color: '#eceff3', display: 'flex' }}>
          Établir les faits,
        </div>
        <div style={{ fontSize: 76, lineHeight: 1.08, color: '#c9ab72', display: 'flex' }}>
          sans se faire remarquer
        </div>
      </div>

      {/* Pied */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: '1px solid #2c3742',
          paddingTop: 28,
        }}
      >
        <div style={{ fontSize: 24, color: '#7e8b98', display: 'flex' }}>
          Détectives privés · Genève · Lausanne · Montreux · Sion
        </div>
        <div style={{ fontSize: 24, color: '#b4bec8', display: 'flex' }}>
          {agence.telephonePrincipalAffiche}
        </div>
      </div>
    </div>,
    size,
  );
}
