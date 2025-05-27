"use client";

import Link from "next/link";
import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Post } from "@/types/post";
import { formatNumber } from "@/lib/utils";
import { FollowButton } from "./follow-button";

interface PostCardClientProps {
  post: Post;
  readingTime: number;
  likes: number;
  dislikes: number;
}

export function PostCardClient({ post, readingTime, likes, dislikes }: PostCardClientProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // If the click originated from the follow button or its children, don't navigate
    if ((e.target as HTMLElement).closest('[data-follow-button]')) {
      e.preventDefault();
    }
  };

  return (
    <Link href={`/posts/${post.id}`} onClick={handleCardClick}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        {post.coverImage && (
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            <img
              src={post.coverImage}
              alt={post.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <CardHeader>
          <h2 className="text-xl font-semibold line-clamp-2">{post.title}</h2>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.author?.name || "Anonymous"}</span>
              {post.author && (
                <div data-follow-button>
                  <FollowButton authorId={post.author.id} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{readingTime} min read</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {post.excerpt && (
            <p className="text-muted-foreground line-clamp-3">{post.excerpt}</p>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
          <div className="ml-auto text-sm text-muted-foreground">
            {formatNumber(likes + dislikes)} reactions
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
} 