"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostCard } from "./post-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Grid, Layout, Eye, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface PostListProps {
  posts: any[];
}

export function PostList({ posts }: PostListProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [followedAuthors, setFollowedAuthors] = useState<Set<string>>(new Set());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Draft
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Scheduled
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleFollow = async (authorId: string) => {
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          followingId: authorId,
        }),
      });

      if (!response.ok) throw new Error('Failed to follow');

      const data = await response.json();
      if (data.followed) {
        setFollowedAuthors(prev => new Set([...prev, authorId]));
        toast.success('Successfully followed author');
      } else {
        setFollowedAuthors(prev => {
          const newSet = new Set(prev);
          newSet.delete(authorId);
          return newSet;
        });
        toast.success('Successfully unfollowed author');
      }
    } catch (error) {
      toast.error('Failed to follow/unfollow author');
    }
  };

  const renderPostGrid = (filteredPosts: any[]) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredPosts.map((post) => (
        <PostCard 
          key={post.id} 
          post={post} 
          getStatusBadge={getStatusBadge}
          isFollowing={followedAuthors.has(post.author.id)}
          onFollow={() => handleFollow(post.author.id)}
        />
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