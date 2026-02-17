import { siteConfig } from "@/lib/config";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || siteConfig.name;
  const subtitle = siteConfig.description;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 55%, rgba(51,65,85,1) 100%)",
          color: "#f8fafc",
          padding: "72px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ fontSize: 24, opacity: 0.9, letterSpacing: "0.12em", textTransform: "uppercase" }}>
          ComputerScienceX.com
        </div>
        <div
          style={{
            marginTop: "18px",
            fontSize: 64,
            lineHeight: 1.1,
            fontWeight: 700,
            maxWidth: "1000px",
            letterSpacing: "-0.04em",
          }}
        >
          {title}
        </div>
        <div style={{ marginTop: "20px", fontSize: 28, opacity: 0.85, maxWidth: "900px" }}>{subtitle}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
