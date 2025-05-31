"use client";

import dynamic from "next/dynamic";
import styles from "@/app/posts/[postId]/page.module.css";

const MarkdownRenderer = dynamic(() => import("@/components/MarkdownRenderer"), {
  ssr: false,
});

interface PostContentProps {
  content: string;
}

export default function PostContent({ content }: PostContentProps) {
  return (
    <div className={styles.prose + " w-full lg:w-3/4"}>
      <MarkdownRenderer content={content} />
    </div>
  );
} 