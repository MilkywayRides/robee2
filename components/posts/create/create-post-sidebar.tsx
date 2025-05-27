"use client";

import { Clock, FileText, Search, Sparkles, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CreatePostSidebarProps {
  wordCount: number;
  seoScore: number;
  onClose: () => void;
  onToggleAiAssistant: () => void;
}

export default function CreatePostSidebar({
  wordCount,
  seoScore,
  onClose,
  onToggleAiAssistant,
}: CreatePostSidebarProps) {
  return (
    <aside className="w-full lg:w-1/4 lg:min-w-64 hidden lg:block space-y-4">
      <Card className="sticky top-20">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            Quick Stats
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Reading Time
              </span>
              <span className="font-medium">{Math.ceil(wordCount / 200)} min</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Word Count
              </span>
              <span className="font-medium">{wordCount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Search className="h-3.5 w-3.5" />
                SEO Score
              </span>
              <span className={cn(
                "font-medium",
                seoScore >= 80 ? "text-green-500" : seoScore >= 50 ? "text-amber-500" : "text-red-500"
              )}>
                {seoScore}/100
              </span>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-medium">AI Content Assistant</h4>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={onToggleAiAssistant}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Improve Readability
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={onToggleAiAssistant}
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              Generate Excerpt
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={onToggleAiAssistant}
            >
              <Sparkles className="h-3.5 w-3.5 text-green-500" />
              Optimize SEO
            </Button>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}