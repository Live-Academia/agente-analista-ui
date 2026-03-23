"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/lib/store";

const NAV = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/dashboard", label: "Dashboard", icon: "📈" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/report", label: "Relatorio", icon: "📄" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { analysisState, reset, user, isAdmin, logout } = useAgentStore();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-[#2d2f36] bg-[#13151a] px-4 py-6">
      <div className="mb-6">
        <div className="text-lg font-bold text-[#e8e8e8]">🔮 Deep Agent</div>
        <div className="text-xs text-[#b0b4c0]">Analise de dados com IA</div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
              pathname === href
                ? "bg-[#7B68EE]/20 text-[#7B68EE] font-semibold"
                : "text-[#b0b4c0] hover:bg-[#2d2f36] hover:text-[#e8e8e8]"
            )}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto space-y-3">
        {/* Dataset ativo */}
        <div className="rounded-lg border border-[#2d2f36] p-3 text-xs text-[#b0b4c0]">
          {analysisState ? (
            <>
              <div className="font-semibold text-[#e8e8e8]">{analysisState.source_name}</div>
              <div>
                {analysisState.data_summary.shape.rows.toLocaleString("pt-BR")} linhas ×{" "}
                {analysisState.data_summary.shape.columns} colunas
              </div>
            </>
          ) : (
            <div className="text-[#8b8fa3]">Nenhum dado carregado</div>
          )}
        </div>

        {analysisState && (
          <button
            onClick={reset}
            className="w-full rounded-lg border border-[#3a3d45] py-1.5 text-xs text-[#b0b4c0] transition-colors hover:border-[#EF4444] hover:text-[#EF4444]"
          >
            🗑️ Limpar dados
          </button>
        )}

        {/* Usuario logado */}
        <div className="rounded-lg border border-[#2d2f36] p-3 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-[#e8e8e8] truncate">{user?.name || user?.username}</span>
            <span className={cn(
              "ml-1 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
              isAdmin
                ? "bg-[#7B68EE]/20 text-[#7B68EE]"
                : "bg-[#2d2f36] text-[#b0b4c0]"
            )}>
              {isAdmin ? "admin" : "user"}
            </span>
          </div>
          <button
            onClick={logout}
            className="mt-1 w-full rounded-md border border-[#3a3d45] py-1 text-[#b0b4c0] transition-colors hover:border-[#EF4444] hover:text-[#EF4444]"
          >
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
