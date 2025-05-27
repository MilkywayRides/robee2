"use client";

import { Post } from "@/types/post";
import { PostCard } from "@/components/posts/post-card";

interface HomeClientProps {
  posts: Post[];
}

export function HomeClient({ posts }: HomeClientProps) {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {posts.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No posts found</h2>
          <p className="text-muted-foreground">
            {posts.length === 0
              ? "Follow some authors to see their posts here!"
              : "No posts available at the moment."}
          </p>
        </div>
      )}
    </main>
  );
} 