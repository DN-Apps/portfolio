import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #1f6d79 0%, #216477 60%, #163f4a 100%)",
        position: "relative",
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: -80,
          left: -80,
          width: 380,
          height: 380,
          borderRadius: 999,
          background: "rgba(255,255,255,0.05)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -100,
          right: -60,
          width: 420,
          height: 420,
          borderRadius: 999,
          background: "rgba(255,255,255,0.04)",
        }}
      />

      {/* Left: Icon block */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 220,
          height: 220,
          borderRadius: 48,
          background: "rgba(255,255,255,0.10)",
          border: "3px solid rgba(255,255,255,0.18)",
          marginRight: 64,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: -6,
            display: "flex",
          }}
        >
          DN
        </span>
      </div>

      {/* Right: Text block */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: -2,
            lineHeight: 1.1,
            display: "flex",
          }}
        >
          Daniel Nedic
        </span>
        <span
          style={{
            fontSize: 34,
            fontWeight: 500,
            color: "rgba(255,255,255,0.80)",
            marginTop: 16,
            display: "flex",
          }}
        >
          Full Stack Developer
        </span>
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 28,
          }}
        >
          {["React", "TypeScript", "Next.js"].map((tag) => (
            <span
              key={tag}
              style={{
                display: "flex",
                padding: "6px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.22)",
                color: "rgba(255,255,255,0.90)",
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>,
    size,
  );
}
