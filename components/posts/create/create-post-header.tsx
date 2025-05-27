"use client";

import { ArrowLeft, Bot, Eye, Maximize2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreatePostHeaderProps {
  postTitle: string;
  postStatus: string;
  unsavedChanges: boolean;
  autoSave: boolean;
  lastSaved: Date;
  isSaving: boolean;
  isFullscreen: boolean;
  previewMode: boolean;
  onBack: () => void;
  onToggleFullscreen: () => void;
  onToggleAiAssistant: () => void;
  onTogglePreview: () => void;
  onStatusChange: (status: string) => void;
  onSave: () => void;
}

export default function CreatePostHeader({
  postTitle,
  postStatus,
  unsavedChanges,
  autoSave,
  lastSaved,
  isSaving,
  isFullscreen,
  previewMode,
  onBack,
  onToggleFullscreen,
  onToggleAiAssistant,
  onTogglePreview,
  onStatusChange,
  onSave,
}: CreatePostHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4 sticky top-0 bg-background/95 backdrop-blur-sm py-3 z-10 border-b">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 hover:bg-background hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
          {postTitle || "Create New Post"}
        </h2>
        {unsavedChanges && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800">
            Unsaved changes
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center text-xs text-muted-foreground">
          {autoSave && !unsavedChanges && (
            <div className="flex items-center gap-1 mr-3">
              <Check className="h-3 w-3 text-green-500" />
              <span>
                Saved at {lastSaved.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onToggleFullscreen}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle fullscreen</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 transition-all hover:bg-primary/10 hover:text-primary"
          onClick={onToggleAiAssistant}
        >
          <Bot className="h-4 w-4" />
          AI Assistant
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onTogglePreview}
          className={cn(
            "gap-2",
            previewMode && "bg-primary/10 text-primary"
          )}
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>
        <Select value={postStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-36 border-primary/20 hover:border-primary/40 transition-colors">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                Draft
              </div>
            </SelectItem>
            <SelectItem value="published">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Publish Now
              </div>
            </SelectItem>
            <SelectItem value="scheduled">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                Schedule
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={onSave}
          className="gap-2 min-w-24"
          disabled={isSaving || (!unsavedChanges && !autoSave)}
        >
          <Save className="h-4 w-4" />
          {isSaving
            ? "Saving..."
            : postStatus === "published"
            ? "Publish"
            : postStatus === "scheduled"
            ? "Schedule"
            : "Save"}
        </Button>
      </div>
    </div>
  );
}