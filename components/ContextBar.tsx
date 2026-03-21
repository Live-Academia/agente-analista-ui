"use client";

import { AnalysisResult } from "@/types/analysis";

interface ContextBarProps {
  analysis: AnalysisResult;
}

export function ContextBar({ analysis }: ContextBarProps) {
  const { data_summary, source_name } = analysis;
  const { shape, numeric_columns, categorical_columns } = data_summary;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-[#3a3d45] bg-[#23252b] px-4 py-2.5 text-sm text-[#b0b4c0]">
      <span>
        📊 <strong className="text-[#e8e8e8]">{source_name}</strong>
      </span>
      <span>
        {shape.rows.toLocaleString("pt-BR")} linhas × {shape.columns} colunas
      </span>
      <span>
        {numeric_columns.length} numéricas · {categorical_columns.length} categóricas
      </span>
    </div>
  );
}
