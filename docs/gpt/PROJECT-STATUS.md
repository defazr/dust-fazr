# DUST.FAZR — Project Status

**Last Updated:** 2026-03-21

## Overview
SEO 중심 글로벌 공기질 플랫폼. 130개 도시 실시간 AQI/PM2.5 데이터.

## Architecture
```
OpenAQ v3 API → Python Collector (Vultr cron) → PostgreSQL (Vultr Docker) → Next.js (Vercel ISR) → SEO Pages
```

## Production URLs
- **Live Site:** https://dust.fazr.co.kr
- **Vercel:** https://dust-fazr.vercel.app
- **GitHub:** https://github.com/defazr/dust-fazr

## Tech Stack
- **Frontend:** Next.js 16, TypeScript, Tailwind CSS, Recharts
- **Database:** PostgreSQL 16 (Vultr Docker, port 5433)
- **Collector:** Python (requests, psycopg2-binary)
- **API:** OpenAQ v3 (API key required)
- **Hosting:** Vercel (frontend) + Vultr (collector + DB)

## Current Status
| Item | Status |
|------|--------|
| OpenAQ v3 연동 | ✅ Done |
| DB 스키마 | ✅ Done |
| 도시 시드 (130개) | ✅ Done |
| 데이터 수집 (62개) | ✅ Done |
| 프론트엔드 (12 components) | ✅ Done |
| SEO 최적화 | ✅ Done |
| Schema.org | ✅ Done |
| robots.txt + sitemap | ✅ Done |
| SSG 빌드 (139 pages) | ✅ Done |
| 비교 페이지 (3개) | ✅ Done |
| Vercel 배포 | ✅ Done |
| 도메인 연결 | ✅ Done |
| Collector cron (매시간) | ✅ Done |
| UX (검색, 테마, 스크롤, 메뉴, 티커) | ✅ Done |
| Last Updated UI | ✅ Done |
| 내부 링크 순환 구조 | ✅ Done |
| AdSense 연결 | ❌ TODO |
| 도시 확장 (300+) | ❌ TODO |
| Google Search Console 등록 | ⚠️ 수동 필요 |

## Key Files
```
~/dust-fazr/
├── db/schema.sql
├── collector/
│   ├── config.py
│   ├── seed_cities.py
│   └── openaq_collector.py
├── src/
│   ├── app/
│   │   ├── air-quality/[slug]/page.tsx
│   │   ├── compare/[slug]/page.tsx    ← NEW
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/ (12 components)
│   └── lib/ (db.ts, aqi.ts, types.ts, compare.ts)
└── docs/gpt/
```

## Vultr Server Info
- IP: 158.247.252.172
- DB Container: `dustfazr_db` (port 5433)
- Collector: `/root/dust-fazr/collector/`
- Log: `/root/dust-fazr/collector.log`
- Cron: `0 * * * *` (매시간)
- 기존 서비스 영향 없음 (별도 컨테이너/포트)

## Next Steps (Priority Order)
1. Google Search Console 등록 + sitemap 제출
2. AdSense 승인 신청
3. 도시 300+ 확장
4. 랭킹 페이지 추가
5. CTR 최적화
