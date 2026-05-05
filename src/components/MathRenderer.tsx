import React from 'react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/lib/utils';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className }) => {
  if (!content) return null;

  try {
    return (
      <div className={cn("prose prose-slate dark:prose-invert max-w-none prose-p:my-0 prose-headings:my-0", className)}>
        <Markdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {content}
        </Markdown>
      </div>
    );
  } catch (error) {
    console.error("MathRenderer Error:", error);
    return (
      <div className={cn("text-red-500 bg-red-50 p-2 rounded text-xs font-mono", className)}>
        Eroare la randarea formulei. Conținut brut:
        <pre className="whitespace-pre-wrap">{content}</pre>
      </div>
    );
  }
};
