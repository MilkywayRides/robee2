"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
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
    <div className="inline-flex items-center rounded-lg border bg-card p-1 shadow-sm">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          currentFeedback === "LIKE" && [
            "bg-green-50 text-green-700 hover:bg-green-100",
            "dark:bg-green-950/50 dark:text-green-400 dark:hover:bg-green-950/70"
          ],
          isSubmitting && "pointer-events-none opacity-50"
        )}
        onClick={() => handleFeedback("LIKE")}
        disabled={isSubmitting}
      >
        {isSubmitting && currentFeedback === "LIKE" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ThumbsUp 
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              currentFeedback === "LIKE" && "scale-110"
            )} 
          />
        )}
        <span className="tabular-nums">{formatNumber(likes)}</span>
      </Button>

      <div className="mx-1 h-4 w-px bg-border" />

      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
          "hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          currentFeedback === "DISLIKE" && [
            "bg-red-50 text-red-700 hover:bg-red-100",
            "dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-950/70"
          ],
          isSubmitting && "pointer-events-none opacity-50"
        )}
        onClick={() => handleFeedback("DISLIKE")}
        disabled={isSubmitting}
      >
        {isSubmitting && currentFeedback === "DISLIKE" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ThumbsDown 
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              currentFeedback === "DISLIKE" && "scale-110"
            )} 
          />
        )}
        <span className="tabular-nums">{formatNumber(dislikes)}</span>
      </Button>
    </div>
  );
}