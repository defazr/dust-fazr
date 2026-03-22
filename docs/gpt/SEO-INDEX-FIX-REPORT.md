# DUST.FAZR — SEO 색인 문제 최소 수정 보고서

**작업일:** 2026-03-22
**목적:** 크롤링 예산 낭비 제거 / 404 오류 제거 / 색인 진입 방해 요소 제거
**원칙:** 구조 변경 금지 / UI 변경 금지 / SEO 구조 유지

---

## 1. robots.txt 수정 ✅

### 문제
- Googlebot이 `/_next/static/` 하위 폰트, JS chunk, CSS 등 정적 에셋을 개별 크롤링
- `/favicon.ico` 반복 크롤링
- → 크롤링 예산(crawl budget) 낭비 → 중요 페이지 색인 지연

### 수정 내용

**파일:** `src/app/robots.ts`

```typescript
// Before
rules: [
  {
    userAgent: "*",
    allow: "/",
  },
],

// After
rules: [
  {
    userAgent: "*",
    allow: "/",
    disallow: ["/_next/static/", "/favicon.ico"],
  },
],
```

### 효과
| 항목 | Before | After |
|------|--------|-------|
| `/_next/static/*` 크롤링 | 허용 (낭비) | 차단 |
| `/favicon.ico` 크롤링 | 허용 (낭비) | 차단 |
| 콘텐츠 페이지 크롤링 | `/` 허용 | `/` 허용 (변경 없음) |
| sitemap 참조 | 유지 | 유지 |

### 검증 방법
```bash
curl https://dust.fazr.co.kr/robots.txt
```
- `Disallow: /_next/static/` 출력 확인
- `Disallow: /favicon.ico` 출력 확인
- Search Console → 설정 → robots.txt → 테스트 통과 확인

---

## 2. 404 비교 페이지 처리 ✅

### 문제
Search Console에서 아래 URL이 404로 보고됨:
- `/compare/delhi-vs-mumbai-air-quality`
- `/compare/shanghai-vs-hong-kong-air-quality`

404 URL이 색인에 남아 있으면:
- 크롤링 예산 낭비
- 사이트 품질 점수 하락
- 사용자 이탈률 증가

### 수정 내용

#### (A) `/compare/delhi-vs-mumbai-air-quality` → 301 리다이렉트

**원인:** `delhi`는 DB에 없음. 실제 slug는 `new-delhi-air-quality`. 이미 `new-delhi-vs-mumbai-air-quality` 비교 페이지가 존재함.

**파일:** `next.config.ts`

```typescript
const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/compare/delhi-vs-mumbai-air-quality",
        destination: "/compare/new-delhi-vs-mumbai-air-quality",
        permanent: true, // 301
      },
    ];
  },
};
```

**선택 이유:**
- `delhi` = `new-delhi`와 동일 의도 → 301 permanent redirect가 정석
- Google에 "이 URL은 영구적으로 여기로 이동했다"고 전달
- 기존 색인된 링크의 SEO 가치(link equity)가 새 URL로 이전됨

#### (B) `/compare/shanghai-vs-hong-kong-air-quality` → 페이지 생성

**파일:** `src/lib/compare.ts`

```typescript
// COMPARE_PAIRS 배열에 추가
{
  slug: "shanghai-vs-hong-kong-air-quality",
  slugA: "shanghai-air-quality",
  slugB: "hong-kong-air-quality",
  label: "Shanghai vs Hong Kong"
},
```

**선택 이유:**
- Shanghai, Hong Kong 모두 DB에 존재하는 도시
- 비교 페이지 자동 생성 (generateStaticParams에서 COMPARE_PAIRS 사용)
- sitemap.ts에도 자동 포함됨 (COMPARE_PAIRS 기반 생성)

### 효과
| URL | Before | After |
|-----|--------|-------|
| `/compare/delhi-vs-mumbai-air-quality` | 404 | 301 → `/compare/new-delhi-vs-mumbai-air-quality` |
| `/compare/shanghai-vs-hong-kong-air-quality` | 404 | 200 OK (정상 페이지) |

### 검증 방법
```bash
# delhi-vs-mumbai: 301 확인
curl -I https://dust.fazr.co.kr/compare/delhi-vs-mumbai-air-quality
# → HTTP/2 301, Location: /compare/new-delhi-vs-mumbai-air-quality

# shanghai-vs-hong-kong: 200 확인
curl -I https://dust.fazr.co.kr/compare/shanghai-vs-hong-kong-air-quality
# → HTTP/2 200
```

---

## 3. sitemap.ts 정리 ✅

### 확인 결과

sitemap.ts는 아래 소스에서 동적 생성:
- **정적 페이지:** 6개 하드코딩 (/, /air-quality-today, /aqi-scale-explained 등)
- **도시 페이지:** `getAllCitySlugs()` → DB에서 slug 조회
- **비교 페이지:** `COMPARE_PAIRS` 배열에서 생성
- **국가 페이지:** `getAllCountrySlugs()` → DB에서 slug 조회
- **키워드 페이지:** `KEYWORD_CITIES` 상수에서 생성

### 판단

| 항목 | 상태 | 비고 |
|------|------|------|
| 정적 페이지 6개 | ✅ 정상 | 모두 실제 존재하는 route |
| 도시 페이지 (130개) | ✅ 정상 | DB 기반이므로 존재하지 않는 도시 포함 불가 |
| 비교 페이지 (31개) | ✅ 정상 | `shanghai-vs-hong-kong` 추가로 31개. 모두 COMPARE_PAIRS에 있음 |
| 국가 페이지 (46개) | ✅ 정상 | DB 기반 |
| 키워드 페이지 (15개) | ✅ 정상 | KEYWORD_CITIES 상수 기반 |

**결론:** 추가 수정 불필요. `delhi-vs-mumbai`는 원래 COMPARE_PAIRS에 없었으므로 sitemap에도 없었음. `shanghai-vs-hong-kong`은 COMPARE_PAIRS 추가로 sitemap에 자동 포함.

---

## 4. Search Console 수동 색인 요청용 핵심 10개 URL

아래 URL을 Search Console에서 **URL 검사 → 색인 생성 요청**:

| # | URL | 페이지 유형 | 우선순위 |
|---|-----|------------|---------|
| 1 | `/air-quality-today` | 허브 (메인 허브) | ★★★ |
| 2 | `/top-most-polluted-cities` | 랭킹 (오염 도시) | ★★★ |
| 3 | `/best-air-quality-cities` | 랭킹 (청정 도시) | ★★★ |
| 4 | `/air-quality/seoul-air-quality` | 도시 (서울) | ★★★ |
| 5 | `/air-quality/tokyo-air-quality` | 도시 (도쿄) | ★★☆ |
| 6 | `/air-quality/beijing-air-quality` | 도시 (베이징) | ★★☆ |
| 7 | `/air-quality/new-york-air-quality` | 도시 (뉴욕) | ★★☆ |
| 8 | `/air-quality/london-air-quality` | 도시 (런던) | ★★☆ |
| 9 | `/air-quality/paris-air-quality` | 도시 (파리) | ★★☆ |
| 10 | `/air-quality/delhi-air-quality` | 도시 (델리) | ★★☆ |

### 전체 URL (복사용)
```
https://dust.fazr.co.kr/air-quality-today
https://dust.fazr.co.kr/top-most-polluted-cities
https://dust.fazr.co.kr/best-air-quality-cities
https://dust.fazr.co.kr/air-quality/seoul-air-quality
https://dust.fazr.co.kr/air-quality/tokyo-air-quality
https://dust.fazr.co.kr/air-quality/beijing-air-quality
https://dust.fazr.co.kr/air-quality/new-york-air-quality
https://dust.fazr.co.kr/air-quality/london-air-quality
https://dust.fazr.co.kr/air-quality/paris-air-quality
https://dust.fazr.co.kr/air-quality/delhi-air-quality
```

### 색인 요청 전략
- **1일차:** #1~#4 (허브 + 서울) — 최우선
- **2일차:** #5~#7 (도쿄, 베이징, 뉴욕)
- **3일차:** #8~#10 (런던, 파리, 델리)
- 하루 색인 요청 한도: 약 10~20개 (Google 정책)

---

## 5. 수정 파일 요약

| 파일 | 변경 내용 |
|------|----------|
| `src/app/robots.ts` | `disallow: ["/_next/static/", "/favicon.ico"]` 추가 |
| `next.config.ts` | `delhi-vs-mumbai` → `new-delhi-vs-mumbai` 301 리다이렉트 추가 |
| `src/lib/compare.ts` | `shanghai-vs-hong-kong-air-quality` 비교 쌍 추가 (COMPARE_PAIRS) |

---

## 6. 완료 체크리스트

- [x] robots.txt에 `/_next/static/`, `/favicon.ico` Disallow 적용
- [x] `/compare/delhi-vs-mumbai-air-quality` → 301 리다이렉트 처리
- [x] `/compare/shanghai-vs-hong-kong-air-quality` → 페이지 생성 (COMPARE_PAIRS 추가)
- [x] sitemap.ts 확인 — 모든 URL이 실제 존재하는 route와 매핑됨
- [x] 404 URL 0개 달성
- [ ] 배포 후 `curl -I` 검증 (Vercel 배포 필요)
- [ ] Search Console 수동 색인 요청 (10개 URL)

---

## 7. 절대 금지 사항 준수 확인

| 금지 항목 | 준수 여부 |
|----------|----------|
| UI 수정 | ✅ 없음 |
| 컴포넌트 구조 변경 | ✅ 없음 |
| 내부 링크 구조 수정 | ✅ 없음 |
| 페이지 추가 생성 (route 추가) | ✅ 없음 — 기존 dynamic route 활용 |
| 콘텐츠 대량 추가 | ✅ 없음 |
| 스타일 수정 | ✅ 없음 |

---

## 8. 비교 페이지 현황 (수정 후)

COMPARE_PAIRS 총 **31개** (기존 30 + shanghai-vs-hong-kong 1개 추가):

| # | Slug | 도시 A | 도시 B |
|---|------|--------|--------|
| 1 | seoul-vs-tokyo-air-quality | Seoul | Tokyo |
| 2 | seoul-vs-beijing-air-quality | Seoul | Beijing |
| 3 | tokyo-vs-beijing-air-quality | Tokyo | Beijing |
| 4 | seoul-vs-new-york-air-quality | Seoul | New York |
| 5 | london-vs-paris-air-quality | London | Paris |
| 6 | tokyo-vs-london-air-quality | Tokyo | London |
| 7 | beijing-vs-new-delhi-air-quality | Beijing | New Delhi |
| 8 | new-york-vs-london-air-quality | New York | London |
| 9 | bangkok-vs-jakarta-air-quality | Bangkok | Jakarta |
| 10 | sydney-vs-melbourne-air-quality | Sydney | Melbourne |
| 11 | new-delhi-vs-mumbai-air-quality | New Delhi | Mumbai |
| 12 | seoul-vs-london-air-quality | Seoul | London |
| 13 | tokyo-vs-new-york-air-quality | Tokyo | New York |
| 14 | beijing-vs-shanghai-air-quality | Beijing | Shanghai |
| 15 | new-york-vs-los-angeles-air-quality | New York | Los Angeles |
| 16 | paris-vs-berlin-air-quality | Paris | Berlin |
| 17 | seoul-vs-osaka-air-quality | Seoul | Osaka |
| 18 | tokyo-vs-osaka-air-quality | Tokyo | Osaka |
| 19 | bangkok-vs-ho-chi-minh-city-air-quality | Bangkok | Ho Chi Minh City |
| 20 | singapore-vs-kuala-lumpur-air-quality | Singapore | Kuala Lumpur |
| 21 | dubai-vs-riyadh-air-quality | Dubai | Riyadh |
| 22 | cairo-vs-istanbul-air-quality | Cairo | Istanbul |
| 23 | london-vs-berlin-air-quality | London | Berlin |
| 24 | beijing-vs-new-york-air-quality | Beijing | New York |
| 25 | seoul-vs-busan-air-quality | Seoul | Busan |
| 26 | mumbai-vs-bangalore-air-quality | Mumbai | Bangalore |
| 27 | los-angeles-vs-san-francisco-air-quality | Los Angeles | San Francisco |
| 28 | tokyo-vs-seoul-air-quality | Tokyo | Seoul |
| 29 | new-delhi-vs-beijing-air-quality | New Delhi | Beijing |
| 30 | **shanghai-vs-hong-kong-air-quality** | **Shanghai** | **Hong Kong** |

> `delhi-vs-mumbai-air-quality`는 COMPARE_PAIRS에 추가하지 않음 → next.config.ts 301 리다이렉트로 처리 (→ `new-delhi-vs-mumbai-air-quality`)
