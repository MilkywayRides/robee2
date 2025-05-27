import { Bot, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AIAssistantProps {
  position: { x: number; y: number };
  isFullscreen: boolean;
  contentSuggestions: string[];
  onClose: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onDrag: (e: React.MouseEvent) => void;
  onDragEnd: () => void;
}

export function AIAssistant({
  position,
  isFullscreen,
  contentSuggestions,
  onClose,
  onDragStart,
  onDrag,
  onDragEnd
}: AIAssistantProps) {
  return (
    <div
      className={cn(
        "fixed bg-background border rounded-lg shadow-lg w-96 z-50 flex flex-col",
        isFullscreen ? "top-24" : ""
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div
        className="p-3 cursor-move flex items-center justify-between border-b"
        onMouseDown={onDragStart}
        onMouseMove={onDrag}
        onMouseUp={onDragEnd}
        onMouseLeave={onDragEnd}
      >
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">AI Writing Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Content Suggestions</h4>
            <ul className="space-y-2">
              {contentSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex gap-2 text-sm p-2 rounded-md hover:bg-muted cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
          <Separator />
          <div>
            <h4 className="text-sm font-medium mb-2">Ask AI Assistant</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Ask a question about your post..."
                className="text-sm"
              />
              <Button size="sm">Send</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}