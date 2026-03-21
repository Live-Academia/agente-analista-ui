"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataUpload } from "@/components/DataUpload";
import { KpiCard } from "@/components/KpiCard";
import { useAgentStore } from "@/lib/store";
import { analyzeFile, analyzeGoogleSheets, analyzeSupabase, analyzeBigQuery } from "@/lib/api";

type SourceTab = "file" | "sheets" | "supabase" | "bigquery";

export default function Home() {
  const router = useRouter();
  const { setAnalysisState } = useAgentStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SourceTab>("file");

  // Google Sheets fields
  const [sheetId, setSheetId] = useState("");
  const [tabName, setTabName] = useState("");
  // Supabase fields
  const [tableName, setTableName] = useState("");
  const [sbQuery, setSbQuery] = useState("");
  // BigQuery fields
  const [bqMode, setBqMode] = useState<"table" | "sql">("table");
  const [bqTable, setBqTable] = useState("");
  const [bqSql, setBqSql] = useState("");

  async function handleFile(file: File) {
    setError(null);
    setLoading(true);
    try {
      const result = await analyzeFile(file);
      setAnalysisState(result);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao analisar arquivo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSheets() {
    if (!sheetId) return;
    setError(null);
    setLoading(true);
    try {
      const sid = sheetId.includes("docs.google.com")
        ? sheetId.split("/d/")[1]?.split("/")[0] ?? sheetId
        : sheetId;
      const result = await analyzeGoogleSheets(sid, tabName || undefined);
      setAnalysisState(result);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao conectar ao Google Sheets.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSupabase() {
    if (!tableName) return;
    setError(null);
    setLoading(true);
    try {
      const result = await analyzeSupabase(tableName, sbQuery || undefined);
      setAnalysisState(result);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao conectar ao Supabase.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBigQuery() {
    setError(null);
    setLoading(true);
    try {
      const result = await analyzeBigQuery(
        bqMode === "table" ? bqTable : undefined,
        bqMode === "sql" ? bqSql : undefined
      );
      setAnalysisState(result);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao conectar ao BigQuery.");
    } finally {
      setLoading(false);
    }
  }

  const TABS: { id: SourceTab; label: string; icon: string }[] = [
    { id: "file", label: "Arquivo", icon: "📄" },
    { id: "sheets", label: "Google Sheets", icon: "📗" },
    { id: "supabase", label: "Supabase", icon: "🗄️" },
    { id: "bigquery", label: "BigQuery", icon: "📊" },
  ];

  const inputCls =
    "w-full rounded-lg border border-[#3a3d45] bg-[#2d2f36] px-3 py-2 text-sm text-[#e8e8e8] placeholder:text-[#8b8fa3] outline-none focus:border-[#7B68EE] transition-colors";
  const btnCls =
    "w-full rounded-lg bg-gradient-to-r from-[#7B68EE] to-[#6C5CE7] py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50";

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🔮</div>
        <h1 className="text-3xl font-bold text-[#e8e8e8]">Deep Agent</h1>
        <p className="mt-2 text-[#b0b4c0]">Analise dados com Inteligencia Artificial</p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-3 gap-4 w-full mb-8">
        {[
          { n: "1", label: "Conecte", desc: "CSV, Excel, Sheets, Supabase ou BigQuery" },
          { n: "2", label: "Explore", desc: "KPIs, graficos, correlacoes e padroes" },
          { n: "3", label: "Pergunte", desc: "Chat inteligente e relatorios com IA" },
        ].map((s) => (
          <KpiCard key={s.n} label={s.label} value={s.n} delta={s.desc} />
        ))}
      </div>

      {/* Source selector */}
      <div className="w-full rounded-xl border border-[#3a3d45] bg-[#23252b] p-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 rounded-lg bg-[#1a1d21] p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                activeTab === t.id
                  ? "bg-[#7B68EE] text-white"
                  : "text-[#b0b4c0] hover:text-[#e8e8e8]"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content per tab */}
        {activeTab === "file" && (
          <DataUpload onFile={handleFile} loading={loading} />
        )}

        {activeTab === "sheets" && (
          <div className="flex flex-col gap-3">
            <input className={inputCls} placeholder="URL ou Sheet ID" value={sheetId} onChange={(e) => setSheetId(e.target.value)} />
            <input className={inputCls} placeholder="Aba (opcional, ex: Sheet1)" value={tabName} onChange={(e) => setTabName(e.target.value)} />
            <button className={btnCls} onClick={handleSheets} disabled={loading || !sheetId}>
              {loading ? "Conectando..." : "🔗 Conectar Google Sheets"}
            </button>
          </div>
        )}

        {activeTab === "supabase" && (
          <div className="flex flex-col gap-3">
            <input className={inputCls} placeholder="Nome da tabela (ex: vendas)" value={tableName} onChange={(e) => setTableName(e.target.value)} />
            <input className={inputCls} placeholder="Colunas (opcional, ex: id,nome,valor)" value={sbQuery} onChange={(e) => setSbQuery(e.target.value)} />
            <button className={btnCls} onClick={handleSupabase} disabled={loading || !tableName}>
              {loading ? "Conectando..." : "🔗 Conectar Supabase"}
            </button>
          </div>
        )}

        {activeTab === "bigquery" && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              {(["table", "sql"] as const).map((m) => (
                <button key={m} onClick={() => setBqMode(m)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-semibold border transition-colors ${bqMode === m ? "border-[#7B68EE] text-[#7B68EE]" : "border-[#3a3d45] text-[#b0b4c0]"}`}>
                  {m === "table" ? "Tabela" : "SQL"}
                </button>
              ))}
            </div>
            {bqMode === "table"
              ? <input className={inputCls} placeholder="project.dataset.table" value={bqTable} onChange={(e) => setBqTable(e.target.value)} />
              : <textarea className={inputCls} rows={3} placeholder="SELECT * FROM ... LIMIT 1000" value={bqSql} onChange={(e) => setBqSql(e.target.value)} />
            }
            <button className={btnCls} onClick={handleBigQuery} disabled={loading || (!bqTable && !bqSql)}>
              {loading ? "Conectando..." : "🔗 Conectar BigQuery"}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
