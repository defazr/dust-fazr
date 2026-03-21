# Phase 6: 스케일 확장 (2026-03-21)

## 신규 페이지
| 페이지 | URL | 상태 |
|--------|-----|------|
| Best Air Quality | /best-air-quality-cities | 200 OK |
| Country List | /air-quality-by-country | 200 OK |
| Country Detail (46개) | /air-quality-by-country/[country] | 200 OK |
| Compare 7개 추가 | /compare/* (총 10개) | 200 OK |

## 총 페이지 수: 195
- 130 도시 페이지
- 46 국가 상세 페이지
- 10 비교 페이지
- 3 랭킹/Best/Country 리스트
- 기타 (홈, sitemap, robots, 404)

## DB 쿼리 추가
- `getCleanestCities()` — AQI 오름차순 TOP N
- `getCountryStats()` — 국가별 평균 AQI + 도시 수
- `getCitiesByCountry()` — 국가별 도시 리스트
- `getAllCountrySlugs()` — 국가 slug 전체

## 비교 페이지 확장 (3→10)
1. Seoul vs Tokyo
2. Seoul vs Beijing
3. Tokyo vs Beijing
4. Seoul vs New York (NEW)
5. London vs Paris (NEW)
6. Tokyo vs London (NEW)
7. Beijing vs Delhi (NEW)
8. New York vs London (NEW)
9. Bangkok vs Jakarta (NEW)
10. Sydney vs Melbourne (NEW)

## 내부 링크 구조
```
Homepage → Ranking → City → Compare → City
         → Cleanest → City
         → Countries → Country → City → Compare
```

## 헤더 Nav
Home | Ranking | Cleanest | Countries

## SEO 키워드 커버리지
- most polluted cities
- best air quality cities
- air quality by country
- [country] air quality
- [city A] vs [city B] air quality
