"use client";

import { useEffect, useRef } from "react";

export default function PostViewTracker({ slug }: { slug: string }) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;

    fetch(`/api/posts/${slug}/view`, {
      method: "POST",
      keepalive: true,
      cache: "no-store",
    }).catch(() => {
      // Ignore analytics transport errors on the client.
    });
  }, [slug]);

  return null;
}
