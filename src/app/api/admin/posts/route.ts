import { isAdminAuthenticated } from "@/lib/auth";
import { createPost } from "@/lib/blog";
import { NextResponse } from "next/server";
import { z } from "zod";

const createPostSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(240),
  content: z.string().min(50),
  coverImageUrl: z.string().url().or(z.literal("")).optional(),
  categories: z.array(z.string().min(2).max(40)).min(1).max(3),
});

export async function POST(request: Request) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsedBody: z.infer<typeof createPostSchema>;

  try {
    const json = await request.json();
    parsedBody = createPostSchema.parse(json);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const created = await createPost({
      title: parsedBody.title,
      description: parsedBody.description,
      content: parsedBody.content,
      coverImageUrl: parsedBody.coverImageUrl,
      categories: parsedBody.categories,
    });

    return NextResponse.json({
      ok: true,
      post: created,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to create post.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
