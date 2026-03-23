# Session 6: 404 정리 & 색인 리스트 재구성 (2026-03-23)

## 작업 요약

### 1. 배포 검증 & 안정화 점검
- SC Coverage 데이터 3건 분석 (404, 발견-미색인, 크롤링-미색인)
- 프로덕션 사이트 전수 검증 (redirect, robots, ISR, 페이지 렌더)

### 2. 404 해소 — Redirect 적용
next.config.ts에 redirect 4개 추가:
- delhi-vs-mumbai → new-delhi-vs-mumbai
- beijing-vs-delhi → beijing-vs-new-delhi
- delhi-vs-beijing → new-delhi-vs-beijing
- shanghai-vs-hong-kong → shanghai-vs-beijing

### 3. robots.txt 수정
- Allow: /_next/static/ (기존 Disallow → 수정)
- Disallow: /api/
- baseUrl 교정: dust.fazr.com → dust.fazr.co.kr

### 4. 데이터 기반 색인 리스트 재구성
- 130개 도시 전수 조사 → 96개만 AQI 데이터 존재
- 34개 도시 데이터 없음 (OpenAQ 미수집)
- 비교 30개 중 19개만 양쪽 데이터 있음
- **최종 색인 대상: 121개** (허브 6 + 도시 96 + 비교 19)

## 데이터 없는 도시 34개
ahmedabad, bangalore, bristol, brussels, buenos-aires, chennai, chicago, copenhagen, denver, fukuoka, houston, hyderabad, jaipur, kobe, kolkata, lisbon, los-angeles, lucknow, madrid, mumbai, new-york, osaka, oslo, phoenix, pune, san-francisco, sapporo, seattle, stockholm, stuttgart, tel-aviv, vancouver, vienna, washington-dc

## 다음 단계
- SC 데이터 수집 후 CTR 최적화 진입
- CTR 낮은 페이지 Title/Description 수정
- 순위 10~20위 페이지 보강
