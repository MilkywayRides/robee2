"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "./PostCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid, Layout } from "lucide-react";

interface PostListProps {
  posts: any[];
}

export function PostList({ posts }: PostListProps) {
  const [activeTab, setActiveTab] = useState("all");

  const renderPostGrid = (filteredPosts: any[]) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <TabsList>
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Select defaultValue="newest">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="popular">Most viewed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Layout className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <TabsContent value="all">{renderPostGrid(posts)}</TabsContent>
      <TabsContent value="published">{renderPostGrid(posts.filter((post) => post.status === "published"))}</TabsContent>
      <TabsContent value="drafts">{renderPostGrid(posts.filter((post) => post.status === "draft"))}</TabsContent>
      <TabsContent value="scheduled">{renderPostGrid(posts.filter((post) => post.status === "scheduled"))}</TabsContent>
    </Tabs>
  );
}