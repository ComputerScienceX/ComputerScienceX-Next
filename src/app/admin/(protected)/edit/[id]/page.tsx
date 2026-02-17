import CreatePostForm from "@/components/admin/create-post-form";
import { getPublicAdminPath } from "@/lib/admin-path";
import { getAdminPostById } from "@/lib/blog";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId) || postId <= 0) {
    notFound();
  }

  const post = await getAdminPostById(postId);
  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <div className="space-y-2">
        <Link href={getPublicAdminPath()} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-semibold">Edit Blog Post</h1>
        <p className="text-muted-foreground">
          Update title, description, categories, markdown content, and cover image.
        </p>
      </div>
      <CreatePostForm adminBasePath={getPublicAdminPath()} mode="edit" initialPost={post} />
    </main>
  );
}
