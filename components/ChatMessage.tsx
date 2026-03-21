"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { ChatMessage as ChatMessageType } from "@/types/analysis";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "rounded-xl border border-[#3a3d45] bg-[#23252b] p-4 text-sm",
        isUser ? "ml-8 border-[#7B68EE]/30" : "mr-8"
      )}
    >
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#b0b4c0]">
        {isUser ? "Voce" : "Deep Agent"}
      </div>
      <div className="prose prose-invert prose-sm max-w-none text-[#c8cad0]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
