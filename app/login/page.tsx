"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { useAgentStore } from "@/lib/store";
import { UserInfo } from "@/types/analysis";

function parseJwt(token: string): Record<string, unknown> {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return {};
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAgentStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) return;
    setError(null);
    setLoading(true);
    try {
      const tokenData = await login(username, password);
      const payload = parseJwt(tokenData.access_token);
      const user: UserInfo = {
        username: (payload.sub as string) || username,
        name: username,
        email: "",
        roles: (payload.roles as string[]) || [],
      };
      setAuth(tokenData.access_token, user);
      router.replace("/");
    } catch (e) {
      setError(
        e instanceof Error && e.message.includes("401")
          ? "Usuario ou senha incorretos."
          : e instanceof Error
          ? e.message
          : "Erro ao autenticar. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-[#3a3d45] bg-[#2d2f36] px-4 py-3 text-sm text-[#e8e8e8] placeholder:text-[#8b8fa3] outline-none focus:border-[#7B68EE] transition-colors";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1a1d21]">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🔮</div>
          <h1 className="text-2xl font-bold text-[#e8e8e8]">Deep Agent</h1>
          <p className="mt-1 text-sm text-[#b0b4c0]">Faca login para continuar</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-[#3a3d45] bg-[#23252b] p-6 space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#b0b4c0]">
              Usuario
            </label>
            <input
              type="text"
              autoComplete="username"
              className={inputCls}
              placeholder="seu.usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#b0b4c0]">
              Senha
            </label>
            <input
              type="password"
              autoComplete="current-password"
              className={inputCls}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#EF4444]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full rounded-lg bg-gradient-to-r from-[#7B68EE] to-[#6C5CE7] py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Autenticando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[#8b8fa3]">
          Acesso restrito a usuarios autorizados
        </p>
      </div>
    </div>
  );
}
