// components/PostEditor.tsx
"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ContentTab } from "@/components/ContentTab";
import { Save, ArrowLeft, Eye, Bot, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostEditorProps {
  onSave: (postData: any) => void;
  onCancel: () => void;
  userId: string;
}

export default function PostEditor({ onSave, onCancel, userId }: PostEditorProps) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState({});
  const [status, setStatus] = useState("draft");
  const [tags, setTags] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [autoSave, setAutoSave] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [editorSection, setEditorSection] = useState("content");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;
    if (status === "scheduled" && !scheduledDate) return;

    const postData = {
      title,
      excerpt,
      content,
      status,
      tags,
      featuredImage,
      scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
      authorId: userId,
      // Removed slug
    };

    setIsSaving(true);
    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });
      if (!response.ok) throw new Error("Failed to save post");
      const savedPost = await response.json();
      setUnsavedChanges(false);
      onSave(savedPost);
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [title, excerpt, content, status, tags, featuredImage, scheduledDate, userId, onSave]);

  return (
    <div className={cn("flex flex-col h-full", isFullscreen && "fixed inset-0 z-50 bg-background")}>
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-background/95 backdrop-blur-sm py-3 z-10 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h2 className="text-xl font-semibold">{title || "Create New Post"}</h2>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Toggle fullscreen</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Publish Now</SelectItem>
              <SelectItem value="scheduled">Schedule</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} className="gap-2" disabled={isSaving || (!unsavedChanges && !autoSave)}>
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : status === "published" ? "Publish" : status === "scheduled" ? "Schedule" : "Save"}
          </Button>
        </div>
      </div>
      <Tabs value={editorSection} onValueChange={setEditorSection}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>
        <TabsContent value="content">
          <ContentTab
            title={title}
            setTitle={setTitle}
            excerpt={excerpt}
            setExcerpt={setExcerpt}
            content={content}
            setContent={setContent}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
            wordCount={wordCount}
            setWordCount={setWordCount}
            autoSave={autoSave}
            setAutoSave={setAutoSave}
            setUnsavedChanges={setUnsavedChanges}
          />
        </TabsContent>
        <TabsContent value="settings">{/* SettingsTab component would go here */}</TabsContent>
        <TabsContent value="seo">{/* SeoTab component would go here */}</TabsContent>
      </Tabs>
    </div>
  );
}