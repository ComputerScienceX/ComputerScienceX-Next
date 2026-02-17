import { PostCard } from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function BlogCard({
  data,
}: {
  data: PostCard;
}) {
  return (
    <Link href={`/blog/${data.slug}`} className="group block h-full">
      <article className="flex h-full flex-col rounded-lg border bg-card p-4 transition-shadow duration-200 group-hover:shadow-md">
        {data.coverImageUrl ? (
          <img
            className="mb-4 h-48 w-full rounded-md border object-cover"
            src={data.coverImageUrl}
            alt={data.title}
          />
        ) : (
          <div className="mb-4 h-48 rounded-md border bg-muted" />
        )}

        <p className="mb-2 text-sm text-muted-foreground">
          <time dateTime={data.publishedAt.toISOString()}>{formatDate(data.publishedAt.toISOString())}</time>
        </p>

        <h2 className="mb-2 line-clamp-2 text-xl font-semibold">{data.title}</h2>
        <p className="mb-4 line-clamp-3 text-muted-foreground">{data.description}</p>

        <div className="mt-auto space-y-3">
          <div className="flex flex-wrap gap-2">
            {data.categories.map((category) => (
              <span
                key={category.slug}
                className="rounded-full border px-2 py-1 text-xs text-muted-foreground"
              >
                {category.name}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{data.views.toLocaleString()} views</span>
            <span>{data.likes.toLocaleString()} likes</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
