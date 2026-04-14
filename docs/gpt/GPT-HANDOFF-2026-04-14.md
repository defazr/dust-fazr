# GPT Handoff — 2026-04-14 (Session 11)

## 이번 세션 요약

### 1. CTR 최적화 — 도시 페이지 메타 교체 배포

**배경:**
- 노출 1,084 / 클릭 3 / CTR 0.28%
- 순위 40~60위권 진입 → "보이는데 안 눌린다" 문제
- 기존 메타에 동적 AQI 숫자/PM2.5 수치가 포함 → ISR(매시간)로 title 계속 변경 → Google 안정성 깨짐

**지시서 흐름:**
- Claude UI가 CTR 최적화 지시서 v1 작성
- GPT 태클 4개 (AQI 숫자 제거, Action-based 금지, OG/Twitter 통일, 길이 제한) → 전부 반영
- Claude UI가 최종 v4 작성 → GPT 최종 승인 → Claude Code 실행

**변경 내용:**

| 항목 | Before | After |
|------|--------|-------|
| Title | `Tokyo Air Quality Today (AQI 45) – Is It Safe Right Now? PM2.5 Guide` | `Tokyo Air Quality Today — Live AQI & Is It Safe to Go Outside?` |
| Description | `Live AQI in Tokyo is AQI 45 (Good). PM2.5: 12.3 µg/m³. Check PM2.5 levels...` | `Is it safe to go outside in Tokyo today? Check live AQI, PM2.5 levels, and real-time air quality updates. Updated hourly.` |
| OG/Twitter | 각각 다른 title/description | 메인과 동일 통일 |

**핵심 변경점:**
1. 동적 데이터 전부 제거 (`AQI ${aq.aqi}`, `PM2.5: ${aq.pm25}`, `${level}`)
2. 정적 CTR 최적화 패턴으로 교체 (Informational 패턴)
3. metaTitle/metaDescription 변수로 DRY 적용
4. OG/Twitter title/description = 메인과 동일

**변경 파일:**
- `src/app/air-quality/[slug]/page.tsx` — generateMetadata 수정
- `CHANGELOG.md` — 신규 생성

**건드리지 않은 것:** 콘텐츠 본문, URL, 내부 링크, 홈페이지, sitemap, layout, db, 다른 라우트, keywords 배열, revalidate 3600

**커밋:** `41528cb` feat: CTR optimize city page meta — remove dynamic AQI data, unify OG/Twitter

---

## 현재 방침

**7~14일 관찰. 건드리지 않음.**

이유: 메타 교체 효과 반영까지 최소 7일. 지금 수정하면 A/B 비교 불가.

---

## 효과 측정 타겟 12개 페이지

| 페이지 | 노출 | 순위 |
|--------|------|------|
| mexico-city-air-quality | 92 | 61.7 |
| seoul-air-quality | 84 | 46.7 |
| beijing-air-quality | 83 | 53.7 |
| shanghai-air-quality | 80 | 44.9 |
| tokyo-air-quality | 67 | 42.0 |
| sydney-air-quality | 57 | 51.8 |
| dubai-air-quality | 48 | 44.5 |
| melbourne-air-quality | 30 | 43.5 |
| ho-chi-minh-city-air-quality | 30 | 45.2 |
| cairo-air-quality | 29 | 24.4 |
| singapore-air-quality | 25 | 51.8 |
| vancouver-air-quality | 25 | 59.1 |

---

## 다음 세션 (Session 12) 할 일

**4/21~28 GSC 데이터 확인 후 분기:**

| 결과 | 다음 작업 |
|------|----------|
| CTR 상승 (1%+ 진입) | 상위 10위 진입용 2차 최적화 (고CTR 페이지 집중) |
| CTR 정체 | 메타 패턴 2차 수정 |
| CTR 하락 | 원인 분석 → 패턴 롤백 또는 재설계 |

**확인 항목:**
- 타겟 12개 페이지 CTR 변화 (0.28% → 목표 2%+)
- 순위 변화 (CTR 상승 → 순위도 따라옴)
- 노출 유지 여부

**해석 가이드:**
- CTR↑ + 노출↓ = 정상 (정확한 유저에게만 노출)
- CTR 그대로 + 노출↑ = 아직 테스트 중 (더 기다림)
- CTR↓ + 노출↑ = 실패 → 다음 단계 필요
