# Sistema de Referrals + Leads (CRM)

Sistema para o proprietário criar **parceiros** que recomendam clientes através de
um link único, e gerir as **leads** que entram por esses links.

## Arquitetura

Integrado na stack existente — nada de novo runtime:

- **Next.js 15 App Router** — route handler `/r/[code]` + páginas server-component no `/admin`.
- **Prisma + PostgreSQL** — modelos `Referral`, `ReferralVisit`, `Lead` (estendido), enum `LeadStatus`.
- **Auth** — o middleware existente (`src/middleware.ts`, cookie JWT `mq_admin`) já protege
  todo o `/admin` e `/api/admin`. As páginas e server actions novas herdam essa proteção;
  cada action chama `guard()` antes de escrever.
- **Server actions** (`src/lib/referral-actions.ts`) no mesmo padrão `guard()` / `revalidatePath`
  já usado em `src/lib/admin-actions.ts`.
- **Sem base de dados**: o site público continua a funcionar a partir de `src/content/seed.ts`;
  o CRM mostra "precisa de base de dados" (referrals/leads são dados dinâmicos, não conteúdo).

## Base de dados (`prisma/schema.prisma`)

```
Referral        id, name, company, email, code (@unique), active, notes, timestamps
ReferralVisit   id, referralId → Referral, path, utmSource/Medium/Campaign, referer, createdAt
Lead (novo)     + company, status (LeadStatus), referralId → Referral (SetNull),
                + utmSource/Medium/Campaign, landingPath, updatedAt
LeadStatus      NEW · CONTACTED · QUALIFIED · BOOKED · WON · LOST
```

`Referral 1 ── N Lead` (uma lead tem 0 ou 1 referral).
`Referral 1 ── N ReferralVisit` (todas as visitas ficam guardadas → permite analytics multi-touch depois).

O código (`joao-x7k2`) é **gerado automaticamente** (`src/lib/referral.ts`): `slug(nome)-<4 aleatórios>`,
com retry até ser único (garantia final: constraint `@unique`). O admin nunca o escreve.

## Como funciona o referral tracking

1. O parceiro partilha `https://dominio.com/r/joao-x7k2` (com `?utm_source=…` opcionais).
2. `GET /r/[code]` (`src/app/r/[code]/route.ts`):
   - valida o código na BD (existe **e** `active`);
   - grava um `ReferralVisit`;
   - escreve o cookie **`mq_ref`** — `httpOnly`, `SameSite=Lax`, `Secure` em produção, **30 dias**,
     `Path=/` — com `{ código, utm, landing path, timestamp }`;
   - redireciona 302 para `/` (ou para `?to=/caminho` same-origin).
   - Código inválido/inativo/desconhecido → **o mesmo redirect, sem tocar no cookie**
     (não é um oráculo de enumeração).
3. O cookie é `httpOnly` → o browser envia-o mas o JavaScript da página **não o lê**.

### Como a lead fica associada ao referral

`POST /api/contact` (`src/app/api/contact/route.ts`), server-side:

1. lê o cookie `mq_ref` (nunca confia no body do cliente);
2. procura o `Referral` pelo código; usa-o **só se `active`**;
3. cria a `Lead` com `referralId`, `utm*` e `landingPath`;
4. notifica o Telegram com a linha `🤝 Indicado por: Nome — Empresa`.

### Modelo de atribuição — **LAST-TOUCH**

| Caso | Resultado |
|---|---|
| Sem link | `referralId = null` → "Entrada direta" |
| Entra pelo João → submete | João |
| Entra pelo João → navega → submete dias depois | João (cookie 30 dias, `Path=/`) |
| Entra pelo João **e depois** pela Maria | **Maria** — a última visita válida sobrepõe o cookie |

Escolhemos last-touch porque é o link que efetivamente trouxe o visitante à conversão,
é o padrão da indústria (last-click) e evita que um parceiro fique preso à primeira
partilha. Todas as visitas ficam em `ReferralVisit`, por isso um modelo multi-touch
pode ser calculado depois sem perda de dados.

## Rotas / páginas

| Rota | O quê |
|---|---|
| `GET /r/[code]` | Link de referral (redirect + cookie + visita) — **pública** |
| `POST /api/contact` | Submissão de lead (já existia; agora com company + atribuição) — **pública** |
| `/admin` | **Dashboard** — totais, gráfico 14 dias, leads por estado, top referrals |
| `/admin/referrals` | Tabela de parceiros + criar + pesquisa/filtro |
| `/admin/referrals/[id]` | Detalhe: URL + copiar, stats, editar, ativar/desativar, regenerar código, leads do parceiro |
| `/admin/leads` | Tabela de leads com filtros (estado, origem, pesquisa) + mudança de estado inline |
| `/admin/leads/[id]` | Ficha completa da lead + SOURCE + UTM + editar |
| `/admin/conteudos` | (movido de `/admin`) edição de conteúdos do site |

Server actions: `createReferral`, `updateReferral`, `toggleReferral`, `regenerateCode`,
`updateLeadStatus`, `updateLead` — todas em `src/lib/referral-actions.ts`, todas com `guard()`.

## Segurança

- `/admin/**` e `/api/admin/**` — protegidos pelo middleware (JWT). Páginas/actions novas herdam.
- `/r/[code]` — pública por design: só devolve um redirect e escreve um cookie httpOnly.
  Não expõe nomes, empresas nem leads. Resposta idêntica para códigos válidos/inválidos.
- `/api/contact` — validação + sanitização + honeypot já existentes; `company` limitado a 160 chars.
  **`referralId` nunca vem do cliente** — só do cookie httpOnly.
- Prisma (queries parametrizadas) → sem SQL injection. Output em JSX → sem XSS.
  `?to=` em `/r` restrito a paths same-origin.

## Variáveis de ambiente

| Var | Necessária? | Para quê |
|---|---|---|
| `DATABASE_URL` | **Sim, para o CRM** | Postgres. Sem ela o site funciona na mesma (seed), mas não há referrals/leads. |
| `NEXT_PUBLIC_SITE_URL` | Recomendada | Monta o link mostrado no backoffice (`<url>/r/<code>`). Sem barra final. |
| `AUTH_SECRET`, `ADMIN_PASSWORD_HASH` | Sim (já existiam) | Login do backoffice. |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Opcional (já existiam) | Notificação de leads (agora inclui o parceiro). |

## Como testar (local)

```bash
npx prisma db push          # cria Referral, ReferralVisit, colunas novas em Lead
npm run dev                  # porta 3015
```

1. Login em `/login`, ir a `/admin/referrals`, criar "João Teixeira / Empresa X".
2. Copiar o link, abri-lo numa janela anónima → redireciona para `/`; o cookie `mq_ref`
   (httpOnly) fica no browser e aparece uma linha em `ReferralVisit`.
3. Preencher o formulário do site (modal de um projeto ou o formulário geral, com Empresa).
4. `/admin/leads` → a lead aparece com **Origem = João Teixeira**; abrir a ficha → SOURCE + UTM.
   O Telegram recebe "🤝 Indicado por: João Teixeira — Empresa X".
5. Criar "Maria", visitar `/r/joao-…` e depois `/r/maria-…`, submeter → lead da **Maria** (last-touch).
6. Limpar cookies, submeter → **Entrada direta**.
7. Mudar o estado de uma lead no dropdown → persiste (reload).

## Deploy (servidor próprio)

```bash
git pull
export DATABASE_URL="postgres://…"            # Neon / Supabase / self-hosted
export NEXT_PUBLIC_SITE_URL="https://dominio.com"
npm ci
npm run build      # corre prisma generate + prisma db push + seed idempotente
npm run start      # porta 3000
```

Reverse proxy (Nginx/Caddy) → porta 3000; garantir que `/r/*` chega ao Next
(não intercetar como ficheiro estático).
