import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

/** Branded Open Graph card: deep teal, paper wordmark, mono eyebrow, large title, lime smile arc. */
export async function ogImage({ eyebrow, title }: { eyebrow: string; title: string }) {
  const logo = await readFile(join(process.cwd(), "public/brand/logo-paper.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #083b3b 0%, #052626 100%)",
          color: "#f6f5f0",
          position: "relative",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={326} height={64} alt="" />
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 980 }}>
          <div style={{ fontSize: 24, letterSpacing: 4, color: "#c8f169", textTransform: "uppercase" }}>{eyebrow}</div>
          <div style={{ fontSize: title.length > 90 ? 50 : title.length > 60 ? 60 : 76, lineHeight: 1.06, letterSpacing: -2 }}>{title}</div>
        </div>
        <svg
          width="200"
          height="115"
          viewBox="0 0 28 16"
          style={{ position: "absolute", right: 80, top: 64 }}
          fill="none"
        >
          <path d="M2 2 C 2 10, 8 14, 14 14 C 20 14, 26 10, 26 2" stroke="#c8f169" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    ),
    OG_SIZE,
  );
}
