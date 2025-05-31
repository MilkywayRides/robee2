"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import { toast } from "sonner";

interface PostFeedbackProps {
  postId: string;
  initialLikes: number;
  initialDislikes: number;
  userFeedback: "LIKE" | "DISLIKE" | null;
  isAuthenticated: boolean;
}

export function PostFeedback({
  postId,
  initialLikes,
  initialDislikes,
  userFeedback: initialUserFeedback,
  isAuthenticated,
}: PostFeedbackProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [currentFeedback, setCurrentFeedback] = useState<"LIKE" | "DISLIKE" | null>(initialUserFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Show/hide button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 100; // Show after scrolling 100px
      
      setIsVisible(scrollY > threshold);
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Check initial scroll position
    handleScroll();

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFeedback = async (type: "LIKE" | "DISLIKE") => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like or dislike posts");
      return;
    }

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
      toast.error("Failed to update feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
      <div className={cn(
        // Glassmorphism base styles
        "inline-flex items-center rounded-2xl p-1 shadow-2xl",
        "backdrop-blur-xl backdrop-saturate-150",
        // Light mode glassmorphism
        "bg-white/80 border border-white/20",
        "shadow-black/10",
        // Dark mode glassmorphism
        "dark:bg-black/40 dark:border-white/10",
        "dark:shadow-black/50",
        // Subtle animation
        "transition-all duration-300 ease-out",
        "hover:scale-105 hover:shadow-3xl",
        "hover:bg-white/90 dark:hover:bg-black/60"
      )}>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-10 gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300",
            "hover:bg-white/60 hover:backdrop-blur-sm",
            "dark:hover:bg-white/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
            "dark:focus-visible:ring-white/30",
            currentFeedback === "LIKE" && [
              "bg-green-500/20 text-green-700 hover:bg-green-500/30",
              "dark:bg-green-400/20 dark:text-green-300 dark:hover:bg-green-400/30",
              "ring-2 ring-green-500/30 dark:ring-green-400/30"
            ],
            isSubmitting && "pointer-events-none opacity-60"
          )}
          onClick={() => handleFeedback("LIKE")}
          disabled={isSubmitting}
        >
          {isSubmitting && currentFeedback === "LIKE" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThumbsUp 
              className={cn(
                "h-4 w-4 transition-all duration-300",
                currentFeedback === "LIKE" && "scale-110 text-green-600 dark:text-green-400"
              )} 
            />
          )}
          <span className={cn(
            "tabular-nums font-semibold",
            currentFeedback === "LIKE" && "text-green-700 dark:text-green-300"
          )}>
            {formatNumber(likes)}
          </span>
        </Button>

        <div className="mx-2 h-6 w-px bg-white/30 dark:bg-white/20" />

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-10 gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300",
            "hover:bg-white/60 hover:backdrop-blur-sm",
            "dark:hover:bg-white/10",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
            "dark:focus-visible:ring-white/30",
            currentFeedback === "DISLIKE" && [
              "bg-red-500/20 text-red-700 hover:bg-red-500/30",
              "dark:bg-red-400/20 dark:text-red-300 dark:hover:bg-red-400/30",
              "ring-2 ring-red-500/30 dark:ring-red-400/30"
            ],
            isSubmitting && "pointer-events-none opacity-60"
          )}
          onClick={() => handleFeedback("DISLIKE")}
          disabled={isSubmitting}
        >
          {isSubmitting && currentFeedback === "DISLIKE" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ThumbsDown 
              className={cn(
                "h-4 w-4 transition-all duration-300",
                currentFeedback === "DISLIKE" && "scale-110 text-red-600 dark:text-red-400"
              )} 
            />
          )}
          <span className={cn(
            "tabular-nums font-semibold",
            currentFeedback === "DISLIKE" && "text-red-700 dark:text-red-300"
          )}>
            {formatNumber(dislikes)}
          </span>
        </Button>
      </div>
    </div>
  );
}