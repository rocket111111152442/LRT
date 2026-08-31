import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#16211b",
          padding: "72px",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#f6f3ec", fontSize: 30 }}>
          <span>votre</span>
          <span style={{ fontStyle: "italic" }}>courtier</span>
          <span style={{ color: "#c8a179" }}>.ch</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", color: "#f6f3ec", fontSize: 58, lineHeight: 1.15, maxWidth: 900 }}>
            Chaque bien a une valeur. Nous savons la révéler.
          </div>
          <div style={{ display: "flex", color: "#c8a179", fontSize: 24, letterSpacing: 2 }}>
            {site.tagline.toUpperCase()}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
