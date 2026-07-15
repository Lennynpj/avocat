import { ImageResponse } from "next/og";
import { CABINET } from "@/lib/config";

export const runtime = "nodejs";
export const alt = "Maître Jean Vivien NGANGA — Avocat au Barreau de Bobigny";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#1B2A4A";
const GOLD = "#C9A24E";
const CREAM = "#F5F2EC";
const MUTED = "#9AA6BE";

// Balance de justice (même marque que la favicon), en data-URI pour un rendu net.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="14" fill="#22345A"/><circle cx="32" cy="14" r="2.6" fill="${GOLD}"/><g stroke="${GOLD}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M32 16.5v31"/><path d="M15 22h34"/><path d="M15 22v2.4"/><path d="M49 22v2.4"/><path d="M8 26q7 9 14 0"/><path d="M42 26q7 9 14 0"/><path d="M24 48h16"/></g></svg>`;
const iconData = `data:image/svg+xml;base64,${Buffer.from(icon).toString("base64")}`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: NAVY,
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <img src={iconData} width={104} height={104} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: GOLD, fontSize: 27, letterSpacing: 5, textTransform: "uppercase" }}>Cabinet NGANGA</div>
            <div style={{ color: MUTED, fontSize: 25 }}>Avocat au Barreau de Bobigny</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ color: CREAM, fontSize: 70, fontWeight: 700, lineHeight: 1.08 }}>Maître Jean Vivien</div>
          <div style={{ color: CREAM, fontSize: 70, fontWeight: 700, lineHeight: 1.08 }}>NGANGA</div>
          <div style={{ color: GOLD, fontSize: 31, marginTop: 24 }}>
            {CABINET.domaines.map((d) => d.titre).join("  ·  ")}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ color: MUTED, fontSize: 26 }}>Clichy-sous-bois · Seine-Saint-Denis (93)</div>
          <div style={{ color: CREAM, fontSize: 26, fontWeight: 700 }}>nganga-avocat.fr</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
