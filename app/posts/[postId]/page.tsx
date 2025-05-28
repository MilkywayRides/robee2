import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Clock, User, Eye, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Post, PostFeedback, User as PrismaUser } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PostFeedback as PostFeedbackComponent } from "@/components/posts/post-feedback";
import { StarRating } from "@/components/ui/star-rating";
import { toast } from "sonner";
import { AuthorInfo } from "@/components/posts/author-info";
import { Metadata, ResolvingMetadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PostContent } from "@/components/posts/post-content";

interface PostPageProps {
  params: { postId: string };
}

type PostWithRelations = Post & {
  tags: { id: string; name:string }[];
  feedback: PostFeedback[];
  author: (PrismaUser & {
    _count: {
      followers: number;
    };
  }) | null;
};

// Generate metadata for the page
export async function generateMetadata(
  { params }: PostPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPost(params.postId);
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: post.title,
    description: post.excerpt || `Read ${post.title} by ${post.author?.name || 'Anonymous'}`,
    openGraph: {
      title: post.title,
      description: post.excerpt || `Read ${post.title} by ${post.author?.name || 'Anonymous'}`,
      type: 'article',
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: post.author?.name ? [post.author.name] : undefined,
      tags: post.tags.map(tag => tag.name),
      images: post.coverImage ? [post.coverImage, ...previousImages] : previousImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || `Read ${post.title} by ${post.author?.name || 'Anonymous'}`,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

async function getPost(postId: string): Promise<PostWithRelations> {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        tags: true,
        feedback: true,
        author: {
          include: {
            _count: {
              select: { followers: true },
            },
          },
        },
      },
    });

    if (!post) {
      notFound();
    }

    // Increment views
    await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });

    return post as PostWithRelations;
  } catch (error) {
    console.error("Error fetching post:", error);
    notFound();
  }
}

function calculateRating(likes: number, dislikes: number): number {
  const total = likes + dislikes;
  if (total === 0) return 0;
  const likePercentage = (likes / total) * 100;
  return likePercentage / 20;
}

// Loading component for the post content
function PostContentSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
      </div>
      <Skeleton className="aspect-video w-full" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.postId);
  const session = await auth();

  if (!post) {
    notFound();
  }

  const content = typeof post.content === 'string' ? post.content : JSON.stringify(post.content);
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  const likes = post.feedback.filter(f => f.type === "LIKE").length;
  const dislikes = post.feedback.filter(f => f.type === "DISLIKE").length;
  const rating = calculateRating(likes, dislikes);

  const userFeedback = session?.user?.id
    ? post.feedback.find(f => f.userId === session.user.id)?.type || null
    : null;

  let isFollowing = false;
  if (session?.user?.id && post.author?.id) {
    try {
      const follow = await prisma.follow.findFirst({
        where: {
          followerId: session.user.id,
          followingId: post.author.id,
        },
      });
      isFollowing = !!follow;
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  }

  // Generate structured data for the article
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.coverImage,
    "author": {
      "@type": "Person",
      "name": post.author?.name || "Anonymous",
      "image": post.author?.image,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Your Blog Name",
      "logo": {
        "@type": "ImageObject",
        "url": "https://yourblog.com/logo.png"
      }
    },
    "datePublished": post.publishedAt?.toISOString(),
    "dateModified": post.updatedAt.toISOString(),
    "wordCount": wordCount,
    "keywords": post.tags.map(tag => tag.name).join(", "),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://yourblog.com/posts/${post.id}`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-4 gap-12">
          <div className="lg:col-span-3">
            <article itemScope itemType="https://schema.org/Article">
              <header className="mb-8">
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4" itemProp="headline">
                  {post.title}
                </h1>
                <p className="text-xl text-muted-foreground mb-6" itemProp="description">
                  {post.excerpt}
                </p>
                <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{readingTime} min read</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{post.views} views</span>
                  </div>
                  <StarRating rating={rating} totalRatings={likes + dislikes} />
                </div>
              </header>

              {post.coverImage && (
                <div className="aspect-video relative mb-8 rounded-lg overflow-hidden border">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                    priority
                    itemProp="image"
                  />
                </div>
              )}

              <Suspense fallback={<PostContentSkeleton />}>
                <PostContent content={content} />
              </Suspense>

              <Separator className="my-8" />

              <footer className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" itemProp="keywords">
                    {tag.name}
                  </Badge>
                ))}
              </footer>
            </article>

            <Card className="mt-12">
              <CardHeader>
                <CardTitle>Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <PostFeedbackComponent
                  postId={post.id}
                  initialLikes={likes}
                  initialDislikes={dislikes}
                  userFeedback={userFeedback}
                />
              </CardContent>
            </Card>
          </div>

          <aside className="lg:col-span-1 space-y-8">
            {post.author && (
              <Card>
                <CardHeader>
                  <CardTitle>About the Author</CardTitle>
                </CardHeader>
                <CardContent>
                  <AuthorInfo 
                    author={post.author} 
                    isFollowing={isFollowing} 
                    currentUserId={session?.user?.id}
                  />
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  Published on {format(new Date(post.publishedAt || post.createdAt), "MMMM d, yyyy")}
                </CardFooter>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Table of Contents</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Navigation for this article will appear here.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}