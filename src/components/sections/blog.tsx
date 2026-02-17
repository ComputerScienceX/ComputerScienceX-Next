import BlogCard from "@/components/blog-card";
import Section from "@/components/section";
import { getBlogPosts } from "@/lib/blog";

export default async function BlogSection() {
  const allPosts = await getBlogPosts();

  return (
    <Section title="Blog" subtitle="Latest Articles">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allPosts.map((data) => (
          <BlogCard key={data.slug} data={data} />
        ))}
      </div>
    </Section>
  );
}
