"use client";

import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  icon?: string;
  className?: string;
}

export function KpiCard({ label, value, delta, icon, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#3a3d45] bg-gradient-to-br from-[#2d2f36] to-[#23252b] p-5 transition-colors hover:border-[#7B68EE]",
        className
      )}
    >
      {icon && <div className="mb-2 text-xl">{icon}</div>}
      <div className="text-xs font-semibold uppercase tracking-widest text-[#b0b4c0]">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-[#e8e8e8]">{value}</div>
      {delta && (
        <div className="mt-1 text-sm text-[#7B68EE]">{delta}</div>
      )}
    </div>
  );
}
