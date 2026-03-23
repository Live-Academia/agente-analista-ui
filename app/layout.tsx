import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Deep Agent — Analise de Dados com IA",
  description: "Analise dados com inteligencia artificial: insights, graficos e relatorios automaticos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark h-full">
      <body className={`${geist.variable} font-sans bg-[#1a1d21] text-[#e8e8e8] antialiased h-full`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
