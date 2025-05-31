"use client";

import { Users, UserPlus, UserMinus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AuthorStatsProps {
  authorId: string;
  authorName: string | null;
  authorImage?: string | null;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
  currentUserId?: string;
}

export function AuthorStats({
  authorId,
  authorName,
  authorImage,
  followersCount,
  followingCount,
  isFollowing = false,
  currentUserId,
}: AuthorStatsProps) {
  const [following, setFollowing] = useState(isFollowing);
  const [followers, setFollowers] = useState(followersCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (!currentUserId) {
      toast.error("Please sign in to follow authors");
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followingId: authorId,
          action: following ? 'unfollow' : 'follow',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update follow status');
      }

      setFollowing(!following);
      setFollowers(prev => following ? prev - 1 : prev + 1);
      toast.success(following ? 'Unfollowed successfully' : 'Followed successfully');
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast.error('Failed to update follow status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <span className="font-medium hover:text-primary">@{authorName}</span>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/10">
                <AvatarImage src={authorImage || undefined} />
                <AvatarFallback className="text-lg">{authorName?.[0]?.toUpperCase() || 'A'}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-lg font-semibold">@{authorName}</h4>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">{formatNumber(followers)}</span>
                    <span>Followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-foreground">{formatNumber(followingCount)}</span>
                    <span>Following</span>
                  </div>
                </div>
              </div>
            </div>
            {currentUserId && currentUserId !== authorId && (
              <Button
                variant={following ? "secondary" : "default"}
                size="sm"
                className={cn(
                  "w-full transition-colors duration-200",
                  following && "bg-primary/10 hover:bg-primary/20"
                )}
                onClick={handleFollowToggle}
                disabled={isLoading}
              >
                {following ? (
                  <>
                    <UserMinus className="mr-2 h-4 w-4" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Follow
                  </>
                )}
              </Button>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        <div className="flex gap-2">
          <span className="tabular-nums">{formatNumber(followers)} followers</span>
          <span className="text-muted-foreground/50">•</span>
          <span className="tabular-nums">{formatNumber(followingCount)} following</span>
        </div>
      </div>

      {currentUserId && currentUserId !== authorId && (
        <Button
          variant={following ? "secondary" : "outline"}
          size="sm"
          className={cn(
            "transition-colors duration-200",
            following && "bg-primary/10 hover:bg-primary/20"
          )}
          onClick={handleFollowToggle}
          disabled={isLoading}
        >
          {following ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
} 