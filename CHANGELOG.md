# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [1.0.0] - 2026-03-20

### Adicionado
- Frontend Next.js 15 App Router com TypeScript
- Dark mode ClickUp-style com acento #7B68EE (purple)
- Sidebar de navegacao com estado do dataset ativo
- Pagina inicial: upload de arquivo + 4 fontes de dados (CSV, Google Sheets, Supabase, BigQuery)
- Dashboard: KPIs, tabs (Visao Geral, Analise, Temporal, Segmentos), graficos Recharts
- Chat: streaming SSE token-a-token, sugestoes contextuais, limpar historico
- Relatorio: geracao com LLM, download Markdown
- Zustand store com persistencia em localStorage
- shadcn/ui components: button, card, badge, tabs, progress, separator
- CI/CD: TypeScript check + build em PRs, deploy automatico no Vercel via integracao GitHub
- Governance: CONTRIBUTING.md, PR template, issue templates, CHANGELOG
