"use client";

import { useEffect, useRef, useState } from "react";
import EditorJS, { OutputData } from "@editorjs/editorjs";
import Paragraph from "@editorjs/paragraph";
import debounce from "lodash/debounce";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Sparkles,
  Send,
  X,
  MessageSquare,
  Copy,
  CheckCheck,
  RotateCcw,
  LightbulbIcon,
  MoreHorizontal,
  PencilIcon,
  AlertCircle,
  Save
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { DragHandleDots2Icon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { checkRateLimit, incrementRateLimit, getRateLimitStatus } from "@/lib/api-rate-limiter";

// Custom Alert component
const Alert = ({ 
  children, 
  className,
  variant = "default"
}: { 
  children: React.ReactNode, 
  className?: string,
  variant?: string 
}) => (
  <div className={cn(
    "rounded-lg border p-4", 
    variant === "warning" && "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20",
    variant === "destructive" && "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20",
    variant === "success" && "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-900/20",
    className
  )}>
    {children}
  </div>
);

const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <h5 className="mb-1 font-medium leading-none tracking-tight">{children}</h5>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm [&_p]:leading-relaxed">{children}</div>
);

interface EditorProps {
  onChange: (data: OutputData) => void;
  placeholder?: string;
  initialData?: OutputData;
  autoSaveInterval?: number; // in milliseconds
}

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
  generatedContent?: string;
}

interface ChatPopupPosition {
  x: number;
  y: number;
}

interface GenerationOptions {
  mode: "edit" | "expand" | "summarize" | "brainstorm" | "continue";
  instruction?: string;
}

export function Editor({ 
  onChange, 
  placeholder, 
  initialData, 
  autoSaveInterval = 3000 
}: EditorProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { theme } = useTheme();
  const lastSaveTimeRef = useRef<number>(Date.now());

  const [processingBlockId, setProcessingBlockId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSavedContent, setLastSavedContent] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [currentContext, setCurrentContext] = useState<string>("");
  const [isChatDialogOpen, setIsChatDialogOpen] = useState<boolean>(false);
  const [currentBlockIdForDialog, setCurrentBlockIdForDialog] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState<string>("");
  const [processingChat, setProcessingChat] = useState<boolean>(false);
  const [chatPopupPosition, setChatPopupPosition] = useState<ChatPopupPosition>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [generationOptions, setGenerationOptions] = useState<GenerationOptions>({ mode: "edit" });
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<string>("chat");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [contentSuggestions, setContentSuggestions] = useState<string[]>([]);
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    used: number;
    remaining: number;
    resetTime: number;
  }>({ used: 0, remaining: 50, resetTime: Date.now() + 24 * 60 * 60 * 1000 });

  // Debounced save function
  const debouncedSave = useRef(
    debounce(async (editor: EditorJS) => {
      try {
        setIsSaving(true);
        const outputData = await editor.save();
        onChange(outputData);
        setLastSavedContent(JSON.stringify(outputData));
        lastSaveTimeRef.current = Date.now();
      } catch (error) {
        console.error("Auto-save failed:", error);
        toast({
          title: "Auto-save Failed",
          description: "Your content couldn't be saved automatically. Please save manually.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }, autoSaveInterval)
  ).current;

  // Initialize Editor
  useEffect(() => {
    if (!containerRef.current) return;

    const initEditor = async () => {
      if (editorRef.current && typeof editorRef.current.destroy === "function") {
        await editorRef.current.destroy();
        editorRef.current = null;
      }

      try {
        const editor = new EditorJS({
          holder: containerRef.current as HTMLElement,
          data: initialData,
          placeholder: placeholder || "Start writing your content here...",
          onChange: async () => {
            if (editorRef.current) {
              debouncedSave(editorRef.current);
            }
          },
          onReady: () => {
            console.log("Editor initialized");
            setTimeout(addCustomToolbarButtons, 100);
          },
          tools: {
            paragraph: {
              class: Paragraph as any,
              inlineToolbar: true,
              config: {
                placeholder: 'Start writing or press "/" for commands',
              }
            },
          },
        });

        editorRef.current = editor;
      } catch (err) {
        console.error("Editor initialization error:", err);
      }
    };

    initEditor();

    return () => {
      debouncedSave.cancel();
      if (editorRef.current && typeof editorRef.current.destroy === "function") {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [onChange, placeholder, initialData, theme, toast, debouncedSave]);

  // Update save indicator
  useEffect(() => {
    const saveStatus = document.querySelector(".save-status");
    if (!saveStatus) return;

    if (isSaving) {
      saveStatus.textContent = "Saving...";
      saveStatus.className = "save-status text-yellow-500";
    } else {
      saveStatus.textContent = "All changes saved";
      saveStatus.className = "save-status text-green-500";
    }
  }, [isSaving]);

  // Chat scroll effect
  useEffect(() => {
    if (chatScrollRef.current && isChatDialogOpen) {
      setTimeout(() => {
        chatScrollRef.current?.scrollTo({
          top: chatScrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [chatHistory, isChatDialogOpen]);

  // Initialize rate limit status
  useEffect(() => {
    setRateLimitStatus(getRateLimitStatus());
  }, []);

  // Add custom toolbar buttons
  const addCustomToolbarButtons = () => {
    const toolbar = document.querySelector(".ce-toolbar__actions");
    if (!toolbar) return;

    // Save Indicator
    const saveIndicator = document.createElement("div");
    saveIndicator.className = `ce-toolbar__save-indicator flex items-center mr-2 text-xs ${
      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
    }`;
    saveIndicator.innerHTML = `<span class="save-status"></span>`;
    toolbar.insertBefore(saveIndicator, toolbar.firstChild);

    // AI Button
    const aiButton = document.createElement("button");
    aiButton.className = `ce-toolbar__ai-button ml-2 flex items-center justify-center p-2 rounded-full transition-colors ${
      theme === 'dark' 
        ? 'hover:bg-blue-900 bg-blue-950 text-blue-400' 
        : 'hover:bg-blue-100 bg-blue-50 text-blue-600'
    }`;
    aiButton.innerHTML = `
      <span class="ai-button-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" class="injected-svg" role="img">
          <path d="M6.23016 1.61193C6.40873 1.12936 7.09127 1.12936 7.26984 1.61193L8.07019 3.77484C8.18248 4.07828 8.42172 4.31752 8.72516 4.42981L10.8881 5.23016C11.3706 5.40873 11.3706 6.09127 10.8881 6.26984L8.72516 7.07019C8.42172 7.18248 8.18248 7.42172 8.07019 7.72516L7.26985 9.88807C7.09128 10.3706 6.40873 10.3706 6.23016 9.88807L5.42981 7.72516C5.31752 7.42172 5.07828 7.18248 4.77484 7.07019L2.61193 6.26985C2.12936 6.09128 2.12936 5.40873 2.61193 5.23016L4.77484 4.42981C5.07828 4.31752 5.31752 4.07828 5.42981 3.77484L6.23016 1.61193Z" fill="currentColor"></path>
          <path opacity="0.4" d="M5.53296 17.8517C5.81676 17.1666 6.34668 16.6372 7.10678 15.8778L15.442 7.54254C15.8964 7.08746 16.2495 6.73375 16.6534 6.5336C17.4164 6.15547 18.3123 6.15547 19.0754 6.5336C19.4793 6.73375 20.0032 7.25828 20.4576 7.71336C20.9126 8.16768 21.2663 8.5208 21.4665 8.92471C21.8446 9.68776 21.8446 10.5836 21.4665 11.3467C21.2663 11.7506 20.9126 12.1037 20.4576 12.5581L12.1223 20.8933C11.3629 21.6534 10.8335 22.1833 10.1483 22.4671C9.46319 22.7509 8.71414 22.7506 7.63973 22.75H7.63971L6.00009 22.75C5.58588 22.75 5.25009 22.4142 5.25009 22L5.25004 20.3604C5.24952 19.286 5.24916 18.5369 5.53296 17.8517Z" fill="currentColor"></path>
          <path d="M13.3438 9.64077L14.4045 8.58011L17.0303 11.206C17.3232 11.4989 17.3232 11.9738 17.0303 12.2666C16.7375 12.5595 16.2626 12.5595 15.9697 12.2666L13.3438 9.64077Z" fill="currentColor"></path>
        </svg>
      </span>
    `;
    aiButton.title = "AI Enhance & Chat";

    let isProcessing = false;

    aiButton.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (isProcessing || !editorRef.current) return;

      try {
        isProcessing = true;
        setIsLoading(true);
        aiButton.disabled = true;
        aiButton.innerHTML = `
          <span class="ai-button-content">
            <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"></path>
            </svg>
          </span>
        `;

        const outputData = await editorRef.current.save();
        const currentBlockIndex = editorRef.current.blocks.getCurrentBlockIndex();

        if (currentBlockIndex >= 0 && outputData.blocks && outputData.blocks[currentBlockIndex]) {
          const currentBlock = outputData.blocks[currentBlockIndex];

          if (currentBlock && currentBlock.type === "paragraph" && currentBlock.id) {
            const currentText = currentBlock.data.text || "";
            setProcessingBlockId(currentBlock.id);

            const contextBlocks = getContextBlocks(outputData.blocks, currentBlockIndex);
            const suggestions = await getContentSuggestions(currentText, contextBlocks);
            setContentSuggestions(suggestions);

            const enhancedText = await enhanceText(currentText, contextBlocks);

            if (editorRef.current.blocks.getById(currentBlock.id)) {
              await editorRef.current.blocks.update(currentBlock.id, { text: enhancedText });
              showInlineChat(editorRef.current, currentBlockIndex, currentBlock.id, contextBlocks);
            }
          }
        }
      } catch (error: any) {
        console.error("Error enhancing text:", error);
        toast({
          title: "Error",
          description: `Failed to enhance text: ${error.message}`,
          variant: "destructive",
        });
      } finally {
        isProcessing = false;
        setIsLoading(false);
        aiButton.disabled = false;
        aiButton.innerHTML = `
          <span class="ai-button-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" class="injected-svg" role="img">
              <path d="M6.23016 1.61193C6.40873 1.12936 7.09127 1.12936 7.26984 1.61193L8.07019 3.77484C8.18248 4.07828 8.42172 4.31752 8.72516 4.42981L10.8881 5.23016C11.3706 5.40873 11.3706 6.09127 10.8881 6.26984L8.72516 7.07019C8.42172 7.18248 8.18248 7.42172 8.07019 7.72516L7.26985 9.88807C7.09128 10.3706 6.40873 10.3706 6.23016 9.88807L5.42981 7.72516C5.31752 7.42172 5.07828 7.18248 4.77484 7.07019L2.61193 6.26985C2.12936 6.09128 2.12936 5.40873 2.61193 5.23016L4.77484 4.42981C5.07828 4.31752 5.31752 4.07828 5.42981 3.77484L6.23016 1.61193Z" fill="currentColor"></path>
              <path opacity="0.4" d="M5.53296 17.8517C5.81676 17.1666 6.34668 16.6372 7.10678 15.8778L15.442 7.54254C15.8964 7.08746 16.2495 6.73375 16.6534 6.5336C17.4164 6.15547 18.3123 6.15547 19.0754 6.5336C19.4793 6.73375 20.0032 7.25828 20.4576 7.71336C20.9126 8.16768 21.2663 8.5208 21.4665 8.92471C21.8446 9.68776 21.8446 10.5836 21.4665 11.3467C21.2663 11.7506 20.9126 12.1037 20.4576 12.5581L12.1223 20.8933C11.3629 21.6534 10.8335 22.1833 10.1483 22.4671C9.46319 22.7509 8.71414 22.7506 7.63973 22.75H7.63971L6.00009 22.75C5.58588 22.75 5.25009 22.4142 5.25009 22L5.25004 20.3604C5.24952 19.286 5.24916 18.5369 5.53296 17.8517Z" fill="currentColor"></path>
              <path d="M13.3438 9.64077L14.4045 8.58011L17.0303 11.206C17.3232 11.4989 17.3232 11.9738 17.0303 12.2666C16.7375 12.5595 16.2626 12.5595 15.9697 12.2666L13.3438 9.64077Z" fill abuses="currentColor"></path>
            </svg>
          </span>
        `;
        setProcessingBlockId(null);
      }
    };

    const existingButton = toolbar.querySelector(".ce-toolbar__ai-button");
    if (!existingButton) {
      toolbar.appendChild(aiButton);
    }
  };

  // Helper Functions
  function getContextBlocks(blocks: any[], currentIndex: number): string {
    const startIdx = Math.max(0, currentIndex - 2);
    const endIdx = Math.min(blocks.length - 1, currentIndex + 2);
    let contextText = "";

    for (let i = startIdx; i <= endIdx; i++) {
      if (i !== currentIndex && blocks[i]?.type === "paragraph") {
        contextText += blocks[i].data.text + " ";
      }
    }
    return contextText.trim();
  }

  async function enhanceText(text: string, context: string = ""): Promise<string> {
    if (!text) return "";
    try {
      const rateLimit = checkRateLimit();
      if (!rateLimit.allowed) {
        const resetTime = new Date(rateLimit.resetTime);
        const hoursUntilReset = Math.ceil((resetTime.getTime() - Date.now()) / (60 * 60 * 1000));
        toast({
          title: "Rate Limit Exceeded",
          description: `You've reached the daily limit for AI content generation. Please try again in ${hoursUntilReset} hours.`,
          variant: "destructive",
        });
        return text;
      }

      const promptWithContext = context
        ? `Enhance this text (fix grammar, improve style) while maintaining consistency with the surrounding context: 
           Context: ${context}
           Text to enhance: ${text}`
        : `Enhance this text (fix grammar, improve style): ${text}`;

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptWithContext }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          incrementRateLimit();
          setRateLimitStatus(getRateLimitStatus());
          toast({
            title: "Rate Limit Exceeded",
            description: `You've reached the daily limit for AI content generation. Please try again tomorrow.`,
            variant: "destructive",
          });
          return text;
        }
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.suggestion) {
        console.warn("Invalid response format:", data);
        return text;
      }

      incrementRateLimit();
      setRateLimitStatus(getRateLimitStatus());
      return data.suggestion;
    } catch (error: any) {
      console.error("Error in enhanceText:", error);
      return text;
    }
  }

  async function getContentSuggestions(text: string, context: string = ""): Promise<string[]> {
    try {
      const rateLimit = checkRateLimit();
      if (!rateLimit.allowed) {
        return ["Expand on the current topic", "Provide examples or evidence", "Explore counterarguments"];
      }

      const prompt = `
        Based on the current text and context, suggest 3 different directions the content could go.
        Each suggestion should be brief (1-2 sentences) but specific.
        
        Current text: "${text}"
        Context: "${context}"
        
        Format your response as a numbered list with exactly 3 items.
      `;

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          incrementRateLimit();
          setRateLimitStatus(getRateLimitStatus());
          return ["Expand on the current topic", "Provide examples or evidence", "Explore counterarguments"];
        }
        return ["Expand on the current topic", "Provide examples or evidence", "Explore counterarguments"];
      }

      const data = await response.json();
      if (!data || !data.suggestion) {
        return ["Expand on the current topic", "Provide examples or evidence", "Explore counterarguments"];
      }

      incrementRateLimit();
      setRateLimitStatus(getRateLimitStatus());

      const suggestions = data.suggestion
        .split(/\d+\./)
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0)
        .slice(0, 3);

      return suggestions.length ? suggestions : ["Expand on the current topic", "Provide examples or evidence", "Explore counterarguments"];
    } catch (error) {
      console.error("Error getting content suggestions:", error);
      return ["Expand on the current topic", "Provide examples or evidence", "Explore counterarguments"];
    }
  }

  async function generateContent(blockId: string, instruction: string, context: string = ""): Promise<string> {
    setIsGenerating(true);
    try {
      const rateLimit = checkRateLimit();
      if (!rateLimit.allowed) {
        const resetTime = new Date(rateLimit.resetTime);
        const hoursUntilReset = Math.ceil((resetTime.getTime() - Date.now()) / (60 * 60 * 1000));
        toast({
          title: "Rate Limit Exceeded",
          description: `You've reached the daily limit for AI content generation. Please try again in ${hoursUntilReset} hours.`,
          variant: "destructive",
        });
        return "";
      }

      let currentText = "";
      if (editorRef.current && blockId) {
        const blockData = await editorRef.current.blocks.getById(blockId);
        const savedData = await blockData?.save();
        currentText = savedData?.data?.text || "";
      }

      const prompt = `
        Generate content based on the following instruction: "${instruction}"
        
        Current text: "${currentText}"
        Context from surrounding text: "${context}"
        
        Your task is to generate high-quality content that follows the instruction while maintaining
        consistency with both the current text and surrounding context. The content should be
        well-structured, engaging, and ready to insert into the document.
        
        Only return the generated content without explanations or formatting instructions.
      `;

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          incrementRateLimit();
          setRateLimitStatus(getRateLimitStatus());
          toast({
            title: "Rate Limit Exceeded",
            description: `You've reached the daily limit for AI content generation. Please try again tomorrow.`,
            variant: "destructive",
          });
          return "";
        }
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.suggestion) {
        console.warn("Invalid response format:", data);
        toast({
          title: "Error",
          description: "Received invalid response from AI service",
          variant: "destructive",
        });
        return "";
      }

      incrementRateLimit();
      setRateLimitStatus(getRateLimitStatus());
      return data.suggestion;
    } catch (error: any) {
      console.error("Error generating content:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
      return "";
    } finally {
      setIsGenerating(false);
    }
  }

  async function chattedWithAI(blockId: string, message: string, context: string = ""): Promise<string> {
    if (!message) return "Please enter a message";
    try {
      const rateLimit = checkRateLimit();
      if (!rateLimit.allowed) {
        const resetTime = new Date(rateLimit.resetTime);
        const hoursUntilReset = Math.ceil((resetTime.getTime() - Date.now()) / (60 * 60 * 1000));
        return `I'm sorry, but you've reached the daily limit for AI interactions. Please try again in ${hoursUntilReset} hours.`;
      }

      const blockChatHistory = chatHistory[blockId] || [];
      const chatContext = blockChatHistory
        .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
        .join("\n");

      const promptWithContext = `
        Document Context: ${context}
        
        Previous Conversation:
        ${chatContext}
        
        User's new question: "${message}"
        
        Please respond to the user's question while considering both the document context and previous conversation.
        If appropriate, generate helpful content that could be added to the document.
      `;

      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptWithContext }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          incrementRateLimit();
          setRateLimitStatus(getRateLimitStatus());
          return `I'm sorry, but you've reached the daily limit for AI interactions. Please try again tomorrow.`;
        }
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.suggestion) {
        console.warn("Invalid response format:", data);
        return "AI response unavailable";
      }

      incrementRateLimit();
      setRateLimitStatus(getRateLimitStatus());

      let generatedContent = "";
      if (message.toLowerCase().includes("generate") || 
          message.toLowerCase().includes("create") || 
          message.toLowerCase().includes("write")) {
        generatedContent = await generateContent(blockId, message, context);
      }

      const updatedHistory: ChatMessage[] = [
        ...(chatHistory[blockId] || []),
        { role: 'user' as const, content: message, timestamp: new Date() },
        { 
          role: 'ai' as const, 
          content: data.suggestion, 
          timestamp: new Date(),
          generatedContent: generatedContent || undefined
        }
      ];

      setChatHistory(prev => ({
        ...prev,
        [blockId]: updatedHistory
      }));

      return data.suggestion;
    } catch (error: any) {
      console.error("Error in chatWithAI:", error);
      throw error;
    }
  }

  function showInlineChat(editor: EditorJS, blockIndex: number, blockId: string, context: string = ""): void {
    if (!editor || !blockId) return;
    setActiveBlockId(blockId);
    setCurrentContext(context);
    setIsChatDialogOpen(true);
    setCurrentBlockIdForDialog(blockId);
    setCurrentTab("chat");
    setGeneratedContent("");
    setIsGenerating(false);

    const blockElement = document.querySelector(`[data-id="${blockId}"]`);
    if (blockElement) {
      const rect = blockElement.getBoundingClientRect();
      const editorRect = containerRef.current?.getBoundingClientRect();
      let newX = rect.left + window.scrollX;
      if (editorRect && newX + 420 > editorRect.right) {
        newX = editorRect.right - 420;
      }
      setChatPopupPosition({
        x: Math.max(0, newX),
        y: rect.bottom + window.scrollY + 10
      });
    }
  }

  // Event Handlers
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - chatPopupPosition.x,
      y: e.clientY - chatPopupPosition.y
    });
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setChatPopupPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDialogSend = async () => {
    if (!chatInput.trim() || !currentBlockIdForDialog || processingChat) return;
    setProcessingChat(true);
    setChatHistory(prev => ({
      ...prev,
      [currentBlockIdForDialog]: [
        ...(prev[currentBlockIdForDialog] || []),
        { role: 'user' as const, content: chatInput, timestamp: new Date() }
      ]
    }));
    setChatInput("");

    try {
      await chattedWithAI(currentBlockIdForDialog, chatInput, currentContext);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setProcessingChat(false);
    }
  };

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleGenerateContent = async (instruction: string) => {
    if (!currentBlockIdForDialog) return;
    setIsGenerating(true);
    try {
      const content = await generateContent(currentBlockIdForDialog, instruction, currentContext);
      setGeneratedContent(content);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const applyGeneratedContent = async (content: string) => {
    if (!editorRef.current || !currentBlockIdForDialog || !content) return;
    try {
      const blockData = await editorRef.current.blocks.getById(currentBlockIdForDialog);
      const savedData = await blockData?.save();
      const currentText = savedData?.data?.text || "";
      let newText = "";
      switch (generationOptions.mode) {
        case "edit":
          newText = content;
          break;
        case "expand":
        case "brainstorm":
        case "continue":
          newText = currentText + "\n\n" + content;
          break;
        case "summarize":
          newText = content + "\n\n" + currentText;
          break;
        default:
          newText = content;
      }

      await editorRef.current.blocks.update(currentBlockIdForDialog, { text: newText });
      toast({
        title: "Content Applied",
        description: "The generated content has been added to your document.",
      });
      setGeneratedContent("");
    } catch (error) {
      console.error("Error applying content:", error);
      toast({
        title: "Error",
        description: "Failed to apply the content.",
        variant: "destructive",
      });
    }
  };

  // JSX
  return (
    <div className="relative w-full">
      <div
        className={cn(
          "editor-container min-h-[400px] border-2 rounded-lg p-4 shadow-sm focus:outline-none transition-all hover:shadow-md w-full",
          theme === 'dark' 
            ? "bg-gray-900 border-gray-700 text-gray-100" 
            : "bg-white border-gray-200 text-gray-900",
          isSaving && "saving-indicator"
        )}
        ref={containerRef}
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
      >
        {isSaving && (
          <div className={cn(
            "absolute bottom-2 right-2 flex items-center gap-2 px-3 py-1 rounded-full text-xs",
            theme === 'dark' ? "bg-gray-800" : "bg-gray-100"
          )}>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Saving...</span>
          </div>
        )}
      </div>

      {rateLimitStatus.remaining < 10 && (
        <Alert variant="warning" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Rate Limit Warning</AlertTitle>
          <AlertDescription>
            You have {rateLimitStatus.remaining} AI requests remaining today. 
            The limit will reset in {Math.ceil((rateLimitStatus.resetTime - Date.now()) / (60 * 60 * 1000))} hours.
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center z-10 backdrop-blur-sm",
          theme === 'dark' ? "bg-gray-900 bg-opacity-70" : "bg-white bg-opacity-70"
        )}>
          <div className={cn(
            "flex items-center space-x-2 p-4 rounded-xl shadow-lg",
            theme === 'dark' ? "bg-gray-800" : "bg-white"
          )}>
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span className="font-medium">Enhancing your content...</span>
          </div>
        </div>
      )}

      {isChatDialogOpen && currentBlockIdForDialog && (
        <div
          className={cn(
            "fixed rounded-lg shadow-lg border w-96 z-50",
            theme === 'dark' ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          )}
          style={{ left: `${chatPopupPosition.x}px`, top: `${chatPopupPosition.y}px`, maxHeight: '500px' }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div 
            className={cn(
              "drag-handle p-2 flex items-center justify-between rounded-t-lg cursor-move",
              theme === 'dark' ? "bg-gray-700" : "bg-gray-50"
            )}
            onMouseDown={handleDragStart}
            onMouseMove={isDragging ? handleDrag : undefined}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
          >
            <div className="flex items-center gap-2">
              <DragHandleDots2Icon className={cn(
                "h-4 w-4",
                theme === 'dark' ? "text-gray-400" : "text-gray-500"
              )} />
              <span className="text-sm font-medium">AI Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setIsChatDialogOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid grid-cols-2 p-1 mx-2 mt-1">
              <TabsTrigger value="chat" className="text-xs">Chat</TabsTrigger>
              <TabsTrigger value="generate" className="text-xs">Generate</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="p-0 m-0">
              <ScrollArea className="h-80 p-2" ref={chatScrollRef}>
                {(chatHistory[currentBlockIdForDialog]?.length || 0) > 0 ? (
                  chatHistory[currentBlockIdForDialog].map((message, idx) => (
                    <div 
                      key={`${message.timestamp.toISOString()}-${idx}`} 
                      className={cn("mb-3 last:mb-2", message.role === "user" ? "ml-4" : "")}
                    >
                      <div className="flex gap-2">
                        {message.role === "ai" ? (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="/ai-avatar.png" />
                            <AvatarFallback className={cn(
                              theme === 'dark' ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-600"
                            )}>
                              <Sparkles className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className={cn(
                              theme === 'dark' ? "bg-gray-700" : "bg-gray-100"
                            )}>U</AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <Badge variant={message.role === "ai" ? "secondary" : "outline"} className="text-[10px] py-0 h-4 mb-1">
                              {message.role === "ai" ? "Assistant" : "You"}
                            </Badge>
                            {message.role === "ai" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={() => handleCopyMessage(message.content, `${message.timestamp.toISOString()}-${idx}`)}
                              >
                                {copiedMessageId === `${message.timestamp.toISOString()}-${idx}` ? (
                                  <CheckCheck className="h-3 w-3" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                          <div className="text-sm">{message.content}</div>
                          {message.generatedContent && (
                            <div className={cn(
                              "mt-2 p-2 rounded-md border",
                              theme === 'dark' ? "bg-blue-950 border-blue-800" : "bg-blue-50 border-blue-100"
                            )}>
                              <div className={cn(
                                "text-xs font-medium mb-1 flex items-center",
                                theme === 'dark' ? "text-blue-300" : "text-blue-600"
                              )}>
                                <PencilIcon className="h-3 w-3 mr-1" />
                                Generated Content
                              </div>
                              <div className={cn(
                                "text-xs",
                                theme === 'dark' ? "text-gray-300" : "text-gray-600"
                              )}>
                                {message.generatedContent.length > 100 
                                  ? `${message.generatedContent.substring(0, 100)}...` 
                                  : message.generatedContent}
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="mt-1 h-7 text-xs"
                                onClick={() => applyGeneratedContent(message.generatedContent || "")}
                              >
                                Apply to Document
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                    <MessageSquare className={cn(
                      "h-8 w-8 mb-2",
                      theme === 'dark' ? "text-gray-600" : "text-gray-300"
                    )} />
                    <p className={cn(
                      "text-sm",
                      theme === 'dark' ? "text-gray-400" : "text-gray-500"
                    )}>No messages yet</p>
                    <p className={cn(
                      "text-xs mt-1",
                      theme === 'dark' ? "text-gray-500" : "text-gray-400"
                    )}>Start a conversation with the AI assistant</p>
                  </div>
                )}
              </ScrollArea>

              <div className={cn(
                "p-2 border-t",
                theme === 'dark' ? "border-gray-700" : "border-gray-100"
              )}>
                <form 
                  className="flex gap-2" 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleDialogSend();
                  }}
                >
                  <Input
                    placeholder="Ask the AI for help..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="text-sm"
                    disabled={processingChat}
                  />
                  <Button 
                    size="sm"
                    type="submit"
                    disabled={processingChat || !chatInput.trim()}
                  >
                    {processingChat ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="generate" className="p-0 m-0">
              <div className="p-4">
                <div className="mb-3">
                  <label className="text-sm font-medium">Custom Instructions</label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      placeholder="E.g. Write a conclusion paragraph..."
                      value={generationOptions.instruction || ""}
                      onChange={(e) => setGenerationOptions({
                        ...generationOptions,
                        instruction: e.target.value
                      })}
                      className="text-xs"
                    />
                    <Button 
                      size="sm"
                      onClick={() => handleGenerateContent(generationOptions.instruction || "")}
                      disabled={isGenerating || !generationOptions.instruction}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {generatedContent && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Generated Content</h4>
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => setGeneratedContent("")}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Clear content</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <div className={cn(
                      "p-2 rounded-md text-xs max-h-32 overflow-y-auto",
                      theme === 'dark' ? "bg-gray-700" : "bg-gray-50"
                    )}>
                      {generatedContent}
                    </div>
 muon                   <Button
                      className="w-full mt-2 text-xs"
                      onClick={() => applyGeneratedContent(generatedContent)}
                    >
                      Apply to Document
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <style jsx global>{`
        .editor-container {
          transition: all 0.2s ease-in-out;
        }
        .editor-container:focus-within {
          border-color: ${theme === 'dark' ? '#3b82f6' : '#60a5fa'};
          box-shadow: 0 0 0 2px ${theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(96, 165, 250, 0.1)'};
        }
        .ce-block--selected {
          background: ${theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(96, 165, 250, 0.1)'};
          border-radius: 0.375rem;
        }
        .saving-indicator {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .7;
          }
        }
      `}</style>

      <Toaster />
    </div>
  );
}