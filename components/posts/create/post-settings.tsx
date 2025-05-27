"use client";

import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

const allTags = [
  "Next.js",
  "React",
  "TypeScript",
  "JavaScript",
  "CSS",
  "Tailwind",
  "Design",
  "Development",
  "Web Dev",
  "UI/UX",
  "Frontend",
  "Backend",
  "API",
  "Database",
  "Performance",
  "Accessibility",
  "SEO",
  "Testing",
];

interface PostSettingsProps {
  selectedTags: string[];
  scheduledDate: string;
  onTagsChange: (tags: string[]) => void;
  onScheduledDateChange: (date: string) => void;
}

export default function PostSettings({
  selectedTags,
  scheduledDate,
  onTagsChange,
  onScheduledDateChange,
}: PostSettingsProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Post Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 border rounded-md p-3 max-w-md">
              {selectedTags.map((tag) => (
                <Badge key={tag} className="px-2 py-1">
                  {tag}
                  <button
                    onClick={() => toggleTag(tag)}
                    className="ml-1 text-xs hover:text-foreground/70"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Tag
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    <div className="font-medium text-sm">Available Tags</div>
                    <div className="grid grid-cols-2 gap-1">
                      {allTags.map((tag) => (
                        <div
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            "text-xs cursor-pointer py-1 px-2 rounded-md",
                            selectedTags.includes(tag)
                              ? "bg-primary/10 text-primary"
                              : "hover:bg-muted"
                          )}
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="scheduled-date">Scheduled Date</Label>
            <Input
              id="scheduled-date"
              type="datetime-local"
              className="max-w-md"
              value={scheduledDate}
              onChange={(e) => onScheduledDateChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Select defaultValue="current">
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Select Author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">MilkywayRides</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="comments">Enable Comments</Label>
              <Switch id="comments" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="featured">Display as Featured Post</Label>
            <Switch id="featured" />
          </div>
          <p className="text-sm text-muted-foreground">
            Featured posts will be displayed prominently on your blog's homepage.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}