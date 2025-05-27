import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Post } from "@/types/post";
import { db } from "@/lib/db";
import { PostStatus } from "@prisma/client";

async function getPublishedPosts() {
  try {
    const posts = await db.post.findMany({
      where: {
        status: PostStatus.PUBLISHED,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        tags: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      },
    });

    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export default async function PostsPage() {
  const posts = await getPublishedPosts();

  if (!posts || posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">No Posts Found</h1>
          <p className="text-muted-foreground">
            There are no published posts available at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Latest Posts</h1>
        
        <div className="grid gap-8">
          {posts.map((post: Post) => {
            const wordCount = post.content.split(/\s+/).filter(Boolean).length;
            const readingTime = Math.ceil(wordCount / 200);

            return (
              <article key={post.id} className="group">
                <Link href={`/posts/${post.id}`} className="block">
                  <div className="space-y-4">
                    {post.coverImage && (
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <h2 className="text-2xl font-semibold group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      
                      {post.excerpt && (
                        <p className="text-muted-foreground line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{post.author?.name || "Anonymous"}</span>
                          {post.author && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-2"
                              onClick={async (e) => {
                                e.preventDefault();
                                try {
                                  const response = await fetch('/api/follow', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      followingId: post.author.id,
                                    }),
                                  });
                                  if (!response.ok) throw new Error('Failed to follow');
                                  toast.success('Successfully followed author');
                                } catch (error) {
                                  toast.error('Failed to follow author');
                                }
                              }}
                            >
                              Follow
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{readingTime} min read</span>
                        </div>
                        <time dateTime={post.publishedAt || post.createdAt}>
                          {format(new Date(post.publishedAt || post.createdAt), "MMMM d, yyyy")}
                        </time>
                      </div>
                      
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
