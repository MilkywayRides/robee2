import { PostStatus } from "@prisma/client";

export interface Tag {
  id: string;
  name: string;
}

export interface PostFeedback {
  id: string;
  type: "LIKE" | "DISLIKE";
  userId: string;
  postId: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  title: string;
  excerpt?: string | null;
  content: any;
  status: PostStatus;
  coverImage?: string | null;
  tags: Tag[];
  views: number;
  slug?: string | null;
  scheduledAt?: Date | null;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
  feedback?: PostFeedback[];
  likes?: number;
  dislikes?: number;
}