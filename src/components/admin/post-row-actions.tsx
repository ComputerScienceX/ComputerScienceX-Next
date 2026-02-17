"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PostRowActions({
  postId,
  postTitle,
  postSlug,
  adminBasePath,
}: {
  postId: number;
  postTitle: string;
  postSlug: string;
  adminBasePath: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    const confirmed = window.confirm(`Delete "${postTitle}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
      });
      const body = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok) {
        throw new Error(body.error || "Unable to delete post.");
      }

      router.push(`${adminBasePath}?deleted=${encodeURIComponent(postSlug)}`);
      router.refresh();
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Unable to delete post.";
      setError(message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={`${adminBasePath}/edit/${postId}`}>Edit</Link>
        </Button>
        <Button size="sm" variant="destructive" disabled={deleting} onClick={onDelete}>
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
