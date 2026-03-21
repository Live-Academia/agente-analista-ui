"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useAgentStore } from "@/lib/store";
import { KpiCard } from "@/components/KpiCard";
import { PatternBadge } from "@/components/PatternBadge";
import { ContextBar } from "@/components/ContextBar";

const COLORS = ["#7B68EE", "#00C897", "#FBBF24", "#EF4444", "#3B82F6", "#EC4899", "#F97316", "#06B6D4"];

const chartTheme = {
  background: "transparent",
  tooltipStyle: { backgroundColor: "#23252b", border: "1px solid #3a3d45", color: "#e8e8e8" },
};

type TabId = "overview" | "analysis" | "temporal" | "segments";

export default function DashboardPage() {
  const router = useRouter();
  const { analysisState } = useAgentStore();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  useEffect(() => {
    if (!analysisState) router.replace("/");
  }, [analysisState, router]);

  const summary = analysisState?.data_summary;
  const stats = analysisState?.statistical_analysis;
  const patterns = analysisState?.patterns ?? [];
  const business = stats?.business_metrics ?? {};
  const temporal = stats?.temporal;
  const segments = stats?.segments ?? {};
  const profile = stats?.numeric_profile ?? {};
  const correlations = stats?.high_correlations ?? [];
  const numericCols = summary?.numeric_columns ?? [];
  const categoricalCols = summary?.categorical_columns ?? [];
  const head = summary?.head ?? [];

  const hasTemporalData = temporal && Object.keys(temporal.period_totals ?? {}).length > 0;
  const hasSegments = Object.keys(segments).length > 0;

  const TABS: { id: TabId; label: string }[] = [
    { id: "overview", label: "Visao Geral" },
    { id: "analysis", label: "Analise" },
    ...(hasTemporalData ? [{ id: "temporal" as TabId, label: "Temporal" }] : []),
    ...(hasSegments ? [{ id: "segments" as TabId, label: "Segmentos" }] : []),
  ];

  // Distribuicoes para graficos
  const distributions = stats?.distributions ?? {};
  const [selCat, setSelCat] = useState<string>("");
  const catKey = selCat || categoricalCols[0] || "";
  const distData = useMemo(() => {
    if (!catKey || !distributions[catKey]) return [];
    return Object.entries(distributions[catKey])
      .slice(0, 12)
      .map(([name, value]) => ({ name: String(name).slice(0, 20), value: Number(value) }));
  }, [catKey, distributions]);

  // Temporal chart
  const [selMetric, setSelMetric] = useState<string>("");
  const periodTotals = temporal?.period_totals ?? {};
  const metricKey = selMetric || Object.keys(periodTotals)[0] || "";
  const temporalData = useMemo(() => {
    if (!metricKey || !periodTotals[metricKey]) return [];
    return Object.entries(periodTotals[metricKey]).map(([period, value]) => ({ period, value: Number(value) }));
  }, [metricKey, periodTotals]);

  // Segments chart
  const [selSeg, setSelSeg] = useState<string>("");
  const segKey = selSeg || Object.keys(segments)[0] || "";
  const segData = useMemo(() => {
    if (!segKey) return [];
    const agg = segments[segKey]?.aggregation ?? {};
    const firstMetric = Object.keys(agg)[0];
    if (!firstMetric) return [];
    return Object.entries(agg[firstMetric]).slice(0, 10).map(([name, value]) => ({
      name: String(name).slice(0, 20),
      value: Number(value),
    }));
  }, [segKey, segments]);

  if (!analysisState || !summary) return null;

  const hasBusiness = business && Object.keys(business).some((k) => (business[k] ?? 0) > 0);

  return (
    <div className="space-y-4">
      <ContextBar analysis={analysisState} />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {hasBusiness ? (
          <>
            {business.total_vendas ? <KpiCard label="Total Vendas" value={`R$ ${business.total_vendas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} /> : null}
            {business.total_lucro ? <KpiCard label="Total Lucro" value={`R$ ${business.total_lucro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} /> : null}
            {business.margem_lucro_pct ? <KpiCard label="Margem" value={`${business.margem_lucro_pct.toFixed(1)}%`} /> : null}
            {business.ticket_medio ? <KpiCard label="Ticket Medio" value={`R$ ${business.ticket_medio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} /> : null}
          </>
        ) : (
          <>
            <KpiCard label="Linhas" value={summary.shape.rows.toLocaleString("pt-BR")} />
            <KpiCard label="Colunas" value={summary.shape.columns} />
            <KpiCard label="Numericas" value={numericCols.length} />
            <KpiCard label="Categoricas" value={categoricalCols.length} />
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-[#13151a] p-1 w-fit">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${activeTab === t.id ? "bg-[#23252b] text-[#7B68EE]" : "text-[#b0b4c0] hover:text-[#e8e8e8]"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Visao Geral */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {patterns.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#b0b4c0] mb-2">Padroes Detectados</h3>
              <div className="space-y-1.5">
                {patterns.map((p, i) => <PatternBadge key={i} text={p} />)}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-[#b0b4c0] mb-2">Preview dos Dados</h3>
            <div className="overflow-auto rounded-xl border border-[#3a3d45]">
              <table className="w-full text-xs">
                <thead className="bg-[#2d2f36]">
                  <tr>
                    {head[0] && Object.keys(head[0]).map((col) => (
                      <th key={col} className="px-3 py-2 text-left font-semibold text-[#b0b4c0] whitespace-nowrap">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {head.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t border-[#3a3d45] hover:bg-[#2d2f36]">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-3 py-1.5 text-[#c8cad0] whitespace-nowrap max-w-[200px] truncate">
                          {String(val ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Analise */}
      {activeTab === "analysis" && (
        <div className="space-y-4">
          {/* Correlacoes */}
          {correlations.length > 0 && (
            <div className="rounded-xl border border-[#3a3d45] bg-[#23252b] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#b0b4c0] mb-3">Correlacoes Relevantes</h3>
              <div className="space-y-2">
                {correlations.slice(0, 6).map((c, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-[#e8e8e8] font-medium">{c.col1} × {c.col2}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-[#2d2f36]">
                      <div className="h-1.5 rounded-full" style={{
                        width: `${Math.abs(c.value) * 100}%`,
                        background: c.value > 0 ? "#7B68EE" : "#EF4444",
                      }} />
                    </div>
                    <span className={c.value > 0 ? "text-[#7B68EE]" : "text-[#EF4444]"}>
                      {c.value.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perfil numerico */}
          {Object.keys(profile).length > 0 && (
            <div className="rounded-xl border border-[#3a3d45] bg-[#23252b] p-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-[#b0b4c0] mb-3">Perfil Numerico</h3>
              <div className="overflow-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[#b0b4c0]">
                      <th className="text-left py-1 pr-4">Coluna</th>
                      <th className="text-right pr-4">Media</th>
                      <th className="text-right pr-4">Mediana</th>
                      <th className="text-right pr-4">Std</th>
                      <th className="text-right pr-4">Skewness</th>
                      <th className="text-right">CV%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(profile).map(([col, p]) => (
                      <tr key={col} className="border-t border-[#3a3d45]">
                        <td className="py-1.5 pr-4 text-[#e8e8e8] font-medium">{col}</td>
                        <td className="text-right pr-4 text-[#c8cad0]">{p.mean?.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</td>
                        <td className="text-right pr-4 text-[#c8cad0]">{p.median?.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</td>
                        <td className="text-right pr-4 text-[#c8cad0]">{p.std?.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</td>
                        <td className={`text-right pr-4 ${Math.abs(p.skewness ?? 0) > 1 ? "text-[#FBBF24]" : "text-[#c8cad0]"}`}>{p.skewness?.toFixed(2)}</td>
                        <td className="text-right text-[#c8cad0]">{((p.cv ?? 0) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Distribuicao categorica */}
          {categoricalCols.length > 0 && distData.length > 0 && (
            <div className="rounded-xl border border-[#3a3d45] bg-[#23252b] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-[#b0b4c0]">Distribuicao Categorica</h3>
                <select className="text-xs bg-[#2d2f36] border border-[#3a3d45] rounded px-2 py-1 text-[#e8e8e8]"
                  value={catKey} onChange={(e) => setSelCat(e.target.value)}>
                  {categoricalCols.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={distData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3d45" />
                  <XAxis dataKey="name" tick={{ fill: "#b0b4c0", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#b0b4c0", fontSize: 11 }} />
                  <Tooltip contentStyle={chartTheme.tooltipStyle} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {distData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Tab: Temporal */}
      {activeTab === "temporal" && temporal && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#3a3d45] bg-[#23252b] p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#e8e8e8]">Evolucao Temporal</h3>
                <p className="text-xs text-[#b0b4c0]">{temporal.date_range} · {temporal.period_count} periodos</p>
              </div>
              {Object.keys(periodTotals).length > 1 && (
                <select className="text-xs bg-[#2d2f36] border border-[#3a3d45] rounded px-2 py-1 text-[#e8e8e8]"
                  value={metricKey} onChange={(e) => setSelMetric(e.target.value)}>
                  {Object.keys(periodTotals).map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              )}
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={temporalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3d45" />
                <XAxis dataKey="period" tick={{ fill: "#b0b4c0", fontSize: 11 }} />
                <YAxis tick={{ fill: "#b0b4c0", fontSize: 11 }} />
                <Tooltip contentStyle={chartTheme.tooltipStyle} />
                <Line type="monotone" dataKey="value" stroke="#7B68EE" strokeWidth={2.5}
                  dot={{ fill: "#7B68EE", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {temporal.growth && Object.keys(temporal.growth).length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(temporal.growth).slice(0, 4).map(([col, g]) => (
                <KpiCard key={col} label={col}
                  value={`${g.avg_growth_pct >= 0 ? "+" : ""}${g.avg_growth_pct.toFixed(1)}%`}
                  delta={g.trend === "crescente" ? "📈 crescente" : g.trend === "decrescente" ? "📉 decrescente" : "➡️ estavel"} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Segmentos */}
      {activeTab === "segments" && hasSegments && (
        <div className="rounded-xl border border-[#3a3d45] bg-[#23252b] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#e8e8e8]">Segmentacao por Categoria</h3>
            {Object.keys(segments).length > 1 && (
              <select className="text-xs bg-[#2d2f36] border border-[#3a3d45] rounded px-2 py-1 text-[#e8e8e8]"
                value={segKey} onChange={(e) => setSelSeg(e.target.value)}>
                {Object.keys(segments).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            )}
          </div>
          {segData.length > 0 && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={segData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3d45" />
                <XAxis type="number" tick={{ fill: "#b0b4c0", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#b0b4c0", fontSize: 11 }} width={100} />
                <Tooltip contentStyle={chartTheme.tooltipStyle} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {segData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}
