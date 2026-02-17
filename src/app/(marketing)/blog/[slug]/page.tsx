import PostLikeButton from "@/components/post-like-button";
import PostViewTracker from "@/components/post-view-tracker";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { getPostBySlug } from "@/lib/blog";
import { siteConfig } from "@/lib/config";
import { constructMetadata, formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return undefined;

  const image = post.coverImageUrl || `${siteConfig.url}/og?title=${encodeURIComponent(post.title)}`;

  return constructMetadata({
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      url: `${siteConfig.url}/blog/${post.slug}`,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [image],
    },
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const requestHeaders = await headers();
  const post = await getPostBySlug(slug, requestHeaders);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <PostViewTracker slug={slug} />

      <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.title,
              datePublished: post.publishedAt.toISOString(),
              dateModified: post.publishedAt.toISOString(),
              description: post.description,
              image: post.coverImageUrl || `${siteConfig.url}/og?title=${encodeURIComponent(post.title)}`,
              author: {
                "@type": "Person",
                name: post.authorName,
              },
              interactionStatistic: [
                {
                  "@type": "InteractionCounter",
                  interactionType: "https://schema.org/ViewAction",
                  userInteractionCount: post.views,
                },
                {
                  "@type": "InteractionCounter",
                  interactionType: "https://schema.org/LikeAction",
                  userInteractionCount: post.likes,
                },
              ],
            }),
          }}
        />

        {post.coverImageUrl ? (
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="mb-8 h-auto w-full rounded-lg border object-cover"
          />
        ) : null}

        <div className="mb-5 flex flex-wrap items-center gap-2">
          {post.categories.map((category) => (
            <Badge key={category.slug} variant="outline" className="rounded-full px-3 py-1">
              <Link href={`/categories/${category.slug}`}>{category.name}</Link>
            </Badge>
          ))}
        </div>

        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{post.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>Published: {formatDate(post.publishedAt.toISOString())}</span>
          <span>{post.views.toLocaleString()} views</span>
          <span>{post.likes.toLocaleString()} likes</span>
          <span>Author: {post.authorName}</span>
        </div>

        <div className="mt-6">
          <PostLikeButton slug={post.slug} initialLikes={post.likes} initialHasLiked={post.hasLiked} />
        </div>

        <article
          className="prose prose-slate mt-10 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </section>

      <SiteFooter />
    </main>
  );
}
