# SignalOS

AI-native GTM Intelligence platform for revenue teams. Monitor competitors, market changes, hiring signals, and buying intent from an authenticated intelligence terminal.

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Recharts
- cmdk (command palette)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with any credentials (demo auth sets a session cookie).

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Authenticated access gate |
| `/dashboard` | Intelligence dashboard with charts, AI insights, timeline |
| `/research` | Research Agent — company intelligence briefs |
| `/competitors` | Competitor threat matrix and movements |
| `/signals` | Real-time signals feed with filters |
| `/reports` | Intelligence report archive |

## Bright Data SERP (Research Agent)

Copy `env.example` to `.env.local` and add your credentials:

```bash
cp env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `BRIGHT_DATA_API_KEY` | API key from Bright Data zone overview |
| `BRIGHT_DATA_SERP_ZONE` | SERP API zone name (e.g. `serp_api1`) |
| `OPENAI_API_KEY` | OpenAI API key for GTM report synthesis |
| `OPENAI_MODEL` | Optional model override (default: `gpt-4o-mini`) |

The Research Agent calls `POST /api/research` which:
1. Fetches four parallel Google searches via Bright Data
2. Sends results to OpenAI for GTM intelligence synthesis
3. Returns an actionable report (not raw SERP results)


Press `⌘K` (or `Ctrl+K`) from any authenticated page to open the command palette.
