'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface EditorWrapperProps {
  onChange: (data: any) => void;
  data?: any;
  placeholder?: string;
  holder?: string;
  className?: string;
}

export function EditorWrapper({
  onChange,
  data,
  placeholder = 'Start writing...',
  holder = 'editor',
  className,
}: EditorWrapperProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="min-h-[400px] w-full">
      <Textarea
        value={data || ''}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'min-h-[400px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto',
          'prose-headings:font-bold prose-headings:tracking-tight',
          'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
          'prose-strong:font-semibold',
          'prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:font-mono prose-code:text-sm',
          'prose-pre:rounded-lg prose-pre:bg-muted prose-pre:p-4',
          'prose-img:rounded-lg',
          'prose-blockquote:border-l-2 prose-blockquote:pl-4',
          'prose-hr:border-t-2',
          className
        )}
      />
    </div>
  );
} 