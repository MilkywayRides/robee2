"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Save,
  ArrowLeft,
  Check,
  Calendar,
  Clock,
  Tags,
  Image as ImageIcon,
  AlertCircle,
  X,
  FileText,
  Settings,
  RefreshCw,
} from "lucide-react";

import { useCurrentUser } from "@/hooks/use-current-user";
// import { ImageUpload } from "@/components/ui/image-upload";
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
import { Switch } from "@/components/ui/switch";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CustomBlockEditor } from "@/components/editor/custom-block-editor";

interface EditPostFormProps {
  post: {
    id: string;
    title: string;
    excerpt: string | null;
    content: string;
    status: string;
    coverImage: string | null;
    tags: { id: string; name: string; }[];
    scheduledAt: string | null;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
    author: {
      id: string;
      name: string | null;
      image: string | null;
    };
  };
  currentUser: string;
  currentTime: string;
}

const allTags = [
  "Next.js", "React", "TypeScript", "JavaScript", "CSS", "Tailwind", 
  "Design", "Development", "Web Dev", "UI/UX", "Frontend", "Backend",
  "API", "Database", "Performance", "Accessibility", "SEO", "Testing"
];

export function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();
  const user = useCurrentUser();
  const titleInputRef = useRef<HTMLInputElement>(null);
  
  // Form and Editor State
  const [formData, setFormData] = useState({
    title: post.title,
    excerpt: post.excerpt || "",
    content: post.content || "",
    status: post.status,
    coverImage: post.coverImage || "",
    tags: post.tags.map(tag => tag.name),
    scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : undefined,
  });
  
  const [editorData, setEditorData] = useState(post.content);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [wordCount, setWordCount] = useState(0);
  const [activeTab, setActiveTab] = useState("editor");
  const [savingStatus, setSavingStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [previewMode, setPreviewMode] = useState(false);
  const [content, setContent] = useState<Block[]>(() => {
    try {
      if (post.content) {
        const parsed = JSON.parse(post.content);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      // If parsing fails, create a single paragraph block with the content
      return [{
        id: crypto.randomUUID(),
        type: 'paragraph',
        content: post.content || '',
        data: {}
      }];
    }
    // Default empty block if no content
    return [{
      id: crypto.randomUUID(),
      type: 'paragraph',
      content: '',
      data: {}
    }];
  });

  // Auto-focus title input on mount
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  // Calculate word count based on block content
  useEffect(() => {
    const words = content
      .map(block => block.content)
      .join(' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    setWordCount(words.length);
  }, [content]);

  // Update post handler
  const handleUpdatePost = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    try {
      setIsLoading(true);
      setSavingStatus("saving");

      if (!formData.title.trim()) {
        toast.error("Please provide a title for your post.");
        setSavingStatus("error");
        return;
      }

      if (formData.status === "SCHEDULED" && !formData.scheduledAt) {
        toast.error("Please select a schedule date for your post.");
        setSavingStatus("error");
        return;
      }

      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          content: JSON.stringify(content),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update post");
      }

      setUnsavedChanges(false);
      setLastSaved(new Date());
      setSavingStatus("success");
      toast.success("Post updated successfully");

      if (formData.status === "PUBLISHED") {
        router.push("/dashboard/posts");
        router.refresh();
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update post");
      setSavingStatus("error");
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setSavingStatus("idle");
      }, 2000);
    }
  }, [formData, content, post.id, router]);

  // Calculate reading time based on word count
  const readingTime = Math.ceil(wordCount / 200);

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
  const [customTag, setCustomTag] = useState("");
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

  const statusColor = {
    DRAFT: "bg-muted-foreground",
    PUBLISHED: "bg-green-500",
    SCHEDULED: "bg-blue-500"
  };

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm py-3 z-10 border-b px-4 md:px-6">
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  className="hover:bg-background hover:text-primary transition-colors md:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Back to posts</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 hover:bg-background hover:text-primary transition-colors hidden md:flex"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Edit Post
          </h2>
          
          {unsavedChanges && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800">
              Unsaved changes
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block text-xs text-muted-foreground min-w-24">
            {savingStatusIndicator()}
          </div>

          <div className="flex items-center gap-2">
            <Select 
              value={formData.status} 
              onValueChange={(value) => {
                setFormData(prev => ({ ...prev, status: value }));
                setUnsavedChanges(true);
              }}
            >
              <SelectTrigger className="w-36 border-primary/20 hover:border-primary/40 transition-colors">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${statusColor.DRAFT}`} />
                    Draft
                  </div>
                </SelectItem>
                <SelectItem value="PUBLISHED">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${statusColor.PUBLISHED}`} />
                    Publish Now
                  </div>
                </SelectItem>
                <SelectItem value="SCHEDULED">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${statusColor.SCHEDULED}`} />
                    Schedule
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleUpdatePost} 
                    className="gap-2 min-w-24"
                    disabled={isLoading || (!unsavedChanges && !autoSave)}
                  >
                    <Save className="h-4 w-4" />
                    <span className="hidden md:inline">Update</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save changes</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Mobile settings button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Settings className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader className="mb-4">
                  <SheetTitle>Post Settings</SheetTitle>
                  <SheetDescription>Configure your post settings</SheetDescription>
                </SheetHeader>
                <div className="space-y-6">
                  {/* Schedule Date */}
                  {formData.status === "SCHEDULED" && (
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
                    <Label htmlFor="mobile-auto-save" className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Auto-save
                    </Label>
                    <Switch
                      id="mobile-auto-save"
                      checked={autoSave}
                      onCheckedChange={setAutoSave}
                    />
                  </div>

                  {/* Word Count */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Statistics
                    </Label>
                    <div className="space-y-3 text-sm">
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Words</span>
                          <span>{wordCount}</span>
                        </div>
                        <Progress value={Math.min(wordCount / 10, 100)} className="h-1" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reading time</span>
                          <span>{readingTime} min</span>
                        </div>
                        <Progress value={Math.min(readingTime * 10, 100)} className="h-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      <div className="flex flex-1 gap-4 p-4 md:p-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
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
                    ref={titleInputRef}
                    value={formData.title}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, title: e.target.value }));
                      setUnsavedChanges(true);
                    }}
                    placeholder="Post title"
                    className="text-2xl h-12 font-medium border-none shadow-none focus-visible:ring-0 px-0"
                  />
                  <Separator />
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
                      <div className="space-y-2">
                        <Label>Content</Label>
                        <CustomBlockEditor
                          initialContent={content}
                          onChange={setContent}
                          readOnly={false}
                        />
                      </div>
                    ) : (
                      <div className="prose dark:prose-invert max-w-none p-4">
                        {content.map((block) => {
                          switch (block.type) {
                            case 'heading1':
                              return <h1 key={block.id}>{block.content}</h1>;
                            case 'heading2':
                              return <h2 key={block.id}>{block.content}</h2>;
                            case 'heading3':
                              return <h3 key={block.id}>{block.content}</h3>;
                            case 'list':
                              return <ul key={block.id}><li>{block.content}</li></ul>;
                            case 'orderedList':
                              return <ol key={block.id}><li>{block.content}</li></ol>;
                            case 'quote':
                              return <blockquote key={block.id}>{block.content}</blockquote>;
                            case 'code':
                              return <pre key={block.id}><code>{block.content}</code></pre>;
                            case 'image':
                              return block.data?.url ? (
                                <figure key={block.id}>
                                  <img src={block.data.url} alt={block.data.caption || ''} />
                                  {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
                                </figure>
                              ) : null;
                            case 'link':
                              return block.data?.url ? (
                                <a key={block.id} href={block.data.url}>{block.content}</a>
                              ) : null;
                            default:
                              return <p key={block.id}>{block.content}</p>;
                          }
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="justify-between py-2 px-4 text-xs text-muted-foreground border-t">
                  <div>{wordCount} words</div>
                  <div>{readingTime} min read</div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="media">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Cover Image
                  </CardTitle>
                  <CardDescription>
                    Upload an eye-catching cover image for your post
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* <ImageUpload
                    value={formData.coverImage}
                    onChange={(url) => {
                      setFormData(prev => ({ ...prev, coverImage: url }));
                      setUnsavedChanges(true);
                    }}
                    onRemove={() => {
                      setFormData(prev => ({ ...prev, coverImage: "" }));
                      setUnsavedChanges(true);
                    }}
                  /> */}
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  Recommended size: 1200 x 630 pixels
                </CardFooter>
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
                    <Alert className="bg-muted/50">
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
                  <div className={`h-3 w-3 rounded-full ${statusColor[formData.status as keyof typeof statusColor]}`} />
                  {formData.status === "DRAFT" && "Draft"}
                  {formData.status === "PUBLISHED" && "Published"}
                  {formData.status === "SCHEDULED" && "Scheduled"}
                </div>
              </div>
              
              {/* Schedule Date */}
              {formData.status === "SCHEDULED" && (
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
                <Label htmlFor="desktop-auto-save" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Auto-save
                </Label>
                <Switch
                  id="desktop-auto-save"
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
              </div>

              {/* Word Count */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Statistics
                </Label>
                <div className="space-y-3 text-sm">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Words</span>
                      <span className="font-medium">{wordCount}</span>
                    </div>
                    <Progress value={Math.min(wordCount / 10, 100)} className="h-1" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reading time</span>
                      <span className="font-medium">{readingTime} min</span>
                    </div>
                    <Progress value={Math.min(readingTime * 10, 100)} className="h-1" />
                  </div>
                </div>
              </div>
              
              {/* Creation info */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Created
                </Label>
                <div className="text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
                </div>
              </div>
              
              {/* Last updated */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Last Updated
                </Label>
                <div className="text-sm text-muted-foreground">
                  {new Date(post.updatedAt).toLocaleDateString()} at {new Date(post.updatedAt).toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}