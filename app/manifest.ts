import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cabinet NGANGA — Avocat au Barreau de Bobigny",
    short_name: "Cabinet NGANGA",
    description: "Prise de rendez-vous avec Maître Jean Vivien NGANGA, avocat à Clichy-sous-bois.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f2ec",
    theme_color: "#1B2A4A",
    lang: "fr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
