import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Image } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PostEditorProps {
  postTitle: string;
  postExcerpt: string;
  coverImageUrl: string;
  editorData: string;
  previewMode: boolean;
  wordCount: number;
  autoSave: boolean;
  onPostTitleChange: (value: string) => void;
  onPostExcerptChange: (value: string) => void;
  onEditorChange: (data: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onAutoSaveChange: (checked: boolean) => void;
}

export function PostEditor({
  postTitle,
  postExcerpt,
  coverImageUrl,
  editorData,
  previewMode,
  wordCount,
  autoSave,
  onPostTitleChange,
  onPostExcerptChange,
  onEditorChange,
  onImageUpload,
  onRemoveImage,
  onAutoSaveChange
}: PostEditorProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Title and Excerpt */}
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

      {/* Cover Image */}
      {!coverImageUrl ? (
        <label className="w-full h-48 mb-6 rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onImageUpload}
          />
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Image className="h-8 w-8" />
            <p>Click to upload a cover image</p>
          </div>
        </label>
      ) : (
        <div className="w-full mb-6 rounded-lg overflow-hidden relative group">
          <img
            src={coverImageUrl}
            alt={`Cover image for ${postTitle}`}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <label className="cursor-pointer">
              <Button variant="secondary" size="sm">
                <Image className="h-4 w-4 mr-1" />
                Change
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onImageUpload}
              />
            </label>
            <Button variant="destructive" size="sm" onClick={onRemoveImage}>
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="border rounded-md p-4 min-h-[400px]">
        {!previewMode ? (
          <Textarea
            value={editorData}
            onChange={(e) => onEditorChange(e.target.value)}
            placeholder="Start writing your post in markdown..."
            className="min-h-[400px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        ) : (
          <div className="prose dark:prose-invert max-w-none">
            <h1>{postTitle || "Post Title"}</h1>
            {postExcerpt && (
              <p className="text-muted-foreground">{postExcerpt}</p>
            )}
            {coverImageUrl && (
              <img src={coverImageUrl} alt={`Cover image for ${postTitle}`} className="w-full h-64 object-cover mb-6 rounded-md" />
            )}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {editorData}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Word count and auto-save */}
      <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{wordCount} words</span>
          </div>
          <div>
            ~{Math.ceil(wordCount / 200)} min read
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={onAutoSaveChange}
              size="sm"
            />
            <Label htmlFor="auto-save" className="cursor-pointer">Auto-save</Label>
          </div>
        </div>
      </div>
    </div>
  );
}