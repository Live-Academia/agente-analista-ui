// Zustand store — estado global do Deep Agent UI

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AnalysisResult, ChatMessage } from "@/types/analysis";

interface AgentStore {
  // Analise atual
  analysisState: AnalysisResult | null;
  setAnalysisState: (state: AnalysisResult | null) => void;

  // Historico do chat (max 50 mensagens)
  chatHistory: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

  // Relatorio gerado
  reportText: string | null;
  setReportText: (text: string | null) => void;

  // Loading states
  isAnalyzing: boolean;
  setIsAnalyzing: (v: boolean) => void;

  // Reset completo (nova fonte de dados)
  reset: () => void;
}

const MAX_CHAT_MESSAGES = 50;

export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      analysisState: null,
      setAnalysisState: (state) =>
        set({ analysisState: state, chatHistory: [], reportText: null }),

      chatHistory: [],
      addMessage: (msg) => {
        const history = [...get().chatHistory, msg];
        set({
          chatHistory:
            history.length > MAX_CHAT_MESSAGES
              ? history.slice(-MAX_CHAT_MESSAGES)
              : history,
        });
      },
      clearChat: () => set({ chatHistory: [] }),

      reportText: null,
      setReportText: (text) => set({ reportText: text }),

      isAnalyzing: false,
      setIsAnalyzing: (v) => set({ isAnalyzing: v }),

      reset: () =>
        set({
          analysisState: null,
          chatHistory: [],
          reportText: null,
          isAnalyzing: false,
        }),
    }),
    {
      name: "deep-agent-store",
      // Nao persiste loading states
      partialize: (state) => ({
        analysisState: state.analysisState,
        chatHistory: state.chatHistory,
        reportText: state.reportText,
      }),
    }
  )
);
