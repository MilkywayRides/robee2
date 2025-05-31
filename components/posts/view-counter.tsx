"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";

interface ViewCounterProps {
  postId: string;
  initialViews: number;
}

export function ViewCounter({ postId, initialViews }: ViewCounterProps) {
  const [views, setViews] = useState(initialViews);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const incrementView = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/views`, {
          method: "POST",
        });

        if (response.ok) {
          setViews(prev => prev + 1);
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 1000);
        }
      } catch (error) {
        console.error("Error incrementing view:", error);
      }
    };

    incrementView();
  }, [postId]);

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Eye className={cn(
        "h-4 w-4 transition-transform duration-300",
        isAnimating && "scale-110 text-primary"
      )} />
      <span className={cn(
        "tabular-nums transition-colors duration-300",
        isAnimating && "text-primary"
      )}>
        {formatNumber(views)}
      </span>
    </div>
  );
} 