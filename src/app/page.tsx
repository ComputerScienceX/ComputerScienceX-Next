import BlogCard from "@/components/blog-card";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCategories, getLatestPosts } from "@/lib/blog";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Home() {
  const featuredPromise = getLatestPosts(6);
  const categoriesPromise = getCategories();

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="border-b bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            ComputerScienceX.com
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Personal engineering notes, deep dives, and build logs.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            A personal blog by one developer. Expect detailed writeups on software engineering,
            product building, debugging, infrastructure, and experiments.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link href="/blog">Read All Posts</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/categories">Browse Categories</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Latest Posts</h2>
          <Link href="/blog" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            View all posts
          </Link>
        </div>
        <LatestPosts featuredPromise={featuredPromise} />
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6">
        <h2 className="mb-4 text-2xl font-semibold">Categories</h2>
        <CategoryList categoriesPromise={categoriesPromise} />
      </section>

      <SiteFooter />
    </main>
  );
}

async function LatestPosts({
  featuredPromise,
}: {
  featuredPromise: ReturnType<typeof getLatestPosts>;
}) {
  const posts = await featuredPromise;

  if (!posts.length) {
    return (
      <p className="rounded-md border bg-card px-4 py-6 text-muted-foreground">
        No posts yet. Publish your first post from the hidden admin dashboard.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard key={post.id} data={post} />
      ))}
    </div>
  );
}

async function CategoryList({
  categoriesPromise,
}: {
  categoriesPromise: ReturnType<typeof getCategories>;
}) {
  const categories = await categoriesPromise;

  if (!categories.length) {
    return <p className="text-muted-foreground">No categories yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Badge key={category.id} variant="outline" className="rounded-full px-3 py-1">
          <Link href={`/categories/${category.slug}`}>
            {category.name} ({category._count.posts})
          </Link>
        </Badge>
      ))}
    </div>
  );
}
