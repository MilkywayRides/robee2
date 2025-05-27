"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface FollowButtonProps {
  authorId: string;
}

export function FollowButton({ authorId }: FollowButtonProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  if (!userId || userId === authorId) return null;

  const handleFollow = async () => {
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followingId: authorId,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to follow');
      toast.success('Successfully followed author');
    } catch (error) {
      toast.error('Failed to follow author');
    }
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Button
        variant="outline"
        size="sm"
        className="ml-2"
        onClick={handleFollow}
      >
        Follow
      </Button>
    </div>
  );
} 