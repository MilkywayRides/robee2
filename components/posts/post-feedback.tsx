"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatNumber } from "@/lib/utils";

interface PostFeedbackProps {
  postId: string;
  initialLikes: number;
  initialDislikes: number;
  userFeedback?: "LIKE" | "DISLIKE" | null;
}

export function PostFeedback({
  postId,
  initialLikes,
  initialDislikes,
  userFeedback = null,
}: PostFeedbackProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [currentFeedback, setCurrentFeedback] = useState<"LIKE" | "DISLIKE" | null>(userFeedback);
  const [isLoading, setIsLoading] = useState(false);

  const handleFeedback = async (type: "LIKE" | "DISLIKE") => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/posts/${postId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      const data = await response.json();

      // Update counts based on the response
      setLikes(data.likes);
      setDislikes(data.dislikes);
      setCurrentFeedback(data.userFeedback);

      toast.success("Feedback submitted successfully");
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-8 pt-4 border-t">
      <Button
        variant={currentFeedback === "LIKE" ? "default" : "outline"}
        size="sm"
        onClick={() => handleFeedback("LIKE")}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{formatNumber(likes)}</span>
      </Button>
      <Button
        variant={currentFeedback === "DISLIKE" ? "default" : "outline"}
        size="sm"
        onClick={() => handleFeedback("DISLIKE")}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{formatNumber(dislikes)}</span>
      </Button>
    </div>
  );
} 