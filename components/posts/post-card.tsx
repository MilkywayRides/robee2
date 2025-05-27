import Link from "next/link";
import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Post } from "@/types/post";
import { formatNumber } from "@/lib/utils";
import { PostCardClient } from "./post-card-client";

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  // Calculate reading time (assuming 200 words per minute)
  const content = typeof post.content === 'string' ? post.content : JSON.stringify(post.content);
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Calculate likes and dislikes
  const likes = post.feedback.filter(f => f.type === "LIKE").length;
  const dislikes = post.feedback.filter(f => f.type === "DISLIKE").length;

  return (
    <PostCardClient 
      post={post}
      readingTime={readingTime}
      likes={likes}
      dislikes={dislikes}
    />
  );
} 