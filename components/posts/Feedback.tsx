"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface FeedbackProps {
  postId: string;
  initialFeedback: {
    likes: number;
    dislikes: number;
    comments: Array<{
      id: string;
      content: string;
      author: {
        name: string;
        image: string | null;
      };
      createdAt: Date;
    }>;
  };
}

export default function Feedback({ postId, initialFeedback }: FeedbackProps) {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "like" }),
      });

      if (response.ok) {
        setFeedback((prev) => ({
          ...prev,
          likes: prev.likes + 1,
        }));
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const handleDislike = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "dislike" }),
      });

      if (response.ok) {
        setFeedback((prev) => ({
          ...prev,
          dislikes: prev.dislikes + 1,
        }));
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: comment }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setFeedback((prev) => ({
          ...prev,
          comments: [newComment, ...prev.comments],
        }));
        setComment("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleLike}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>{feedback.likes}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={handleDislike}
        >
          <ThumbsDown className="h-4 w-4" />
          <span>{feedback.dislikes}</span>
        </Button>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments
        </h3>

        <form onSubmit={handleComment} className="space-y-4">
          <Textarea
            placeholder="Share your thoughts..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>

        <div className="space-y-4">
          {feedback.comments.map((comment) => (
            <Card key={comment.id} className="p-4">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={comment.author.image || undefined} />
                  <AvatarFallback>
                    {comment.author.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{comment.author.name}</span>
                    <time className="text-sm text-muted-foreground">
                      {format(new Date(comment.createdAt), "MMM d, yyyy")}
                    </time>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 