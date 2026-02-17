"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type UploadedImage = {
  url: string;
};

function normalizeCategoryInput(raw: string) {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function CreatePostForm({ adminBasePath }: { adminBasePath: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const categoriesLeft = useMemo(() => Math.max(0, 3 - categories.length), [categories.length]);

  function addCategoriesFromInput() {
    if (!categoryInput.trim()) return;

    const nextValues = normalizeCategoryInput(categoryInput).slice(0, 3);
    const merged = Array.from(new Set([...categories, ...nextValues])).slice(0, 3);
    setCategories(merged);
    setCategoryInput("");
  }

  function removeCategory(category: string) {
    setCategories((current) => current.filter((item) => item !== category));
  }

  async function onUploadImages(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.currentTarget.files;
    if (!files?.length) return;

    setUploading(true);
    setError(null);

    try {
      const form = new FormData();
      for (const file of Array.from(files)) {
        form.append("files", file);
      }

      const response = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: form,
      });
      const body = (await response.json()) as { urls?: string[]; error?: string };

      if (!response.ok || !body.urls) {
        throw new Error(body.error || "Failed to upload images.");
      }

      const nextImages = body.urls.map((url) => ({ url }));
      setUploadedImages((previous) => [...nextImages, ...previous]);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Upload failed.";
      setError(message);
    } finally {
      setUploading(false);
      event.currentTarget.value = "";
    }
  }

  function insertImageMarkdown(url: string) {
    setContent((current) => `${current}\n\n![Screenshot](${url})\n`);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          content,
          coverImageUrl,
          categories,
        }),
      });
      const body = (await response.json()) as {
        ok?: boolean;
        error?: string;
        post?: { slug: string };
      };

      if (!response.ok || !body.ok || !body.post) {
        throw new Error(body.error || "Unable to create post.");
      }

      router.push(`${adminBasePath}?created=${body.post.slug}`);
      router.refresh();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unable to create post.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="title">Post title</Label>
        <Input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="How I built..."
          required
          maxLength={120}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Short description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="One-paragraph summary that appears in cards and metadata."
          required
          maxLength={240}
          className="min-h-24"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="coverImageUrl">Cover image URL (optional)</Label>
        <Input
          id="coverImageUrl"
          value={coverImageUrl}
          onChange={(event) => setCoverImageUrl(event.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-3">
        <div className="grid gap-2">
          <Label htmlFor="categories">Categories (up to 3)</Label>
          <div className="flex gap-2">
            <Input
              id="categories"
              value={categoryInput}
              onChange={(event) => setCategoryInput(event.target.value)}
              placeholder="AI, Coding, Notes"
              disabled={categories.length >= 3}
            />
            <Button type="button" variant="outline" onClick={addCategoriesFromInput} disabled={categories.length >= 3}>
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            New categories are created automatically. {categoriesLeft} slot(s) left.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => removeCategory(category)}
              className="rounded-full border px-3 py-1 text-xs hover:bg-muted"
            >
              {category} ×
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid gap-2">
          <Label htmlFor="uploads">Upload screenshots / images</Label>
          <Input id="uploads" type="file" multiple accept="image/*" onChange={onUploadImages} />
          <p className="text-xs text-muted-foreground">
            Upload images, then click one to inject markdown inline into the post body.
          </p>
        </div>

        <div className="max-h-48 space-y-2 overflow-auto rounded-md border p-3">
          {uploadedImages.length ? (
            uploadedImages.map((image) => (
              <button
                type="button"
                key={image.url}
                className="block w-full rounded border p-2 text-left text-xs hover:bg-muted"
                onClick={() => insertImageMarkdown(image.url)}
              >
                {image.url}
              </button>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">No uploaded images yet.</p>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="content">Post body (Markdown supported)</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="# Intro&#10;&#10;Write your post with markdown and inline images."
          required
          className="min-h-[420px]"
        />
      </div>

      {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting || uploading}>
          {submitting ? "Publishing..." : "Publish Post"}
        </Button>
        {uploading ? <span className="text-sm text-muted-foreground">Uploading images...</span> : null}
      </div>
    </form>
  );
}
