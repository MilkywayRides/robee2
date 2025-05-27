"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PostStatus } from "@prisma/client";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Plus,
  Save,
} from "lucide-react";

import { ImageUpload } from "@/components/ui/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const allTags = [
  "Next.js", "React", "TypeScript", "JavaScript", "CSS", "Tailwind", 
  "Design", "Development", "Web Dev", "UI/UX", "Frontend", "Backend",
  "API", "Database", "Performance", "Accessibility", "SEO", "Testing"
];

interface FormData {
  title: string;
  excerpt: string;
  content: any;
  status: PostStatus;
  coverImage: string;
  tags: string[];
  scheduledAt?: string;
}

const DEFAULT_FORM_DATA: FormData = {
  title: "",
  excerpt: "",
  content: {},
  status: PostStatus.DRAFT,
  coverImage: "",
  tags: [],
};

export function CreatePostForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const handleSave = async () => {
    try {
      setIsLoading(true);

      if (!formData.title.trim()) {
        toast.error("Please provide a title for your post");
        return;
      }

      // Map scheduledAt to scheduledDate for backend compatibility
      const postData = {
        ...formData,
        scheduledDate: formData.scheduledAt,
      };
      delete postData.scheduledAt;

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        let errorMsg = "Failed to save post";
        try {
          const errText = await response.text();
          if (errText) errorMsg = errText;
        } catch {}
        throw new Error(errorMsg);
      }

      const post = await response.json();
      setUnsavedChanges(false);
      setLastSaved(new Date());
      toast.success(
        formData.status === PostStatus.PUBLISHED 
          ? "Post published successfully!"
          : formData.status === PostStatus.SCHEDULED
            ? "Post scheduled successfully!"
            : "Draft saved successfully!"
      );
      if (formData.status === PostStatus.PUBLISHED) {
        router.push("/dashboard/posts");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Save error:", error);
      toast.error(error?.message || "Failed to save post");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: newTags };
    });
    setUnsavedChanges(true);
  };

  return (
    <div className="flex flex-col space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sticky top-0 bg-background/95 backdrop-blur-sm py-3 z-10 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 hover:bg-background hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h2 className="text-xl font-semibold">
            {formData.title || "Create New Post"}
          </h2>
          {unsavedChanges && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700">
              Unsaved changes
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <div className="hidden md:flex items-center text-xs text-muted-foreground gap-1 mr-3">
              <Check className="h-3 w-3 text-green-500" />
              <span>
                Saved at {lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}

          <Select 
            value={formData.status} 
            onValueChange={(value: PostStatus) => 
              setFormData(prev => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PostStatus.DRAFT}>Draft</SelectItem>
              <SelectItem value={PostStatus.PUBLISHED}>Publish</SelectItem>
              <SelectItem value={PostStatus.SCHEDULED}>Schedule</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={handleSave} 
            className="gap-2 min-w-24"
            disabled={isLoading}
          >
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Title and Excerpt */}
        <div>
          <Input
            value={formData.title}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, title: e.target.value }));
              setUnsavedChanges(true);
            }}
            placeholder="Post title"
            className="text-2xl h-12 font-medium border-none shadow-none focus-visible:ring-0 px-0 mb-3"
          />
          <Textarea
            value={formData.excerpt}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, excerpt: e.target.value }));
              setUnsavedChanges(true);
            }}
            placeholder="Write a brief excerpt..."
            className="resize-none text-sm border-none shadow-none focus-visible:ring-0 px-0"
            rows={2}
          />
        </div>

        {/* Cover Image */}
        <Card>
          <CardHeader>
            <CardTitle>Cover Image</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={formData.coverImage}
              onChange={(url) => {
                setFormData(prev => ({ ...prev, coverImage: url }));
                setUnsavedChanges(true);
              }}
              onRemove={() => {
                setFormData(prev => ({ ...prev, coverImage: "" }));
                setUnsavedChanges(true);
              }}
            />
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[500px] border rounded-lg p-4">
              {/* Your rich text editor component will go here */}
              <Textarea
                value={formData.content}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, content: e.target.value }));
                  setUnsavedChanges(true);
                }}
                placeholder="Write your post content..."
                className="min-h-[400px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <button
                    onClick={() => handleTagToggle(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Tag
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <div className="grid grid-cols-2 gap-2">
                    {allTags.map((tag) => (
                      <div
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={cn(
                          "px-2 py-1 rounded-md cursor-pointer text-sm",
                          formData.tags.includes(tag)
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted"
                        )}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Date */}
        {formData.status === PostStatus.SCHEDULED && (
          <Card>
            <CardHeader>
              <CardTitle>Schedule Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label>Publication Date</Label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      scheduledAt: e.target.value
                    }));
                    setUnsavedChanges(true);
                  }}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}