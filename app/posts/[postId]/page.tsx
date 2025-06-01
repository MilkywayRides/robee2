import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Clock, User, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db";
import { PostStatus } from "@prisma/client";
import { getTableOfContents } from "@/lib/markdown";
import { TableOfContents } from "@/components/posts/table-of-contents";
import styles from "./page.module.css";
import PostContent from "@/components/PostContent";
import { PostFeedback } from "@/components/posts/post-feedback";
import { ViewCounter } from "@/components/posts/view-counter";
import { AuthorStats } from "@/components/posts/author-stats";
import { auth } from "@/auth";
import Link from "next/link";

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
            _count: {
              select: {
                followers: true,
                following: true,
              },
            },
          },
        },
        tags: true,
        feedback: true,
      },
    });

    if (!post || !post.publishedAt) {
      return null;
    }

    // Get next and previous posts
    const [nextPost, prevPost] = await Promise.all([
      db.post.findFirst({
        where: {
          status: PostStatus.PUBLISHED,
          publishedAt: {
            gt: post.publishedAt,
          },
        },
        orderBy: {
          publishedAt: 'asc',
        },
        select: {
          id: true,
          title: true,
        },
      }),
      db.post.findFirst({
        where: {
          status: PostStatus.PUBLISHED,
          publishedAt: {
            lt: post.publishedAt,
          },
        },
        orderBy: {
          publishedAt: 'desc',
        },
        select: {
          id: true,
          title: true,
        },
      }),
    ]);

    return {
      ...post,
      nextPost,
      prevPost,
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.postId);
  const session = await auth();

  if (!post) {
    notFound();
  }

  // Calculate reading time (assuming 200 words per minute)
  const content = typeof post.content === 'string' ? post.content : JSON.stringify(post.content);
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Get table of contents from markdown content
  const toc = getTableOfContents(content);

  // Get user's feedback if authenticated
  const userFeedback = session?.user ? post.feedback.find(f => f.userId === session.user.id)?.type || null : null;

  // Check if current user is following the author
  const isFollowing = session?.user ? await db.follow.findFirst({
    where: {
      followerId: session.user.id,
      followingId: post.author?.id,
    },
  }) : false;

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-7xl mx-auto">
        {/* Post Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
          )}
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
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
              <ViewCounter postId={post.id} initialViews={post.views} />
            </div>

            {post.author && (
              <AuthorStats
                authorId={post.author.id}
                authorName={post.author.name}
                authorImage={post.author.image}
                followersCount={post.author._count.followers}
                followingCount={post.author._count.following}
                isFollowing={!!isFollowing}
                currentUserId={session?.user?.id}
              />
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
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
        <div className="flex flex-col lg:flex-row gap-8">
          <PostContent content={content} />

          {/* Table of Contents */}
          <div className="w-full lg:w-1/4 hidden lg:block">
            <div className="sticky top-8">
              <TableOfContents headings={toc} />
            </div>
          </div>
          <PostFeedback 
            postId={post.id}
            initialLikes={post.feedback.filter(f => f.type === "LIKE").length}
            initialDislikes={post.feedback.filter(f => f.type === "DISLIKE").length}
            userFeedback={userFeedback}
            isAuthenticated={!!session?.user}
          />
        </div>

        {/* Post Navigation */}
        <div className="mt-16 flex items-center justify-between border-t pt-8">
          {post.prevPost ? (
            <Button 
              variant="ghost" 
              asChild
              className="group relative flex items-center gap-4 px-4 py-6 hover:bg-muted/50 transition-colors"
            >
              <Link href={`/posts/${post.prevPost.id}`} className="flex items-center gap-4">
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium text-muted-foreground mb-1">Previous Post</span>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2 text-left">
                    {post.prevPost.title}
                  </span>
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </Button>
          ) : (
            <div />
          )}
          {post.nextPost ? (
            <Button 
              variant="ghost" 
              asChild
              className="group relative flex items-center gap-4 px-4 py-6 hover:bg-muted/50 transition-colors"
            >
              <Link href={`/posts/${post.nextPost.id}`} className="flex items-center gap-4">
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium text-muted-foreground mb-1">Next Post</span>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2 text-right">
                    {post.nextPost.title}
                  </span>
                </div>
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </article>
    </div>
  );
}

