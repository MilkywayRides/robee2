import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Clock, User, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { PostStatus } from "@prisma/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getTableOfContents } from "@/lib/markdown";
import { TableOfContents } from "@/components/posts/table-of-contents";
import styles from "./page.module.css";

interface PostPageProps {
  params: {
    postId: string;
  };
}

async function getPost(postId: string) {
  try {
    const post = await db.post.findUnique({
      where: {
        id: postId,
        status: PostStatus.PUBLISHED,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        tags: true,
        feedback: true,
      },
    });

    if (!post) {
      return null;
    }

    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.postId);

  if (!post) {
    notFound();
  }

  // Calculate reading time (assuming 200 words per minute)
  const content = typeof post.content === 'string' ? post.content : JSON.stringify(post.content);
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Get table of contents from markdown content
  const toc = getTableOfContents(content);

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        {/* Post Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{readingTime} min read</span>
            </div>
            {post.publishedAt && (
              <time dateTime={post.publishedAt.toISOString()}>
                {format(post.publishedAt, "MMMM d, yyyy")}
              </time>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </header>

        <Separator className="my-8" />

        {/* Main Content */}
        <div className="grid grid-cols-[1fr,300px] gap-8">
          <div className={styles.prose}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>

          {/* Table of Contents */}
          <div className="hidden lg:block">
            <div className="sticky top-8">
              <TableOfContents headings={toc} />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
