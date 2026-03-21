# DUST.FAZR — Project Status

**Last Updated:** 2026-03-21 (Session 4 완료 — 안정화 + CTR 최적화)

## Overview
SEO 중심 글로벌 공기질 플랫폼. 130개 도시 실시간 AQI/PM2.5 데이터. 232+ SSG 페이지.

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
| DB 스키마 (3 tables) | ✅ Done |
| 도시 시드 (130개) | ✅ Done |
| 프론트엔드 (15+ components) | ✅ Done |
| SEO 최적화 (CTR titles) | ✅ Done |
| Schema.org (WebPage, FAQ, ItemList, Breadcrumb) | ✅ Done |
| robots.txt + sitemap (232+ URLs) | ✅ Done |
| SSG 빌드 (232+ pages) | ✅ Done |
| 비교 페이지 (29개) | ✅ Done |
| 도시 페이지 (130개) | ✅ Done |
| 국가 페이지 (46개 + 목록) | ✅ Done |
| 키워드 페이지 (15개: 행동형 + 문제형) | ✅ Done |
| 고의도 페이지 (/air-quality-today, /aqi-scale-explained) | ✅ Done |
| 랭킹 페이지 (polluted + cleanest) | ✅ Done |
| Vercel 배포 | ✅ Done |
| 도메인 연결 (dust.fazr.co.kr) | ✅ Done |
| Collector cron (매시간) | ✅ Done |
| UX (검색, 테마, 스크롤, 메뉴, 티커) | ✅ Done |
| AdSense (3 slots/page) | ✅ Done |
| GA4 (G-3W9P03K820) | ✅ Done |
| Favicon + OG Image | ✅ Done |
| FAQ + JSON-LD | ✅ Done |
| CTA 전역 적용 | ✅ Done |
| 내부 링크 순환 구조 | ✅ Done |
| Search Console 색인 요청 | ⚠️ 진행 중 |
| 404 compare 수정 (delhi/hong-kong) | ✅ Done |
| No Data 비교 UX (경고 배너 + 분기) | ✅ Done |
| Title 중복 브랜딩 수정 (11 pages) | ✅ Done |
| CTR 최적화 (title 분기 + description) | ✅ Done |
| GA4 이벤트 추적 (TrackClick 컴포넌트) | ✅ Done |
| 도시→비교 내부 링크 ("Compare With" 블럭) | ✅ Done |
| Hero CTA 추가 (도시 페이지) | ✅ Done |

## Page Types (232+ total)
| Type | Route | Count |
|------|-------|-------|
| City | `/air-quality/[slug]` | 130 |
| Country detail | `/air-quality-by-country/[country]` | 46 |
| Compare | `/compare/[slug]` | 29 |
| Safe outside | `/is-it-safe-to-go-outside/[city]` | 5 |
| Mask guide | `/should-i-wear-mask/[city]` | 5 |
| Why bad | `/why-is-air-quality-bad/[city]` | 5 |
| Today hub | `/air-quality-today` | 1 |
| AQI guide | `/aqi-scale-explained` | 1 |
| Most polluted | `/top-most-polluted-cities` | 1 |
| Cleanest | `/best-air-quality-cities` | 1 |
| Country list | `/air-quality-by-country` | 1 |
| Home | `/` | 1 |

## AdSense Slots
| Position | Slot ID |
|----------|---------|
| Top (dust 01) | 4286289660 |
| Mid (dust 02) | 1237454490 |
| Bottom (dust 03) | 4617195255 |

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
│   │   ├── compare/[slug]/page.tsx
│   │   ├── air-quality-by-country/[country]/page.tsx
│   │   ├── is-it-safe-to-go-outside/[city]/page.tsx
│   │   ├── should-i-wear-mask/[city]/page.tsx
│   │   ├── why-is-air-quality-bad/[city]/page.tsx
│   │   ├── air-quality-today/page.tsx
│   │   ├── aqi-scale-explained/page.tsx
│   │   ├── top-most-polluted-cities/page.tsx
│   │   ├── best-air-quality-cities/page.tsx
│   │   ├── sitemap.ts
│   │   ├── icon.png (favicon 64x64)
│   │   └── layout.tsx (AdSense + GA4)
│   ├── components/ (AdSlot, FAQ, TrackClick, CitySearch, StickyHeader, etc.)
│   └── lib/ (db.ts, aqi.ts, compare.ts, keyword-cities.ts)
├── public/
│   └── og-default.png (1200x630)
└── docs/gpt/
```

## Vultr Server
- IP: 158.247.252.172
- DB Container: `dustfazr_db` (port 5433)
- Collector: `/root/dust-fazr/collector/`
- Cron: `0 * * * *`
- 기존 서비스 영향 없음

## Next Steps (Master Plan)
1. ✅ 색인 요청 (55 URLs, 3일에 걸쳐)
2. ✅ 404 안정화 (compare pairs 수정)
3. ✅ CTR 최적화 1차 (title/description/CTA/GA4 이벤트)
4. ⏳ SC 데이터 대기 → CTR 정밀 타겟팅 (노출 있고 CTR < 2%)
5. Phase 1: 순위 10~20위 페이지 내부링크/콘텐츠 보강
5. Phase 2: 지도 (Leaflet/Mapbox) + 차트 고도화
6. Phase 3: 개인화 (위치 기반, 즐겨찾기, 알림)
7. Phase 4: 수익 최적화 (A/B 테스트, 고가 키워드)
8. Phase 5: 도시 300+, 비교 자동 생성, 다국어
