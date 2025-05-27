"use client";

import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface SeoSettingsProps {
  title: string;
  excerpt: string;
  seoScore: number;
  readabilityScore: number;
}

const seoSuggestions = [
  "Your keyword density could be improved",
  "Consider adding alt text to images",
  "Add more internal links to related content",
];

export default function SeoSettings({
  title,
  excerpt,
  seoScore,
  readabilityScore,
}: SeoSettingsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta-title">Meta Title</Label>
            <Input
              id="meta-title"
              placeholder="Meta title (defaults to post title)"
              className="max-w-md"
              defaultValue={title}
            />
            <p className="text-xs text-muted-foreground">
              {title.length} / 60 characters
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta-description">Meta Description</Label>
            <Textarea
              id="meta-description"
              placeholder="Meta description (defaults to post excerpt)"
              className="max-w-md resize-none"
              rows={3}
              defaultValue={excerpt}
            />
            <p className="text-xs text-muted-foreground">
              {excerpt.length} / 160 characters
            </p>
          </div>
          <div className="space-y-2">
            <Label>SEO Score</Label>
            <div className="max-w-md">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Current Score: {seoScore}/100</span>
                <span
                  className={cn(
                    "text-sm font-medium",
                    seoScore >= 80
                      ? "text-green-500"
                      : seoScore >= 50
                      ? "text-amber-500"
                      : "text-red-500"
                  )}
                >
                  {seoScore >= 80
                    ? "Good"
                    : seoScore >= 50
                    ? "Needs Improvement"
                    : "Poor"}
                </span>
              </div>
              <Progress
                value={seoScore}
                className={cn(
                  "h-2",
                  seoScore >= 80
                    ? "bg-green-500"
                    : seoScore >= 50
                    ? "bg-amber-500"
                    : "bg-red-500"
                )}
              />
              <div className="mt-3 space-y-2">
                <h4 className="text-sm font-medium">
                  Suggestions for improvement:
                </h4>
                <ul className="text-sm space-y-1">
                  {seoSuggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Readability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm">
                Readability Score: {readabilityScore}/100
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  readabilityScore >= 80
                    ? "text-green-500"
                    : readabilityScore >= 60
                    ? "text-amber-500"
                    : "text-red-500"
                )}
              >
                {readabilityScore >= 80
                  ? "Easy to read"
                  : readabilityScore >= 60
                  ? "Moderately readable"
                  : "Difficult"}
              </span>
            </div>
            <Progress
              value={readabilityScore}
              className={cn(
                "h-2",
                readabilityScore >= 80
                  ? "bg-green-500"
                  : readabilityScore >= 60
                  ? "bg-amber-500"
                  : "bg-red-500"
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}