import { likePost } from "@/lib/blog";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const result = await likePost(slug, request.headers);

  if (result.status === "missing") {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (result.status === "blocked") {
    return NextResponse.json({ error: "Bots cannot like posts." }, { status: 403 });
  }

  if (result.status === "already-liked") {
    return NextResponse.json({ status: "already-liked" }, { status: 200 });
  }

  return NextResponse.json({ status: "liked", totalLikes: result.totalLikes });
}
