"use client";

import { cn } from "@/lib/utils";

interface PatternBadgeProps {
  text: string;
}

function getVariant(text: string): "danger" | "success" | "warning" | "default" {
  const lo = text.toLowerCase();
  if (/nulo|zero|decrescente|baixa/.test(lo)) return "danger";
  if (/crescente|alta|forte/.test(lo)) return "success";
  if (/concentra|pareto|correlacao/.test(lo)) return "warning";
  return "default";
}

const VARIANT_STYLES = {
  danger: "border-l-[#EF4444]",
  success: "border-l-[#00C897]",
  warning: "border-l-[#FBBF24]",
  default: "border-l-[#7B68EE]",
};

export function PatternBadge({ text }: PatternBadgeProps) {
  const variant = getVariant(text);
  return (
    <div
      className={cn(
        "border-l-4 rounded-r-lg bg-[#2d2f36] px-4 py-2.5 text-sm text-[#c8cad0]",
        VARIANT_STYLES[variant]
      )}
    >
      {text}
    </div>
  );
}
