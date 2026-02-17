import { Prisma } from "@prisma/client";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { ensureUniqueSlug, slugify } from "@/lib/slug";
import { prisma } from "@/lib/prisma";
import { buildVisitorContext } from "@/lib/visitor";

const postCardInclude = {
  categories: {
    include: {
      category: true,
    },
  },
  _count: {
    select: {
      likes: true,
      views: {
        where: {
          isBot: false,
        },
      },
    },
  },
} satisfies Prisma.PostInclude;

type PostCardWithRelations = Prisma.PostGetPayload<{
  include: typeof postCardInclude;
}>;

export type PostCard = {
  id: number;
  title: string;
  slug: string;
  description: string;
  authorName: string;
  coverImageUrl: string | null;
  publishedAt: Date;
  categories: { name: string; slug: string }[];
  views: number;
  likes: number;
};

export type PostDetails = PostCard & {
  content: string;
  contentHtml: string;
  hasLiked: boolean;
};

export type AdminPostFormData = {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  coverImageUrl: string | null;
  categories: string[];
};

export type CategoryWithPostCount = Prisma.CategoryGetPayload<{
  include: {
    _count: {
      select: {
        posts: true;
      };
    };
  };
}>;

export async function markdownToHTML(markdown: string) {
  const transformed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      theme: {
        light: "min-light",
        dark: "min-dark",
      },
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(markdown);

  return transformed.toString();
}

function toPostCard(post: PostCardWithRelations): PostCard {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description,
    authorName: post.authorName,
    coverImageUrl: post.coverImageUrl,
    publishedAt: post.publishedAt,
    categories: post.categories.map((item) => ({
      name: item.category.name,
      slug: item.category.slug,
    })),
    views: post._count.views,
    likes: post._count.likes,
  };
}

function normalizeCategoryEntries(categories: string[]) {
  return Array.from(
    categories
      .map((category) => category.trim())
      .filter(Boolean)
      .map((category) => category.slice(0, 40))
      .reduce((map, categoryName) => {
        const categorySlug = slugify(categoryName);
        if (!categorySlug) return map;
        if (!map.has(categorySlug)) {
          map.set(categorySlug, categoryName);
        }
        return map;
      }, new Map<string, string>())
      .entries()
  );
}

async function generateUniquePostSlug(title: string, currentPostId?: number) {
  const baseSlug = slugify(title) || `post-${Date.now()}`;
  const similarSlugs = await prisma.post.findMany({
    where: {
      slug: {
        startsWith: baseSlug,
      },
    },
    select: {
      id: true,
      slug: true,
    },
  });

  const reservedSlugs = similarSlugs
    .filter((entry) => (currentPostId ? entry.id !== currentPostId : true))
    .map((entry) => entry.slug);

  return ensureUniqueSlug(baseSlug, reservedSlugs);
}

export async function getBlogPosts(): Promise<PostCard[]> {
  const posts = await prisma.post.findMany({
    include: postCardInclude,
    orderBy: {
      publishedAt: "desc",
    },
  });

  return posts.map(toPostCard);
}

export async function getLatestPosts(limit = 6): Promise<PostCard[]> {
  const posts = await prisma.post.findMany({
    include: postCardInclude,
    orderBy: {
      publishedAt: "desc",
    },
    take: limit,
  });

  return posts.map(toPostCard);
}

export async function getPostBySlug(slug: string, requestHeaders?: Headers): Promise<PostDetails | null> {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: postCardInclude,
  });

  if (!post) return null;

  const contentHtml = await markdownToHTML(post.content);
  let hasLiked = false;

  if (requestHeaders) {
    const fingerprint = buildVisitorContext(requestHeaders).fingerprint;

    const existingLike = await prisma.like.findUnique({
      where: {
        postId_fingerprint: {
          postId: post.id,
          fingerprint,
        },
      },
      select: { id: true },
    });

    hasLiked = Boolean(existingLike);
  }

  return {
    ...toPostCard(post),
    content: post.content,
    contentHtml,
    hasLiked,
  };
}

export async function getPostsByCategorySlug(categorySlug: string): Promise<PostCard[]> {
  const entries = await prisma.post.findMany({
    where: {
      categories: {
        some: {
          category: {
            slug: categorySlug,
          },
        },
      },
    },
    include: postCardInclude,
    orderBy: {
      publishedAt: "desc",
    },
  });

  return entries.map(toPostCard);
}

export async function getCategories(): Promise<CategoryWithPostCount[]> {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });
}

export async function createPost(input: {
  title: string;
  description: string;
  content: string;
  coverImageUrl?: string;
  categories: string[];
}) {
  const title = input.title.trim();
  const description = input.description.trim();
  const content = input.content.trim();

  if (!title || !description || !content) {
    throw new Error("Title, description, and content are required.");
  }

  if (input.categories.length === 0 || input.categories.length > 3) {
    throw new Error("A post must include between 1 and 3 categories.");
  }

  const categoryEntries = normalizeCategoryEntries(input.categories);

  if (categoryEntries.length === 0 || categoryEntries.length > 3) {
    throw new Error("A post must include between 1 and 3 categories.");
  }

  const finalSlug = await generateUniquePostSlug(title);

  const post = await prisma.post.create({
    data: {
      title,
      slug: finalSlug,
      description,
      content,
      coverImageUrl: input.coverImageUrl?.trim() || null,
      categories: {
        create: categoryEntries.map(([categorySlug, categoryName]) => {
          return {
            category: {
              connectOrCreate: {
                where: { slug: categorySlug },
                create: {
                  name: categoryName,
                  slug: categorySlug,
                },
              },
            },
          };
        }),
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
    },
  });

  return post;
}

export async function getAdminPostById(id: number): Promise<AdminPostFormData | null> {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      categories: {
        include: {
          category: true,
        },
      },
    },
  });

  if (!post) return null;

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description,
    content: post.content,
    coverImageUrl: post.coverImageUrl,
    categories: post.categories.map((item) => item.category.name),
  };
}

export async function updatePost(input: {
  id: number;
  title: string;
  description: string;
  content: string;
  coverImageUrl?: string;
  categories: string[];
}) {
  const title = input.title.trim();
  const description = input.description.trim();
  const content = input.content.trim();

  if (!title || !description || !content) {
    throw new Error("Title, description, and content are required.");
  }

  if (input.categories.length === 0 || input.categories.length > 3) {
    throw new Error("A post must include between 1 and 3 categories.");
  }

  const categoryEntries = normalizeCategoryEntries(input.categories);
  if (categoryEntries.length === 0 || categoryEntries.length > 3) {
    throw new Error("A post must include between 1 and 3 categories.");
  }

  const finalSlug = await generateUniquePostSlug(title, input.id);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.postCategory.deleteMany({
        where: { postId: input.id },
      });

      return tx.post.update({
        where: { id: input.id },
        data: {
          title,
          slug: finalSlug,
          description,
          content,
          coverImageUrl: input.coverImageUrl?.trim() || null,
          categories: {
            create: categoryEntries.map(([categorySlug, categoryName]) => ({
              category: {
                connectOrCreate: {
                  where: { slug: categorySlug },
                  create: {
                    name: categoryName,
                    slug: categorySlug,
                  },
                },
              },
            })),
          },
        },
        select: {
          id: true,
          slug: true,
          title: true,
        },
      });
    });

    return updated;
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      throw new Error("Post not found.");
    }
    throw error;
  }
}

export async function deletePost(id: number) {
  try {
    return await prisma.post.delete({
      where: { id },
      select: {
        id: true,
        slug: true,
        title: true,
      },
    });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      throw new Error("Post not found.");
    }
    throw error;
  }
}

export async function recordPostView(slug: string, requestHeaders: Headers) {
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!post) return null;

  const visitor = buildVisitorContext(requestHeaders);

  await prisma.viewEvent.create({
    data: {
      postId: post.id,
      path: `/blog/${slug}`,
      ip: visitor.ip,
      fingerprint: visitor.fingerprint,
      userAgent: visitor.userAgent,
      browser: visitor.browser,
      os: visitor.os,
      deviceType: visitor.deviceType,
      country: visitor.country,
      region: visitor.region,
      city: visitor.city,
      latitude: visitor.latitude,
      longitude: visitor.longitude,
      isBot: visitor.isBot,
    },
  });

  return {
    isBot: visitor.isBot,
  };
}

export async function likePost(slug: string, requestHeaders: Headers) {
  const post = await prisma.post.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!post) return { status: "missing" as const };

  const visitor = buildVisitorContext(requestHeaders);
  if (visitor.isBot) {
    return { status: "blocked" as const };
  }

  try {
    await prisma.like.create({
      data: {
        postId: post.id,
        ip: visitor.ip,
        fingerprint: visitor.fingerprint,
        userAgent: visitor.userAgent,
        browser: visitor.browser,
        os: visitor.os,
        deviceType: visitor.deviceType,
        country: visitor.country,
        region: visitor.region,
        city: visitor.city,
      },
    });
  } catch (error: unknown) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return { status: "already-liked" as const };
    }
    throw error;
  }

  const totalLikes = await prisma.like.count({
    where: {
      postId: post.id,
    },
  });

  return { status: "liked" as const, totalLikes };
}

export async function getAdminDashboardData() {
  const [postCount, totalViews, totalLikes, uniqueVisitorsRows, latestViews, topPosts, categories] =
    await Promise.all([
      prisma.post.count(),
      prisma.viewEvent.count({
        where: { isBot: false },
      }),
      prisma.like.count(),
      prisma.viewEvent.findMany({
        where: { isBot: false },
        distinct: ["fingerprint"],
        select: { fingerprint: true },
      }),
      prisma.viewEvent.findMany({
        where: { isBot: false },
        include: {
          post: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 120,
      }),
      prisma.post.findMany({
        include: {
          _count: {
            select: {
              likes: true,
              views: {
                where: {
                  isBot: false,
                },
              },
            },
          },
        },
        orderBy: {
          publishedAt: "desc",
        },
        take: 20,
      }),
      getCategories(),
    ]);

  return {
    postCount,
    totalViews,
    totalLikes,
    uniqueHumanVisitors: uniqueVisitorsRows.length,
    latestViews,
    topPosts: topPosts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      publishedAt: post.publishedAt,
      views: post._count.views,
      likes: post._count.likes,
    })),
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      postCount: category._count.posts,
    })),
  };
}
