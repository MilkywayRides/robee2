import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Post } from "@/types/post";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { PostFeedback } from "@/components/posts/post-feedback";
import { StarRating } from "@/components/ui/star-rating";
import { toast } from "sonner";

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
      },
      include: {
        tags: true,
        feedback: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!post) {
      notFound();
    }

    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    notFound();
  }
}

function calculateRating(likes: number, dislikes: number): number {
  const total = likes + dislikes;
  if (total === 0) return 0;
  
  // Calculate percentage of likes
  const likePercentage = (likes / total) * 100;
  
  // Convert percentage to 5-star rating
  // 0% = 0 stars, 20% = 1 star, 40% = 2 stars, 60% = 3 stars, 80% = 4 stars, 100% = 5 stars
  return (likePercentage / 20);
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.postId);
  const session = await auth();

  if (!post) {
    return notFound();
  }

  // Calculate reading time (assuming 200 words per minute)
  const content = typeof post.content === 'string' ? post.content : JSON.stringify(post.content);
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Calculate likes and dislikes
  const likes = post.feedback.filter(f => f.type === "LIKE").length;
  const dislikes = post.feedback.filter(f => f.type === "DISLIKE").length;
  const rating = calculateRating(likes, dislikes);

  // Get user's feedback if logged in
  const userFeedback = session?.user?.id
    ? post.feedback.find(f => f.userId === session.user.id)?.type || null
    : null;

  return (
    <article className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author?.name || "Anonymous"}</span>
              {post.author && session?.user?.id && post.author.id !== session.user.id && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={async () => {
                    if (!post.author) return;
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
            
            <time dateTime={post.publishedAt?.toISOString() || post.createdAt.toISOString()}>
              {format(post.publishedAt || post.createdAt, "MMMM d, yyyy")}
            </time>
            <div className="flex items-center gap-2">
              <StarRating rating={rating} />
              <span className="text-xs">({likes + dislikes} ratings)</span>
            </div>
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
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="aspect-video rounded-lg overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <Separator />

        {/* Content */}
        <div className="prose dark:prose-invert max-w-none">
          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-8">{post.excerpt}</p>
          )}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>

        {/* Feedback */}
        <PostFeedback
          postId={post.id}
          initialLikes={likes}
          initialDislikes={dislikes}
          userFeedback={userFeedback}
        />
      </div>
    </article>
  );
}
