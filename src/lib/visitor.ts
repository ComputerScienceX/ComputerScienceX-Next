import crypto from "crypto";

const BOT_PATTERNS =
  /(bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|monitor|uptime|headless)/i;

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
];

export type VisitorContext = {
  ip: string;
  fingerprint: string;
  userAgent: string;
  browser: string;
  os: string;
  deviceType: string;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  isBot: boolean;
};

function cleanValue(input: string | null | undefined) {
  if (!input) return null;
  const value = input.trim();
  return value.length ? value : null;
}

export function isLikelyBot(userAgent: string) {
  if (!userAgent) return false;
  return BOT_PATTERNS.test(userAgent);
}

export function getClientIp(requestHeaders: Headers) {
  const headerCandidates = [
    "x-forwarded-for",
    "x-real-ip",
    "cf-connecting-ip",
    "x-client-ip",
    "x-vercel-forwarded-for",
  ];

  for (const key of headerCandidates) {
    const raw = requestHeaders.get(key);
    if (!raw) continue;
    const parsed = raw.split(",")[0]?.trim();
    if (parsed) return parsed;
  }

  return "0.0.0.0";
}

function isPrivateIp(ip: string) {
  return PRIVATE_IP_PATTERNS.some((pattern) => pattern.test(ip));
}

function getBrowser(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("opr/") || ua.includes("opera")) return "Opera";
  if (ua.includes("chrome/")) return "Chrome";
  if (ua.includes("firefox/")) return "Firefox";
  if (ua.includes("safari/")) return "Safari";
  return "Unknown";
}

function getOs(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("mac os x")) return "macOS";
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios")) return "iOS";
  if (ua.includes("linux")) return "Linux";
  return "Unknown";
}

function getDeviceType(userAgent: string) {
  const ua = userAgent.toLowerCase();
  if (ua.includes("tablet") || ua.includes("ipad")) return "Tablet";
  if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) return "Mobile";
  return "Desktop";
}

function parseCoordinate(value: string | null) {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getLocationFromHeaders(requestHeaders: Headers) {
  const country =
    cleanValue(requestHeaders.get("x-vercel-ip-country")) ||
    cleanValue(requestHeaders.get("cf-ipcountry"));
  const region =
    cleanValue(requestHeaders.get("x-vercel-ip-country-region")) ||
    cleanValue(requestHeaders.get("x-vercel-ip-region"));
  const city =
    cleanValue(requestHeaders.get("x-vercel-ip-city")) ||
    cleanValue(requestHeaders.get("x-appengine-city"));
  const latitude = parseCoordinate(requestHeaders.get("x-vercel-ip-latitude"));
  const longitude = parseCoordinate(requestHeaders.get("x-vercel-ip-longitude"));

  return { country, region, city, latitude, longitude };
}

export function createVisitorFingerprint(ip: string, userAgent: string) {
  return crypto.createHash("sha256").update(`${ip}|${userAgent}`).digest("hex");
}

export function buildVisitorContext(requestHeaders: Headers): VisitorContext {
  const ip = getClientIp(requestHeaders);
  const userAgent = requestHeaders.get("user-agent") ?? "unknown";
  const isBot = isLikelyBot(userAgent);
  const location = getLocationFromHeaders(requestHeaders);

  return {
    ip,
    fingerprint: createVisitorFingerprint(ip, userAgent),
    userAgent,
    browser: getBrowser(userAgent),
    os: getOs(userAgent),
    deviceType: getDeviceType(userAgent),
    country: location.country,
    region: location.region,
    city: location.city,
    latitude: location.latitude,
    longitude: location.longitude,
    isBot,
  };
}

export function maskIp(ip: string) {
  if (!ip || ip === "0.0.0.0" || isPrivateIp(ip)) return "private";

  if (ip.includes(":")) {
    const parts = ip.split(":");
    return `${parts.slice(0, 2).join(":")}:****`;
  }

  const parts = ip.split(".");
  if (parts.length !== 4) return "unknown";
  return `${parts[0]}.${parts[1]}.*.*`;
}
