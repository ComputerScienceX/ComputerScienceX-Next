import { isAdminAuthenticated } from "@/lib/auth";
import { deletePost, updatePost } from "@/lib/blog";
import { NextResponse } from "next/server";
import { z } from "zod";

const updatePostSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(240),
  content: z.string().min(50),
  coverImageUrl: z.string().url().or(z.literal("")).optional(),
  categories: z.array(z.string().min(2).max(40)).min(1).max(3),
});

function parsePostId(raw: string) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const postId = parsePostId(rawId);
  if (!postId) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  let parsedBody: z.infer<typeof updatePostSchema>;

  try {
    const json = await request.json();
    const result = updatePostSchema.safeParse(json);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join(".") || "body",
        message: issue.message,
      }));
      return NextResponse.json(
        {
          error: "Invalid request body.",
          details,
        },
        { status: 400 }
      );
    }
    parsedBody = result.data;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const updated = await updatePost({
      id: postId,
      title: parsedBody.title,
      description: parsedBody.description,
      content: parsedBody.content,
      coverImageUrl: parsedBody.coverImageUrl,
      categories: parsedBody.categories,
    });

    return NextResponse.json({
      ok: true,
      post: updated,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to update post.";
    const status = message === "Post not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: rawId } = await context.params;
  const postId = parsePostId(rawId);
  if (!postId) {
    return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
  }

  try {
    const removed = await deletePost(postId);
    return NextResponse.json({
      ok: true,
      post: removed,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to delete post.";
    const status = message === "Post not found." ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
