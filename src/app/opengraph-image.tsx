import { ImageResponse } from "next/og";

export const alt = "Qoravo, logiciel de gestion pour réparateurs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #020617 0%, #082f49 58%, #064e3b 100%)",
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "70px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: "1040px" }}>
          <div style={{ color: "#38bdf8", display: "flex", fontSize: 34, fontWeight: 800 }}>
            QORAVO
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800, lineHeight: 1.08, marginTop: 24 }}>
            Le logiciel de gestion tout-en-un des réparateurs
          </div>
          <div style={{ color: "#dbeafe", display: "flex", fontSize: 30, lineHeight: 1.4, marginTop: 30 }}>
            Réparations, clients, devis, stock, agenda, comptabilité et emails automatiques.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
