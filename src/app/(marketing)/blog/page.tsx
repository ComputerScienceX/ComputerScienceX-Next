import BlogCard from "@/components/blog-card";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getBlogPosts, type PostCard } from "@/lib/blog";
import { siteConfig } from "@/lib/config";
import { constructMetadata } from "@/lib/utils";

export const metadata = constructMetadata({
  title: "Blog",
  description: `Latest posts from ${siteConfig.name}.`,
});

export const dynamic = "force-dynamic";

export default async function Blog() {
  const allPosts = await getBlogPosts();

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Blog Articles</h1>
          <p className="mt-4 text-lg text-muted-foreground">Latest posts from {siteConfig.name}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 pb-8 md:grid-cols-2 lg:grid-cols-3">
          {allPosts.length ? (
            allPosts.map((data: PostCard) => <BlogCard key={data.id} data={data} />)
          ) : (
            <p className="text-muted-foreground">No posts published yet.</p>
          )}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
