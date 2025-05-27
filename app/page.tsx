"use client"

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Github, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Zap, 
  Lock, 
  Globe,
  Clock 
} from 'lucide-react';

import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { SignInButton } from '@/components/auth/sign-in-button';
import { Card, CardContent } from '@/components/ui/card';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { SiteHeader } from '@/components/site-header-index';
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { PostStatus } from "@prisma/client";
import { PostList } from "@/components/PostList";

const features = [
  {
    title: "Next.js 14",
    description: "Built with the latest version of Next.js and React Server Components",
    icon: Zap,
  },
  {
    title: "Authentication",
    description: "Secure authentication using Auth.js with multiple providers",
    icon: Lock,
  },
  {
    title: "TypeScript",
    description: "Written in TypeScript for better development experience",
    icon: Globe,
  },
  {
    title: "Shadcn UI",
    description: "Beautiful and accessible components using Shadcn UI",
    icon: Star,
  }
];

async function getPosts() {
  try {
    const session = await auth();
    let posts;

    if (session?.user?.id) {
      // Get posts from followed authors
      const followedAuthors = await db.follow.findMany({
        where: {
          followerId: session.user.id,
        },
        select: {
          followingId: true,
        },
      });

      const followedAuthorIds = followedAuthors.map(f => f.followingId);

      posts = await db.post.findMany({
        where: {
          status: PostStatus.PUBLISHED,
          authorId: {
            in: followedAuthorIds,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          tags: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    } else {
      // Get all published posts for non-authenticated users
      posts = await db.post.findMany({
        where: {
          status: PostStatus.PUBLISHED,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          tags: true,
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });
    }

    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <main className="container mx-auto px-4 py-8">
      <PostList posts={posts} />
    </main>
  );
}