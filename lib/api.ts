// Cliente HTTP para a Deep Agent API

import { AnalysisResult, Token, UserInfo } from "@/types/analysis";
import { useAgentStore } from "@/lib/store";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = useAgentStore.getState().token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function login(username: string, password: string): Promise<Token> {
  const form = new FormData();
  form.append("username", username);
  form.append("password", password);
  const res = await fetch(`${API_URL}/auth/token`, { method: "POST", body: form });
  return handleResponse<Token>(res);
}

export async function getCurrentUser(): Promise<UserInfo> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });
  return handleResponse<UserInfo>(res);
}

// ── Analyze ──────────────────────────────────────────────────────────────────

export async function analyzeFile(file: File): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: form,
  });
  return handleResponse<AnalysisResult>(res);
}

export async function analyzeGoogleSheets(
  sheetId: string,
  tabName?: string
): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("sheet_id", sheetId);
  if (tabName) form.append("tab_name", tabName);
  const res = await fetch(`${API_URL}/api/analyze/google-sheets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: form,
  });
  return handleResponse<AnalysisResult>(res);
}

export async function analyzeSupabase(
  tableName: string,
  query?: string
): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("table_name", tableName);
  if (query) form.append("query", query);
  const res = await fetch(`${API_URL}/api/analyze/supabase`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: form,
  });
  return handleResponse<AnalysisResult>(res);
}

export async function analyzeBigQuery(
  tableId?: string,
  sqlQuery?: string
): Promise<AnalysisResult> {
  const form = new FormData();
  if (tableId) form.append("table_id", tableId);
  if (sqlQuery) form.append("sql_query", sqlQuery);
  const res = await fetch(`${API_URL}/api/analyze/bigquery`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: form,
  });
  return handleResponse<AnalysisResult>(res);
}

// ── Chat ─────────────────────────────────────────────────────────────────────

export async function sendChat(
  question: string,
  analysisState: AnalysisResult
): Promise<string> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ question, analysis_state: analysisState }),
  });
  const data = await handleResponse<{ answer: string }>(res);
  return data.answer;
}

export async function* streamChat(
  question: string,
  analysisState: AnalysisResult
): AsyncGenerator<string> {
  const res = await fetch(`${API_URL}/api/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ question, analysis_state: analysisState }),
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "Erro desconhecido");
    throw new Error(text);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    if (chunk) yield chunk;
  }
}

// ── Report ────────────────────────────────────────────────────────────────────

export async function generateReport(
  analysisState: AnalysisResult
): Promise<string> {
  const res = await fetch(`${API_URL}/api/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ analysis_state: analysisState }),
  });
  const data = await handleResponse<{ report_text: string }>(res);
  return data.report_text;
}

// ── Health ───────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
