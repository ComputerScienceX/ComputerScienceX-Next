"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PostLikeButton({
  slug,
  initialLikes,
  initialHasLiked,
}: {
  slug: string;
  initialLikes: number;
  initialHasLiked: boolean;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialHasLiked);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleLike() {
    if (liked || loading) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/posts/${slug}/like`, {
        method: "POST",
        cache: "no-store",
      });
      const body = (await response.json()) as {
        status?: "liked" | "already-liked";
        totalLikes?: number;
        error?: string;
      };

      if (body.status === "liked") {
        setLiked(true);
        setLikes(body.totalLikes ?? likes + 1);
        setMessage("Thanks for liking this post.");
        return;
      }

      if (body.status === "already-liked") {
        setLiked(true);
        setMessage("You already liked this post.");
        return;
      }

      setMessage(body.error || "Unable to register your like.");
    } catch {
      setMessage("Network error while liking the post.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleLike} disabled={liked || loading}>
        {liked ? "Liked" : loading ? "Liking..." : "Like this post"}
      </Button>
      <p className="text-sm text-muted-foreground">{likes.toLocaleString()} total likes</p>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
