"use client";

import { ArrowLeft, Bot, Eye, Maximize2, Save, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StarRating } from "@/components/ui/star-rating";
import { format } from "date-fns";
import { toast } from "sonner";
import { useCallback, useState } from "react";

interface PostHeaderProps {
  title: string;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  readingTime: number;
  publishedAt: Date | null;
  createdAt: Date;
  rating: number;
  totalRatings: number;
  currentUserId?: string;
  isFollowing?: boolean;
}

export function PostHeader({
  title,
  author,
  readingTime,
  publishedAt,
  createdAt,
  rating,
  totalRatings,
  currentUserId,
  isFollowing = false,
}: PostHeaderProps) {
  const [following, setFollowing] = useState(isFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = useCallback(async () => {
    if (!author || isLoading) return;
    
    // Optimistic update
    const newFollowingState = !following;
    setFollowing(newFollowingState);
    
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followingId: author.id,
          action: newFollowingState ? 'follow' : 'unfollow',
        }),
      });
      
      if (!response.ok) {
        // Revert optimistic update on error
        setFollowing(!newFollowingState);
        const data = await response.text();
        if (data === "Already following") {
          toast.info("You are already following this author");
          return;
        }
        throw new Error('Failed to update follow status');
      }
      
      toast.success(newFollowingState ? 'Successfully followed author' : 'Successfully unfollowed author');
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  }, [author, following, isLoading]);

  return (
    <header className="mb-8">
      <h1 className="text-4xl font-bold mb-4">{title}</h1>
      <div className="flex items-center gap-4 text-muted-foreground">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{author?.name || "Anonymous"}</span>
          {author && currentUserId && author.id !== currentUserId && (
            <Button
              variant={following ? "secondary" : "outline"}
              size="sm"
              className="ml-2 transition-colors duration-200"
              onClick={handleFollowToggle}
              disabled={isLoading}
            >
              {following ? "Following" : "Follow"}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{readingTime} min read</span>
        </div>
        <time dateTime={publishedAt?.toISOString() || createdAt.toISOString()}>
          {format(publishedAt || createdAt, "MMMM d, yyyy")}
        </time>
        <div className="flex items-center gap-2">
          <StarRating rating={rating} />
          <span className="text-xs">({totalRatings} ratings)</span>
        </div>
      </div>
    </header>
  );
}