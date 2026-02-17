const FALLBACK_ADMIN_SLUG = "csx-admin-portal";

export function getAdminRouteSlug() {
  const raw = process.env.ADMIN_ROUTE_SLUG?.trim().toLowerCase();
  if (!raw) return FALLBACK_ADMIN_SLUG;
  return raw.replace(/^\/+|\/+$/g, "");
}

export function getPublicAdminPath(path = "") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${getAdminRouteSlug()}${normalized === "/" ? "" : normalized}`;
}
