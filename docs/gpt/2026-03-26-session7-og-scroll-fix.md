# Session 7: OG/SNS 최종 검증 + Scroll 버그 수정 (2026-03-26)

## 작업 요약

### 1. OG/SNS 메타 태그 최종 검증 (실제 HTML 기준)

실제 서버 응답(curl) 기준으로 검증 — 코드가 아닌 렌더링 HTML 확인.

**홈페이지 (`https://dust.fazr.co.kr`):**
| 항목 | 값 | 판정 |
|------|-----|------|
| og:title | DUST.FAZR — Real-Time Global Air Quality Index & PM2.5 Data | OK |
| og:description | Check real-time air quality for 130+ cities... | OK |
| og:image | `https://dust.fazr.co.kr/og-default.jpg` (절대경로) | OK |
| og:url | `https://dust.fazr.co.kr` | OK |
| twitter:card | summary_large_image | OK |
| twitter:image | `https://dust.fazr.co.kr/og-default.jpg` (절대경로) | OK |

**도시 페이지 (`/air-quality/seoul-air-quality`):**
| 항목 | 값 | 판정 |
|------|-----|------|
| og:title | Seoul Air Quality (AQI 95) – Safe to Go Outside? \| DUST.FAZR | OK |
| og:image | `https://dust.fazr.co.kr/og-default.jpg` (절대경로) | OK |
| og:url | `https://dust.fazr.co.kr/air-quality/seoul-air-quality` (일치) | OK |
| twitter:card | summary_large_image | OK |
| twitter:image | `https://dust.fazr.co.kr/og-default.jpg` (절대경로) | OK |

**og:image 접근:** HTTP 200, image/jpeg, 80KB

**fb:app_id 경고:** Facebook App ID 미등록 → 무시 가능 (공유 기능에 영향 없음)

**최종: PASS**

---

### 2. AdSense Vignette + Scroll 복원 버그 수정

**문제:**
- 도시 클릭 → vignette 광고 → 닫으면 페이지가 중간/하단에서 시작
- 원인: 브라우저 scroll 위치 유지 + Next.js scroll reset 미작동 + vignette body scroll 변경

**수정 파일:**

#### `src/components/ScrollReset.tsx`
- `usePathname()` 추가 → pathname 변경마다 `scrollTo(0, 0)` 실행
- `scrollRestoration = "manual"` 유지

#### `src/components/VignetteGuard.tsx`
- `vignetteWasActive` 플래그 추가
- MutationObserver: vignette iframe 감지 → 사라지면 scrollTo + 플래그 리셋
- focus/pageshow: `vignetteWasActive === true`일 때만 scrollTo (탭 전환 시 불필요한 실행 방지)

**3단 방어 구조:**
| 트리거 | scrollTo 조건 | 과다 실행 |
|--------|--------------|----------|
| pathname 변경 | 항상 1회 | 없음 |
| focus/pageshow | vignetteWasActive일 때만 | 없음 |
| MutationObserver | vignette 닫힐 때만 | 없음 (플래그 리셋) |

---

## 커밋 이력

| 커밋 | 내용 |
|------|------|
| d07e19d | fix: scroll reset on page navigation + vignette close |

---

## 현재 상태

| 항목 | 상태 |
|------|------|
| OG 메타 (홈/도시/비교) | ✅ 전항목 PASS |
| og:image 절대경로 | ✅ PASS |
| og:url 일치 | ✅ PASS |
| Facebook 디버거 | ✅ PASS (fb:app_id 제외 — 선택사항) |
| Scroll 버그 | ✅ 수정 완료 |
| 기술 문제 전체 | ✅ 해결 완료 |

---

## 다음 단계

**SC 데이터 대기 중 → CTR 최적화 진입**

SC 데이터 오면:
1. 노출 있지만 클릭 없는 페이지 (impressions > 10, clicks = 0) — 최우선
2. CTR 낮은 페이지 (CTR < 2%, impressions > 20) — Title/Description 수정
3. 순위 10~20위 보강은 데이터 더 쌓인 후

**핵심:** 이제 "기술 문제"는 끝. "클릭 뽑는 게임" 시작.
