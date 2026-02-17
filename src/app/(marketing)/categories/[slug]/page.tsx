import BlogCard from "@/components/blog-card";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { getCategories, getPostsByCategorySlug } from "@/lib/blog";
import { constructMetadata } from "@/lib/utils";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return constructMetadata({
    title: `Category: ${slug}`,
    description: `Posts in the ${slug} category.`,
  });
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [posts, categories] = await Promise.all([getPostsByCategorySlug(slug), getCategories()]);
const category = categories.find(
  (item: Awaited<ReturnType<typeof getCategories>>[number]) => item.slug === slug
);


  if (!category) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold">{category.name}</h1>
        <p className="mt-3 text-muted-foreground">
          {category._count.posts} post(s) in this category.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.id} data={post} />
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
