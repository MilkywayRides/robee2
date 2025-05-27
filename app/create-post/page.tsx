"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Clock, Eye, EyeOff, Bold, Italic, List, ListOrdered, Code, Link, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function CreatePostEditor() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [wordCount, setWordCount] = useState(0);

  const calculateWordCount = useCallback((text: string) => {
    return text.split(/\s+/).filter(Boolean).length;
  }, []);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setWordCount(calculateWordCount(newContent));
  }, [calculateWordCount]);

  const insertMarkdown = (type: string) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = "";

    switch (type) {
      case "bold":
        newText = `**${selectedText || "bold text"}**`;
        break;
      case "italic":
        newText = `*${selectedText || "italic text"}*`;
        break;
      case "code":
        newText = `\`${selectedText || "code"}\``;
        break;
      case "link":
        newText = `[${selectedText || "link text"}](url)`;
        break;
      case "image":
        newText = `![${selectedText || "alt text"}](image-url)`;
        break;
      case "bullet-list":
        newText = selectedText
          ? selectedText.split("\n").map(line => `- ${line}`).join("\n")
          : "- List item";
        break;
      case "numbered-list":
        newText = selectedText
          ? selectedText.split("\n").map((line, i) => `${i + 1}. ${line}`).join("\n")
          : "1. List item";
        break;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    setWordCount(calculateWordCount(newContent));
  };

  const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute reading speed

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <Input
          placeholder="Post title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-2xl font-bold"
        />
        <Textarea
          placeholder="Write a brief excerpt..."
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="resize-none"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="gap-2"
            >
              {previewMode ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Preview
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{wordCount} words</span>
              <span>•</span>
              <span>~{readingTime} min read</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
                size="sm"
              />
              <Label htmlFor="auto-save" className="text-sm cursor-pointer">
                Auto-save
              </Label>
            </div>
          </div>
        </div>

        {!previewMode && (
          <div className="p-2 border-b bg-muted/20 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown("bold")}
              className="h-8 w-8 p-0"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown("italic")}
              className="h-8 w-8 p-0"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown("code")}
              className="h-8 w-8 p-0"
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown("link")}
              className="h-8 w-8 p-0"
            >
              <Link className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown("image")}
              className="h-8 w-8 p-0"
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown("bullet-list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMarkdown("numbered-list")}
              className="h-8 w-8 p-0"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className={cn(
          "min-h-[400px] p-4",
          previewMode ? "prose dark:prose-invert max-w-none" : ""
        )}>
          {!previewMode ? (
            <Textarea
              value={content}
              onChange={handleContentChange}
              placeholder="Start writing your post in markdown..."
              className="min-h-[400px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          ) : (
            <div>
              <h1>{title || "Post Title"}</h1>
              {excerpt && (
                <p className="text-muted-foreground">{excerpt}</p>
              )}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="lg">Create Post</Button>
      </div>
    </div>
  );
} 