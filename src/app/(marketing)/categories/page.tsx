import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { getCategories, type CategoryWithPostCount } from "@/lib/blog";
import { constructMetadata } from "@/lib/utils";
import Link from "next/link";

export const metadata = constructMetadata({
  title: "Categories",
  description: "Browse all blog categories on ComputerScienceX.com.",
});

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-semibold">Categories</h1>
        <p className="mt-3 text-muted-foreground">
          Categories are updated automatically when new posts are published.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {categories.length ? (
            categories.map((category: CategoryWithPostCount) => (
              <Badge key={category.id} variant="outline" className="rounded-full px-3 py-1">
                <Link href={`/categories/${category.slug}`}>
                  {category.name} ({category._count.posts})
                </Link>
              </Badge>
            ))
          ) : (
            <p className="text-muted-foreground">No categories yet.</p>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
