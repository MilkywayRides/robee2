import { db } from "@/lib/db";
import { PostStatus } from "@prisma/client";
import { format } from "date-fns";
import { Clock, User, Tag } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ViewCounter } from "@/components/posts/view-counter";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

async function getFollowingPosts(userId: string) {
  const posts = await db.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      author: {
        followers: {
          some: {
            followerId: userId,
          },
        },
      },
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
    orderBy: {
      publishedAt: 'desc',
    },
  });

  return posts;
}

export default async function FollowingPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const posts = await getFollowingPosts(session.user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Following Feed</h1>
          <Button asChild variant="outline">
            <Link href="/posts">All Posts</Link>
          </Button>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No Posts Yet</h2>
            <p className="text-muted-foreground mb-4">
              Posts from people you follow will appear here.
            </p>
            <Button asChild>
              <Link href="/posts">Discover Posts</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => {
              // Calculate reading time (assuming 200 words per minute)
              const content = typeof post.content === 'string' ? post.content : JSON.stringify(post.content);
              const wordCount = content.split(/\s+/).filter(Boolean).length;
              const readingTime = Math.ceil(wordCount / 200);

              return (
                <article key={post.id} className="group">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {post.author && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{post.author.name}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{readingTime} min read</span>
                      </div>
                      {post.publishedAt && (
                        <time dateTime={post.publishedAt.toISOString()}>
                          {format(post.publishedAt, "MMMM d, yyyy")}
                        </time>
                      )}
                      <ViewCounter postId={post.id} initialViews={post.views} />
                    </div>

                    <Link href={`/posts/${post.id}`} className="space-y-2">
                      <h2 className="text-2xl font-semibold tracking-tight group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-muted-foreground line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </Link>

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
                  </div>
                  <Separator className="mt-8" />
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 