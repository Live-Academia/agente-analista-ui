// Cliente HTTP para a Deep Agent API

import { AnalysisResult } from "@/types/analysis";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Analyze ──────────────────────────────────────────────────────────────────

export async function analyzeFile(file: File): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
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
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
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
