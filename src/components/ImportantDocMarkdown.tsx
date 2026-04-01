"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ImportantDocMarkdown({ content }: { content: string }) {
  return (
    <div className="important-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
