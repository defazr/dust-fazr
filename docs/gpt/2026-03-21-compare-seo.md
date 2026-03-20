# Phase 4: 비교 페이지 & SEO 확장 (2026-03-21)

## 완료 항목

### 비교 페이지 3개 생성
- `/compare/seoul-vs-tokyo-air-quality`
- `/compare/seoul-vs-beijing-air-quality`
- `/compare/tokyo-vs-beijing-air-quality`

### 페이지 구성
- Hero (제목 + Live AQI Comparison)
- CompareCard 2장 (AQI 대수, PM2.5, PM10)
- Verdict (한 줄 결론 + 건강 조언)
- Analysis (WHO 기준, 건강 영향, 행동 가이드 2~3문단)
- 내부 링크 (양쪽 도시 페이지 링크)
- Related Comparisons (다른 비교 페이지 링크)
- SEO footer, Schema.org JSON-LD, 동적 metadata

### 동적 라우트 (확장 가능)
- `/compare/[slug]` 동적 라우트
- `parseCompareSlug()` 함수로 임의 도시 조합 파싱 가능
- `generateStaticParams`로 초기 3개만 빌드, ISR로 나머지 온디맨드

### 내부 링크 확장
- NearbyCities 컴포넌트에 "Compare X vs Y →" 링크 추가
- 도시 → 비교 → 도시 순환 링크 구조 (SEO 크롤링 루프)

### Sitemap 확장
- compare 페이지 3개 sitemap.xml 자동 포함 (priority 0.7)

### Last Updated UI
- CityHero: "Updated Mar 21, 10:00 AM · Data from OpenAQ" 문구 추가
- 비교 페이지: Hero 아래 "Updated Xm ago · Data from OpenAQ"

## 파일 변경
- `src/app/compare/[slug]/page.tsx` (신규)
- `src/lib/compare.ts` (신규)
- `src/lib/db.ts` (getCityWithLatest 추가)
- `src/components/NearbyCities.tsx` (비교 링크 추가, currentSlug prop)
- `src/components/CityHero.tsx` (OpenAQ 출처 문구)
- `src/app/sitemap.ts` (compare 페이지 포함)
- `src/app/air-quality/[slug]/page.tsx` (currentSlug prop 전달)

## 배포 상태
- Vercel production 배포 완료
- 139페이지 SSG (130 도시 + 3 비교 + 기타)
- 모든 페이지 200 OK 확인
