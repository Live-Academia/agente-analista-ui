# Como Contribuir — Deep Agent UI

Obrigado por contribuir! Este guia define os padroes de trabalho para o time.

## Pre-requisitos

- Node.js 18+
- npm 10+
- Git
- Acesso ao repositorio na org `Live-Academia`

## Setup Local

```bash
# Clone o repositorio
git clone https://github.com/Live-Academia/agente-analista-ui.git
cd agente-analista-ui

# Instale as dependencias
npm install

# Configure as variaveis de ambiente
cp .env.example .env.local
# Edite .env.local com a URL do backend

# Rode em modo desenvolvimento
npm run dev
```

O app estara disponivel em `http://localhost:3000`.

> **Backend:** Para rodar localmente, clone `agente-analista-api` e siga o CONTRIBUTING.md do backend. Configure `NEXT_PUBLIC_API_URL=http://localhost:8080`.

## Estrategia de Branches

```
main         → producao (Vercel deploy automatico)
develop      → integracao (branch base para features)
feature/xxx  → nova funcionalidade
fix/xxx      → correcao de bug
hotfix/xxx   → correcao urgente
release/x.x  → preparacao de release
```

**Fluxo padrao:**

```bash
git checkout develop
git pull origin develop
git checkout -b feature/minha-feature

# ... desenvolva ...

git push origin feature/minha-feature
# Abra PR no GitHub para develop
```

## Padrao de Commits (Conventional Commits)

```
feat: add report download button
fix: fix streaming not showing tokens
docs: update API URL in README
test: add unit tests for KpiCard
chore: update next.js to 16.2
refactor: extract chart colors to constants
ci: update TypeScript check in CI
```

**Tipos validos:** `feat`, `fix`, `docs`, `test`, `chore`, `refactor`, `ci`, `perf`

## Verificando antes de abrir PR

```bash
# TypeScript sem erros
npm run build

# Rodar localmente para teste manual
npm run dev
```

## Abrindo um Pull Request

1. PR para `develop` (nao `main`)
2. Preencha o template completamente
3. Aguarde 1 review antes de merge
4. Use **Squash and Merge**

## Deploy

- **develop** → sem deploy automatico
- **main** → Vercel deploy automatico em producao

## Variaveis de Ambiente (Vercel)

| Variavel | Descricao |
|---------|-----------|
| `NEXT_PUBLIC_API_URL` | URL do backend FastAPI (ex: `https://agente-analista-api.fly.dev`) |
