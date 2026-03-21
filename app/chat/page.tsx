"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAgentStore } from "@/lib/store";
import { ChatMessage } from "@/components/ChatMessage";
import { ContextBar } from "@/components/ContextBar";
import { streamChat } from "@/lib/api";
import { ChatMessage as ChatMsgType } from "@/types/analysis";

export default function ChatPage() {
  const router = useRouter();
  const { analysisState, chatHistory, addMessage, clearChat } = useAgentStore();
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!analysisState) router.replace("/");
  }, [analysisState, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, streamingText]);

  const stats = analysisState?.statistical_analysis ?? {};
  const summary = analysisState?.data_summary ?? { numeric_columns: [], categorical_columns: [] };
  const business = stats.business_metrics ?? {};
  const temporal = stats.temporal;

  const suggestions = [
    ...(Object.keys(business).some((k) => (business[k] ?? 0) > 0) ? ["Qual a margem de lucro por segmento?"] : []),
    ...(temporal ? ["Qual a tendencia de crescimento?"] : []),
    ...(summary.numeric_columns.length > 0 ? [`Quais outliers existem em '${summary.numeric_columns[0]}'?`] : []),
    ...(summary.categorical_columns.length > 0 ? [`Como se distribui '${summary.categorical_columns[0]}'?`] : []),
    ...(!summary.numeric_columns.length && !summary.categorical_columns.length
      ? ["Resuma os principais insights dos dados", "Quais padroes voce identifica?"]
      : []),
  ].slice(0, 4);

  async function sendMessage(text: string) {
    if (!text.trim() || streaming || !analysisState) return;

    const userMsg: ChatMsgType = { role: "user", content: text };
    addMessage(userMsg);
    setInput("");
    setStreaming(true);
    setStreamingText("");

    try {
      let full = "";
      for await (const chunk of streamChat(text, analysisState)) {
        full += chunk;
        setStreamingText(full);
      }
      addMessage({ role: "assistant", content: full });
    } catch (e) {
      addMessage({ role: "assistant", content: `Erro: ${e instanceof Error ? e.message : "falha ao conectar ao servidor."}` });
    } finally {
      setStreaming(false);
      setStreamingText("");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  if (!analysisState) return null;

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#e8e8e8]">💬 Chat com seus Dados</h1>
          <ContextBar analysis={analysisState} />
        </div>
        <button onClick={clearChat}
          className="rounded-lg border border-[#3a3d45] px-3 py-1.5 text-xs text-[#b0b4c0] transition-colors hover:border-[#EF4444] hover:text-[#EF4444]">
          🗑️ Limpar
        </button>
      </div>

      {/* Suggestions — so sem historico */}
      {chatHistory.length === 0 && !streaming && (
        <div className="mb-4">
          <p className="text-xs text-[#b0b4c0] mb-2">Sugestoes baseadas nos seus dados:</p>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => sendMessage(s)}
                className="rounded-lg border border-[#3a3d45] bg-[#2d2f36] px-3 py-2 text-left text-sm text-[#c8cad0] transition-colors hover:border-[#7B68EE] hover:text-[#e8e8e8]">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Historico */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
        {chatHistory.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}

        {/* Mensagem sendo streamada */}
        {streaming && streamingText && (
          <ChatMessage message={{ role: "assistant", content: streamingText + "▌" }} />
        )}

        {streaming && !streamingText && (
          <div className="rounded-xl border border-[#3a3d45] bg-[#23252b] p-4 text-sm text-[#b0b4c0] animate-pulse">
            Analisando...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-end">
        <textarea ref={textareaRef} rows={2}
          className="flex-1 resize-none rounded-xl border border-[#3a3d45] bg-[#23252b] px-4 py-3 text-sm text-[#e8e8e8] placeholder:text-[#8b8fa3] outline-none focus:border-[#7B68EE] transition-colors"
          placeholder="Faca uma pergunta sobre seus dados... (Enter para enviar)"
          value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
          disabled={streaming} />
        <button onClick={() => sendMessage(input)} disabled={streaming || !input.trim()}
          className="rounded-xl bg-gradient-to-r from-[#7B68EE] to-[#6C5CE7] px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50">
          {streaming ? "⏳" : "↑"}
        </button>
      </div>
    </div>
  );
}
