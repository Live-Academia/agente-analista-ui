"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAgentStore } from "@/lib/store";
import { generateReport } from "@/lib/api";
import { ContextBar } from "@/components/ContextBar";

export default function ReportPage() {
  const router = useRouter();
  const { analysisState, reportText, setReportText } = useAgentStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisState) router.replace("/");
  }, [analysisState, router]);

  async function handleGenerate() {
    if (!analysisState) return;
    setLoading(true);
    setError(null);
    try {
      const text = await generateReport(analysisState);
      setReportText(text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar relatorio.");
    } finally {
      setLoading(false);
    }
  }

  function downloadMd() {
    if (!reportText) return;
    const blob = new Blob([reportText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "relatorio_deep_agent.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!analysisState) return null;

  const shape = analysisState.data_summary.shape;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-[#e8e8e8]">📄 Relatorio com Insights de IA</h1>
      <ContextBar analysis={analysisState} />

      {reportText ? (
        <>
          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={downloadMd}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#00C897] to-[#00B386] px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90">
              ⬇️ Download .md
            </button>
            <button onClick={() => setReportText(null)}
              className="rounded-lg border border-[#3a3d45] px-4 py-2 text-sm text-[#b0b4c0] transition-colors hover:border-[#7B68EE] hover:text-[#e8e8e8]">
              🔄 Regenerar
            </button>
          </div>

          {/* Relatorio */}
          <div className="rounded-xl border border-[#3a3d45] bg-[#23252b] p-6 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportText}</ReactMarkdown>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-[#3a3d45] bg-[#23252b] p-8 text-center space-y-4">
          <div className="text-4xl">📊</div>
          <p className="text-[#b0b4c0]">
            Gere um relatorio completo com insights de IA sobre{" "}
            <strong className="text-[#e8e8e8]">{shape.rows.toLocaleString("pt-BR")} linhas</strong> e{" "}
            <strong className="text-[#e8e8e8]">{shape.columns} colunas</strong> de dados.
          </p>

          {loading ? (
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-2 text-sm text-[#b0b4c0]">
                <div className="w-8 h-8 border-2 border-[#7B68EE] border-t-transparent rounded-full animate-spin" />
                <span>Gerando insights com IA...</span>
              </div>
            </div>
          ) : (
            <button onClick={handleGenerate}
              className="rounded-lg bg-gradient-to-r from-[#7B68EE] to-[#6C5CE7] px-6 py-3 text-sm font-semibold text-white transition-all hover:opacity-90">
              🚀 Gerar Relatorio
            </button>
          )}

          {error && (
            <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
