"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useAgentStore } from "@/lib/store";

const PUBLIC_ROUTES = ["/login"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAgentStore((s) => s.token);
  const [hydrated, setHydrated] = useState(false);

  // Aguarda hidratacao do Zustand persist antes de verificar auth
  useEffect(() => {
    setHydrated(true);
  }, []);

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!hydrated) return;
    if (!isPublic && !token) {
      router.replace("/login");
    }
  }, [hydrated, isPublic, token, router]);

  // Login page: full-screen sem sidebar
  if (isPublic) {
    return <>{children}</>;
  }

  // Aguardando hidratacao ou redirecionamento
  if (!hydrated || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1d21]">
        <div className="text-[#b0b4c0] text-sm animate-pulse">Carregando...</div>
      </div>
    );
  }

  // App autenticado com sidebar
  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
