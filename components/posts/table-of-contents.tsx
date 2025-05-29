"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  return (
    <Card className="border">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Table of Contents</CardTitle>
      </CardHeader>
      <CardContent>
        {headings.length > 0 ? (
          <nav className="space-y-3">
            {headings.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                style={{ paddingLeft: `${(item.level - 1) * 16 + 12}px` }}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1 border-l-2 border-transparent hover:border-primary/50"
              >
                {item.text}
              </a>
            ))}
          </nav>
        ) : (
          <span className="text-muted-foreground text-sm">No headings found.</span>
        )}
      </CardContent>
    </Card>
  );
} 