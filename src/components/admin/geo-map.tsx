"use client";

type GeoPoint = {
  id: number;
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
  createdAt: string;
};

const WIDTH = 900;
const HEIGHT = 420;

function longitudeToX(longitude: number) {
  return ((longitude + 180) / 360) * WIDTH;
}

function latitudeToY(latitude: number) {
  return ((90 - latitude) / 180) * HEIGHT;
}

export default function GeoMap({ points }: { points: GeoPoint[] }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-lg font-semibold">Live Visitor Map</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Visitor markers from recent non-bot page views with available coordinates.
      </p>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-[320px] min-w-[700px] rounded-md border bg-gradient-to-br from-slate-50 to-slate-100"
          role="img"
          aria-label="Visitor coordinate map"
        >
          <defs>
            <pattern id="grid" width="45" height="45" patternUnits="userSpaceOnUse">
              <path d="M 45 0 L 0 0 0 45" fill="none" stroke="#d1d5db" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width={WIDTH} height={HEIGHT} fill="url(#grid)" />
          <line x1="0" y1={HEIGHT / 2} x2={WIDTH} y2={HEIGHT / 2} stroke="#94a3b8" strokeWidth="1.5" />
          <line x1={WIDTH / 2} y1="0" x2={WIDTH / 2} y2={HEIGHT} stroke="#94a3b8" strokeWidth="1.5" />

          {points.map((point) => {
            const x = longitudeToX(point.longitude);
            const y = latitudeToY(point.latitude);
            const label = `${point.city || "Unknown city"}, ${point.country || "Unknown country"} (${new Date(point.createdAt).toLocaleString()})`;

            return (
              <g key={point.id}>
                <circle cx={x} cy={y} r="5.5" fill="#0f766e" opacity="0.8">
                  <title>{label}</title>
                </circle>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
