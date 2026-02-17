import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getPublicAdminPath } from "@/lib/admin-path";

const SESSION_COOKIE_NAME = "csx_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  username: string;
  exp: number;
};

function getSessionSecret() {
  return process.env.SESSION_SECRET || "change-this-session-secret";
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return crypto.createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function timingSafeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function createSessionToken(payload: SessionPayload) {
  const payloadPart = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(payloadPart);
  return `${payloadPart}.${signature}`;
}

function parseSessionToken(token: string): SessionPayload | null {
  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) return null;
  if (!timingSafeEqual(sign(payloadPart), signature)) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(payloadPart)) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function validateAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME || "";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";

  if (!expectedUsername || !expectedPassword) {
    return false;
  }

  return timingSafeEqual(username, expectedUsername) && timingSafeEqual(password, expectedPassword);
}

export async function createAdminSession(username: string) {
  const cookieStore = await cookies();
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken({ username, exp }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return parseSessionToken(token);
}

export async function isAdminAuthenticated() {
  return Boolean(await getAdminSession());
}

export async function requireAdminAuth() {
  const session = await getAdminSession();
  if (!session) {
    redirect(getPublicAdminPath("/login"));
  }
  return session;
}
