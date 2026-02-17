import GeoMap from "@/components/admin/geo-map";
import PostRowActions from "@/components/admin/post-row-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPublicAdminPath } from "@/lib/admin-path";
import { getAdminDashboardData } from "@/lib/blog";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string; deleted?: string }>;
}) {
  const params = await searchParams;
  const data = await getAdminDashboardData();
  const adminBasePath = getPublicAdminPath();

  const mapPoints = data.latestViews
    .filter((event) => event.latitude !== null && event.longitude !== null)
    .slice(0, 100)
    .map((event) => ({
      id: event.id,
      latitude: event.latitude as number,
      longitude: event.longitude as number,
      city: event.city,
      country: event.country,
      createdAt: event.createdAt.toISOString(),
    }));

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6">
      {params.created ? (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Post published: <Link href={`/blog/${params.created}`} className="underline">{params.created}</Link>
        </div>
      ) : null}
      {params.updated ? (
        <div className="rounded-md border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          Post updated: <Link href={`/blog/${params.updated}`} className="underline">{params.updated}</Link>
        </div>
      ) : null}
      {params.deleted ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Post deleted: <span className="font-mono">{params.deleted}</span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button asChild>
          <Link href={getPublicAdminPath("/new-post")}>Upload New Blog Post</Link>
        </Button>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Posts" value={data.postCount.toLocaleString()} />
        <MetricCard label="Human Visitors" value={data.uniqueHumanVisitors.toLocaleString()} />
        <MetricCard label="Total Views" value={data.totalViews.toLocaleString()} />
        <MetricCard label="Total Likes" value={data.totalLikes.toLocaleString()} />
      </section>

      <GeoMap points={mapPoints} />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Post Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Post</th>
                    <th className="py-2 pr-4">Views</th>
                    <th className="py-2">Likes</th>
                    <th className="py-2 pl-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPosts.map((post) => (
                    <tr key={post.id} className="border-b align-top">
                      <td className="py-2 pr-4">
                        <Link href={`/blog/${post.slug}`} className="underline-offset-4 hover:underline">
                          {post.title}
                        </Link>
                      </td>
                      <td className="py-2 pr-4">{post.views.toLocaleString()}</td>
                      <td className="py-2">{post.likes.toLocaleString()}</td>
                      <td className="py-2 pl-4">
                        <PostRowActions
                          postId={post.id}
                          postSlug={post.slug}
                          postTitle={post.title}
                          adminBasePath={adminBasePath}
                        />
                      </td>
                    </tr>
                  ))}
                  {!data.topPosts.length ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-muted-foreground">
                        No posts yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Visitor Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 space-y-3 overflow-auto">
              {data.latestViews.length ? (
                data.latestViews.map((event) => (
                  <article key={event.id} className="rounded-md border p-3 text-sm">
                    <p className="font-medium">
                      {event.post?.title ? (
                        <Link href={`/blog/${event.post.slug}`} className="underline-offset-4 hover:underline">
                          {event.post.title}
                        </Link>
                      ) : (
                        "Unknown post"
                      )}
                    </p>
                    <p className="mt-1 text-muted-foreground">
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-1">
                      IP: <span className="font-mono">{event.ip}</span>
                    </p>
                    <p>
                      Location: {event.city || "Unknown city"}, {event.region || "Unknown region"},{" "}
                      {event.country || "Unknown country"}
                    </p>
                    <p>
                      Device: {event.deviceType} | {event.browser} | {event.os}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No visitor data yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex max-h-48 flex-wrap gap-2 overflow-auto">
            {data.categories.length ? (
              data.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
                >
                  {category.name} ({category.postCount})
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No categories yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
