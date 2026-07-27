import { ImageResponse } from "next/og";

export const alt = "Maa Kalawati Foundation — We care, we serve, we empower.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf6ee",
          backgroundImage:
            "radial-gradient(circle at 20% 15%, #fcebd8 0%, transparent 45%), radial-gradient(circle at 85% 80%, #dfede4 0%, transparent 45%)",
          fontFamily: "serif",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="23" fill="#fef7ee" stroke="#f3b375" />
          <path
            d="M24 30c-6.5-2-10-6.8-10.5-12.5 5 .6 8.8 3.2 10.5 7.5 1.7-4.3 5.5-6.9 10.5-7.5C34 23.2 30.5 28 24 30Z"
            fill="#ec8d40"
          />
          <path
            d="M24 12c2.6 3 3.9 6.2 3.9 9.4 0 3.3-1.3 5.9-3.9 7.9-2.6-2-3.9-4.6-3.9-7.9 0-3.2 1.3-6.4 3.9-9.4Z"
            fill="#c85312"
          />
          <path
            d="M11 32.5c4 3.4 8.3 5.1 13 5.1s9-1.7 13-5.1"
            stroke="#2e6749"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        </svg>
        <div
          style={{
            marginTop: 36,
            fontSize: 68,
            fontWeight: 700,
            color: "#262019",
            display: "flex",
          }}
        >
          Maa Kalawati Foundation
        </div>
        <div style={{ marginTop: 14, fontSize: 34, color: "#a63e10", display: "flex" }}>
          We care · We serve · We empower
        </div>
        <div style={{ marginTop: 30, fontSize: 22, color: "#8a7f68", display: "flex" }}>
          Healthcare · Education · Women Empowerment · Community Welfare
        </div>
      </div>
    ),
    { ...size }
  );
}