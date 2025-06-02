"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import PostList from "@/components/posts/post-list";
import PostListSkeleton from "@/components/posts/post-list-skeleton";
import { Post } from "@/types/post";

// Constants
const CURRENT_USER = "MilkywayRides";
const CURRENT_TIME = "2025-04-08 06:02:34";

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/posts?status=${activeTab}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error || data.details || response.statusText;
          throw new Error(`Failed to fetch posts: ${errorMessage}`);
        }

        if (!data.posts || !Array.isArray(data.posts)) {
          throw new Error("Invalid response format from server");
        }

        setPosts(data.posts);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load posts. Please try again later.");
        setPosts([]); // Reset posts on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [activeTab]);

  const handleCreatePost = () => {
    router.push("/dashboard/posts/create");
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-6 flex flex-col">
          {isLoading ? (
            <PostListSkeleton />
          ) : (
            <PostList
              posts={posts.map(post => ({
                ...post,
                likes: post.feedback?.filter(f => f.type === "LIKE").length || 0,
                dislikes: post.feedback?.filter(f => f.type === "DISLIKE").length || 0,
              }))}
              activeTab={activeTab}
              searchQuery={searchQuery}
              onSearch={setSearchQuery}
              onCreatePost={handleCreatePost}
              onTabChange={setActiveTab}
              currentUser={CURRENT_USER}
              currentTime={CURRENT_TIME}
            />
          )}
        </main>
        <Footer/>
      </SidebarInset>
    </SidebarProvider>
  );
}