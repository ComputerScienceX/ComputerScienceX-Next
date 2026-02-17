import CreatePostForm from "@/components/admin/create-post-form";
import { getPublicAdminPath } from "@/lib/admin-path";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <div className="space-y-2">
        <Link href={getPublicAdminPath()} className="text-sm text-muted-foreground underline-offset-4 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-semibold">Upload Blog Post</h1>
        <p className="text-muted-foreground">
          Provide title, description, categories, markdown content, and inline images/screenshots.
        </p>
      </div>
      <CreatePostForm adminBasePath={getPublicAdminPath()} />
    </main>
  );
}
