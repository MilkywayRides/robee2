"use client";

import { FileText, Search, Settings, Clock, Image } from "lucide-react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/image-upload";
import EditorToolbar from "./editor-toolbar";
import PostSettings from "./post-settings";
import SeoSettings from "./seo-settings";
import { cn } from "@/lib/utils";

// Dynamic import of the editor to avoid SSR issues
const EditorWrapper = dynamic(() => import("@/components/editor/editor-wrapper"), {
  ssr: false,
});

// Constants
const CURRENT_USER = "MilkywayRides";
const CURRENT_TIME = "2025-04-07 09:15:44";

interface CreatePostEditorProps {
  postTitle: string;
  postExcerpt: string;
  coverImageUrl: string;
  editorData: any;
  previewMode: boolean;
  editorSection: string;
  selectedTags: string[];
  scheduledDate: string;
  wordCount: number;
  seoScore: number;
  readabilityScore: number;
  autoSave: boolean;
  onPostTitleChange: (value: string) => void;
  onPostExcerptChange: (value: string) => void;
  onEditorChange: (data: any) => void;
  onImageUpload: (file: File) => void;
  onRemoveImage: () => void;
  onTagsChange: (tags: string[]) => void;
  onScheduledDateChange: (date: string) => void;
  onEditorSectionChange: (section: string) => void;
  onAutoSaveChange: (enabled: boolean) => void;
}

export default function CreatePostEditor({
  postTitle,
  postExcerpt,
  coverImageUrl,
  editorData,
  previewMode,
  editorSection,
  selectedTags,
  scheduledDate,
  wordCount,
  seoScore,
  readabilityScore,
  autoSave,
  onPostTitleChange,
  onPostExcerptChange,
  onEditorChange,
  onImageUpload,
  onRemoveImage,
  onTagsChange,
  onScheduledDateChange,
  onEditorSectionChange,
  onAutoSaveChange,
}: CreatePostEditorProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Post Title and Excerpt */}
      <div className="mb-6">
        <Input
          value={postTitle}
          onChange={(e) => onPostTitleChange(e.target.value)}
          placeholder="Post title"
          className="text-2xl h-12 font-medium border-none shadow-none focus-visible:ring-0 px-0 mb-3"
        />

        <Textarea
          value={postExcerpt}
          onChange={(e) => onPostExcerptChange(e.target.value)}
          placeholder="Write a brief excerpt or summary of your post (optional)"
          className="resize-none text-sm border-none shadow-none focus-visible:ring-0 px-0"
          rows={2}
        />
      </div>

      {/* Cover Image Upload */}
      <div className="mb-6">
        <ImageUpload
          value={coverImageUrl}
          onChange={(url) => {
            onImageUpload(new File([], url)); // This is just for type compatibility
          }}
          onRemove={onRemoveImage}
        />
      </div>

      {/* Editor Tabs */}
      <Tabs
        defaultValue="content"
        value={editorSection}
        onValueChange={onEditorSectionChange}
        className="flex-1 flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="content" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-1">
            <Search className="h-4 w-4" />
            SEO
          </TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="flex-1 flex flex-col">
          <EditorToolbar />
          
          <div className="flex-1 border rounded-md p-4 min-h-[400px]">
            {!previewMode ? (
              <EditorWrapper
                onChange={onEditorChange}
                data={editorData}
                placeholder="Start writing your post here..."
                holder="editor"
                className="prose dark:prose-invert max-w-none"
              />
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                <h1>{postTitle || "Post Title"}</h1>
                {postExcerpt && (
                  <p className="text-muted-foreground">{postExcerpt}</p>
                )}
                {coverImageUrl && (
                  <img
                    src={coverImageUrl}
                    alt="Cover"
                    className="w-full h-64 object-cover mb-6 rounded-md"
                  />
                )}
                <div dangerouslySetInnerHTML={{ 
                  __html: editorData?.blocks?.map((block: any) => {
                    switch (block.type) {
                      case 'paragraph':
                        return `<p>${block.data.text}</p>`;
                      case 'header':
                        return `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
                      default:
                        return '';
                    }
                  }).join('') || ''
                }} />
              </div>
            )}
          </div>

          {/* Word Count and Auto-save */}
          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{wordCount} words</span>
              </div>
              <div>~{Math.ceil(wordCount / 200)} min read</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Switch
                  id="auto-save"
                  checked={autoSave}
                  onCheckedChange={onAutoSaveChange}
                />
                <Label htmlFor="auto-save" className="cursor-pointer">
                  Auto-save
                </Label>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-0">
          <PostSettings
            selectedTags={selectedTags}
            scheduledDate={scheduledDate}
            onTagsChange={onTagsChange}
            onScheduledDateChange={onScheduledDateChange}
            currentUser={CURRENT_USER}
            currentTime={CURRENT_TIME}
          />
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo" className="mt-0">
          <SeoSettings
            title={postTitle}
            excerpt={postExcerpt}
            seoScore={seoScore}
            readabilityScore={readabilityScore}
            lastUpdated={CURRENT_TIME}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Add prop types for the editor data
interface EditorBlock {
  type: string;
  data: {
    text: string;
    level?: number;
  };
}

interface EditorData {
  blocks?: EditorBlock[];
  time?: number;
  version?: string;
}