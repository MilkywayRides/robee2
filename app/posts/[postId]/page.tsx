import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Post } from "@/types/post";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { PostFeedback } from "@/components/posts/post-feedback";
import { PostHeader } from "@/components/posts/post-header";
import { StarRating } from "@/components/ui/star-rating";
import { toast } from "sonner";
import { Prisma } from "@prisma/client";

interface PostPageProps {
  params: { postId: string };
}

async function getPost(postId: string) {
  try {
    const post = await prisma.post.findUnique({
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
    notFound();
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

  // Check if user is following the author
  let isFollowing = false;
  if (session?.user?.id && post.author?.id) {
    try {
      const follow = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "Follow"
        WHERE "followerId" = ${session.user.id}
        AND "followingId" = ${post.author.id}
      `;
      isFollowing = follow.length > 0;
    } catch (error) {
      console.error("Error checking follow status:", error);
      // Continue with isFollowing as false if there's an error
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-3xl mx-auto">
        <PostHeader
          title={post.title}
          author={post.author}
          readingTime={readingTime}
          publishedAt={post.publishedAt}
          createdAt={post.createdAt}
          rating={rating}
          totalRatings={likes + dislikes}
          currentUserId={session?.user?.id}
          isFollowing={isFollowing}
        />
        {post.coverImage && (
          <div className="aspect-video relative mb-8 rounded-lg overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <div className="prose prose-lg max-w-none">
          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-8">{post.excerpt}</p>
          )}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>
        <footer className="mt-8 pt-8 border-t">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        </footer>
        <PostFeedback
          postId={post.id}
          initialLikes={likes}
          initialDislikes={dislikes}
          userFeedback={userFeedback}
        />
      </article>
    </div>
  );
}
