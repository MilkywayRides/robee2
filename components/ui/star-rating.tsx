import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  className?: string;
}

export function StarRating({ rating, maxRating = 5, className }: StarRatingProps) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 1; i <= maxRating; i++) {
    if (i <= fullStars) {
      // Full star
      stars.push(
        <Star
          key={i}
          className={cn("h-4 w-4 fill-yellow-400 text-yellow-400", className)}
        />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      // Half star
      stars.push(
        <div key={i} className="relative">
          <Star className={cn("h-4 w-4 text-yellow-400", className)} />
          <div className="absolute inset-0 overflow-hidden">
            <Star className={cn("h-4 w-4 fill-yellow-400 text-yellow-400", className)} />
          </div>
        </div>
      );
    } else {
      // Empty star
      stars.push(
        <Star
          key={i}
          className={cn("h-4 w-4 text-yellow-400/30", className)}
        />
      );
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
} 