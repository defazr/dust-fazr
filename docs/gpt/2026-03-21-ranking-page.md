# Phase 5: 랭킹 페이지 (2026-03-21)

## 생성 페이지
- `/top-most-polluted-cities` — 200 OK, LIVE

## 페이지 구성
1. **Hero**: "Most Polluted Cities Today" + "Live AQI Ranking" + Last Updated
2. **TOP 10 리스트**: 순위(#1~#10), 도시명, AQI (큰 숫자), 상태 라벨, 컬러
3. **Compare 링크**: 인접 순위 도시끼리 비교 링크 (Seoul vs Tokyo 등)
4. **Analysis**: WHO 기준, 건강 영향, 행동 가이드 3문단
5. **Explore More**: 비교 페이지 + 홈 링크
6. **Schema.org**: WebPage + ItemList + BreadcrumbList

## SEO
- Title: "Most Polluted Cities Today (Live AQI Ranking) | DUST.FAZR"
- Sitemap: priority 0.9 (높은 우선순위)
- 내부 링크: 홈 quick links + 헤더 nav에 "Ranking" 추가

## 내부 링크 구조
```
Homepage → Ranking → City → Compare → City
         ↗ Nav link
```

## 파일 변경
- `src/app/top-most-polluted-cities/page.tsx` (신규)
- `src/lib/db.ts` (getTopPollutedCities 추가)
- `src/app/sitemap.ts` (ranking 페이지 포함)
- `src/app/page.tsx` (Most Polluted quick link)
- `src/components/StickyHeader.tsx` (Ranking nav link)
