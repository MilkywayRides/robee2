import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none prose-img:rounded-lg prose-img:shadow-md prose-pre:bg-muted/60 prose-pre:rounded-lg prose-pre:p-4 prose-code:bg-muted/40 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-muted/30 prose-blockquote:p-4 prose-blockquote:rounded-md prose-h1:font-bold prose-h2:font-semibold prose-h3:font-semibold prose-a:text-primary hover:prose-a:underline prose-li:marker:text-primary/60 prose-table:rounded-lg prose-table:overflow-hidden prose-table:shadow-md prose-th:bg-muted/30 prose-th:font-semibold prose-th:p-2 prose-td:p-2 prose-hr:my-8">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
