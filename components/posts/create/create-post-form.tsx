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
  Settings,
  Calendar,
  FileText,
  ImageIcon,
  Tags,
  RefreshCw,
  AlertCircle,
  X,
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
  CardFooter,
  CardDescription,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { EditorWrapper } from "@/components/editor/editor-wrapper";

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

const statusColor = {
  DRAFT: "bg-muted-foreground",
  PUBLISHED: "bg-green-500",
  SCHEDULED: "bg-blue-500",
};

export function CreatePostForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [wordCount, setWordCount] = useState(0);
  const [activeTab, setActiveTab] = useState("editor");
  const [previewMode, setPreviewMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [customTag, setCustomTag] = useState("");
  const [postId, setPostId] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setSavingStatus("saving");

      if (!formData.title.trim()) {
        toast.error("Please provide a title for your post");
        setSavingStatus("error");
        return;
      }

      if (formData.status === PostStatus.SCHEDULED && !formData.scheduledAt) {
        toast.error("Please select a schedule date for your post");
        setSavingStatus("error");
        return;
      }

      const url = postId ? `/api/posts/${postId}` : "/api/posts";
      const method = postId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save post");
      }

      const post = await response.json();
      if (!postId) {
        setPostId(post.id);
      }
      
      setUnsavedChanges(false);
      setLastSaved(new Date());
      setSavingStatus("success");
      toast.success(
        formData.status === PostStatus.PUBLISHED 
          ? "Post published successfully!"
          : formData.status === PostStatus.SCHEDULED
            ? "Post scheduled successfully!"
            : "Draft saved successfully!"
      );

      if (formData.status === PostStatus.PUBLISHED && !autoSave) {
        router.push("/dashboard/posts");
        router.refresh();
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save post");
      setSavingStatus("error");
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setSavingStatus("idle");
      }, 2000);
    }
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setFormData(prev => ({ ...prev, content: newContent }));
    setUnsavedChanges(true);
    
    const words = newContent.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
    
    if (autoSave) {
      setSavingStatus("idle");
      const saveTimer = setTimeout(() => {
        setSavingStatus("saving");
        handleSave();
      }, 5000);
      
      return () => clearTimeout(saveTimer);
    }
  };

  const savingStatusIndicator = () => {
    switch (savingStatus) {
      case "saving":
        return (
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Saving...</span>
          </div>
        );
      case "success":
        return (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Check className="h-3 w-3" />
            <span>Saved at {lastSaved?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <AlertCircle className="h-3 w-3" />
            <span>Save failed</span>
          </div>
        );
      default:
        return autoSave && !unsavedChanges ? (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Check className="h-3 w-3" />
            <span>Saved at {lastSaved?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ) : null;
    }
  };

  // Handle tags
  const handleTagToggle = (tag: string) => {
    setFormData(prev => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: newTags };
    });
    setUnsavedChanges(true);
  };

  // Custom tag input
  const handleAddCustomTag = () => {
    if (customTag && !formData.tags.includes(customTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag]
      }));
      setCustomTag("");
      setUnsavedChanges(true);
    }
  };

  return (
    <div className="flex flex-1 gap-4 p-4 md:p-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {savingStatusIndicator()}
          </div>
          <div className="flex items-center gap-2">
            <Select 
              value={formData.status} 
              onValueChange={(value: PostStatus) => {
                setFormData(prev => ({ ...prev, status: value }));
                setUnsavedChanges(true);
              }}
            >
              <SelectTrigger className="w-36 border-primary/20 hover:border-primary/40 transition-colors">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PostStatus.DRAFT}>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${statusColor.DRAFT}`} />
                    Draft
                  </div>
                </SelectItem>
                <SelectItem value={PostStatus.PUBLISHED}>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${statusColor.PUBLISHED}`} />
                    Publish Now
                  </div>
                </SelectItem>
                <SelectItem value={PostStatus.SCHEDULED}>
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${statusColor.SCHEDULED}`} />
                    Schedule
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={handleSave} 
              className="gap-2 min-w-24"
              disabled={isLoading}
            >
              <Save className="h-4 w-4" />
              {isLoading ? "Saving..." : 
                formData.status === PostStatus.PUBLISHED ? "Publish" :
                formData.status === PostStatus.SCHEDULED ? "Schedule" :
                "Save"
              }
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="editor" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Media</span>
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-1">
              <Tags className="h-4 w-4" />
              <span className="hidden sm:inline">Tags</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="space-y-6">
            {/* Title and Excerpt */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <Input
                  value={formData.title}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, title: e.target.value }));
                    setUnsavedChanges(true);
                  }}
                  placeholder="Post title"
                  className="text-2xl h-12 font-medium border-none shadow-none focus-visible:ring-0 px-0"
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
              </CardContent>
            </Card>

            {/* Editor */}
            <Card className="overflow-hidden">
              <CardHeader className="py-3 px-4 bg-muted/30 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">Content Editor</CardTitle>
                <Button
                  variant={previewMode ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode((prev) => !prev)}
                >
                  {previewMode ? "Edit" : "Preview"}
                </Button>
              </CardHeader>
              <CardContent className="p-0 border-t">
                <div className="min-h-96">
                  {!previewMode ? (
                    <Textarea
                      value={formData.content}
                      onChange={handleEditorChange}
                      placeholder="Start writing your post in markdown..."
                      className="min-h-[400px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  ) : (
                    <div className="prose dark:prose-invert max-w-none p-4">
                      {formData.content}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-between py-2 px-4 text-xs text-muted-foreground border-t">
                <div>{wordCount} words</div>
                <div>{Math.ceil(wordCount / 200)} min read</div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="media">
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
          </TabsContent>

          <TabsContent value="tags">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tags className="h-4 w-4" />
                  Post Tags
                </CardTitle>
                <CardDescription>
                  Add relevant tags to help readers find your content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="pl-3 pr-2 py-1.5">
                        {tag}
                        <button
                          onClick={() => handleTagToggle(tag)}
                          className="ml-1 hover:text-destructive"
                          aria-label={`Remove ${tag} tag`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Alert variant="outline" className="bg-muted/50">
                    <AlertDescription>
                      No tags added yet. Add some tags to categorize your post.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex gap-2">
                  <Input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Add custom tag..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomTag();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleAddCustomTag}
                    disabled={!customTag}
                    type="button"
                  >
                    Add
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Popular Tags</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {allTags.map((tag) => (
                      <div
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={cn(
                          "px-3 py-2 rounded-md cursor-pointer text-sm transition-colors",
                          formData.tags.includes(tag)
                            ? "bg-primary/10 text-primary border border-primary/30"
                            : "hover:bg-muted border border-transparent"
                        )}
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block w-80">
        <Card className="sticky top-24">
          <CardHeader className="py-4">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Post Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-4 pb-4">
            {/* Status indicator */}
            <div className="space-y-2">
              <Label>Post Status</Label>
              <div className="flex items-center gap-2 text-sm">
                <div className={`h-3 w-3 rounded-full ${statusColor[formData.status]}`} />
                {formData.status === PostStatus.DRAFT && "Draft"}
                {formData.status === PostStatus.PUBLISHED && "Published"}
                {formData.status === PostStatus.SCHEDULED && "Scheduled"}
              </div>
            </div>
            
            {/* Schedule Date */}
            {formData.status === PostStatus.SCHEDULED && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Date
                </Label>
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
            )}

            {/* Auto-save */}
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Auto-save
              </Label>
              <Switch
                id="auto-save"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>

            {/* Word Count */}
            <div className="space-y-2">
              <Label>Word Count</Label>
              <div className="text-sm text-muted-foreground">
                {wordCount} words
                <span className="mx-2">•</span>
                ~{Math.ceil(wordCount / 200)} min read
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}