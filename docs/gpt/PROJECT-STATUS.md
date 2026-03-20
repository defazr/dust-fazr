# DUST.FAZR — Project Status

**Last Updated:** 2026-03-20

## Overview
SEO 중심 글로벌 공기질 플랫폼. 130개 도시 실시간 AQI/PM2.5 데이터.

## Architecture
```
OpenAQ v3 API → Python Collector → PostgreSQL → Next.js (ISR) → SEO Pages
```

## Tech Stack
- **Frontend:** Next.js 16, TypeScript, Tailwind CSS, Recharts
- **Database:** PostgreSQL 17
- **Collector:** Python (requests, psycopg2-binary)
- **API:** OpenAQ v3 (API key required)
- **Hosting (planned):** Vercel (frontend) + Vultr (collector + DB)

## Current Status
| Item | Status |
|------|--------|
| OpenAQ v3 연동 | ✅ Done |
| DB 스키마 | ✅ Done |
| 도시 시드 (130개) | ✅ Done |
| 데이터 수집 (42개) | ✅ Done |
| 프론트엔드 (7 components) | ✅ Done |
| SEO 최적화 | ✅ Done |
| Schema.org | ✅ Done |
| robots.txt + sitemap | ✅ Done |
| SSG 빌드 (130 pages) | ✅ Done |
| 비교 페이지 | ❌ TODO |
| AdSense 연결 | ❌ TODO |
| Vercel 배포 | ❌ TODO |
| Collector cron | ❌ TODO |
| 도시 확장 (300+) | ❌ TODO |

## Key Files
```
~/dust-fazr/
├── db/schema.sql
├── collector/
│   ├── config.py          (API key, DB URL)
│   ├── seed_cities.py     (130 curated cities)
│   └── openaq_collector.py
├── src/
│   ├── app/
│   │   ├── air-quality/[slug]/page.tsx
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/ (7 components)
│   └── lib/ (db.ts, aqi.ts, types.ts)
└── docs/gpt/ (this folder)
```

## How to Run
```bash
# DB
brew services start postgresql@17

# Seed & Collect
cd ~/dust-fazr/collector
python3 seed_cities.py
python3 openaq_collector.py

# Frontend (port 3001, 3000 is taken)
cd ~/dust-fazr
npx next dev -p 3001
```

## Next Steps (Priority Order)
1. 비교 페이지 (`/compare/seoul-vs-tokyo`)
2. AdSense 광고 연결
3. Vercel 배포
4. Collector cron (매시간)
5. 도시 300+ 확장
