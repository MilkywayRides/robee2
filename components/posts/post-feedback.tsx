"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";

interface PostFeedbackProps {
  postId: string;
  initialLikes: number;
  initialDislikes: number;
  userFeedback: "LIKE" | "DISLIKE" | null;
}

export function PostFeedback({
  postId,
  initialLikes,
  initialDislikes,
  userFeedback: initialUserFeedback,
}: PostFeedbackProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [currentFeedback, setCurrentFeedback] = useState<"LIKE" | "DISLIKE" | null>(initialUserFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (type: "LIKE" | "DISLIKE") => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Optimistically update the UI
    const previousFeedback = currentFeedback;
    const newFeedback = previousFeedback === type ? null : type;
    setCurrentFeedback(newFeedback);

    // Optimistically update counts
    if (previousFeedback === "LIKE") {
      setLikes(prev => prev - 1);
    } else if (previousFeedback === "DISLIKE") {
      setDislikes(prev => prev - 1);
    }

    if (newFeedback === "LIKE") {
      setLikes(prev => prev + 1);
    } else if (newFeedback === "DISLIKE") {
      setDislikes(prev => prev + 1);
    }

    try {
      const response = await fetch(`/api/posts/${postId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: newFeedback }),
      });

      if (!response.ok) {
        // Revert optimistic updates if the request fails
        setCurrentFeedback(previousFeedback);
        setLikes(initialLikes);
        setDislikes(initialDislikes);
        throw new Error("Failed to update feedback");
      }
    } catch (error) {
      console.error("Error updating feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex items-center gap-2",
          currentFeedback === "LIKE" && "text-blue-500"
        )}
        onClick={() => handleFeedback("LIKE")}
        disabled={isSubmitting}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{formatNumber(likes)}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex items-center gap-2",
          currentFeedback === "DISLIKE" && "text-red-500"
        )}
        onClick={() => handleFeedback("DISLIKE")}
        disabled={isSubmitting}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{formatNumber(dislikes)}</span>
      </Button>
    </div>
  );
} 