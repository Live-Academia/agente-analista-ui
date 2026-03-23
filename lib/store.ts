// Zustand store — estado global do Deep Agent UI

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AnalysisResult, ChatMessage, UserInfo } from "@/types/analysis";

interface AgentStore {
  // Autenticacao
  token: string | null;
  user: UserInfo | null;
  isAdmin: boolean;
  setAuth: (token: string, user: UserInfo) => void;
  logout: () => void;

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
      // Auth
      token: null,
      user: null,
      isAdmin: false,
      setAuth: (token, user) =>
        set({ token, user, isAdmin: user.roles.includes("admin") }),
      logout: () =>
        set({
          token: null,
          user: null,
          isAdmin: false,
          analysisState: null,
          chatHistory: [],
          reportText: null,
        }),

      // Analise
      analysisState: null,
      setAnalysisState: (state) =>
        set({ analysisState: state, chatHistory: [], reportText: null }),

      // Chat
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

      // Relatorio
      reportText: null,
      setReportText: (text) => set({ reportText: text }),

      // Loading
      isAnalyzing: false,
      setIsAnalyzing: (v) => set({ isAnalyzing: v }),

      // Reset
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
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAdmin: state.isAdmin,
        analysisState: state.analysisState,
        chatHistory: state.chatHistory,
        reportText: state.reportText,
      }),
    }
  )
);
