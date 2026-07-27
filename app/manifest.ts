import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Maa Kalawati Foundation",
    short_name: "MKF",
    description:
      "We care, we serve, we empower. A charitable foundation in Gurugram for healthcare support, education, women empowerment and community welfare.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf6ee",
    theme_color: "#c85312",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}