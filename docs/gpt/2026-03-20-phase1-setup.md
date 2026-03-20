# Phase 1: Project Setup & Data Validation

**Date:** 2026-03-20
**Status:** Complete

## What was done

### 1. OpenAQ API 검증
- OpenAQ v2 API → 410 Gone (deprecated)
- OpenAQ v3 API로 전환 (API key 필요)
- 한국(KR) country_id = 25 확인
- 오늘 기준 163개 한국 위치에서 실시간 데이터 확인
- 센서 매핑 방식 확인: location → sensors → parameter name

### 2. 초기 데이터 확인 결과
```
경인항     PM2.5: 24.0  PM10: 48.0 µg/m³
관인면     PM2.5: 38.0  PM10: 60.0 µg/m³
화북면     PM2.5: 20.0  PM10: 37.0 µg/m³
```

### 3. 프로젝트 생성
- Next.js 16 (App Router, TypeScript, Tailwind CSS)
- PostgreSQL 17 (brew install, user: dust, db: dustfazr)
- Python collector (OpenAQ v3 → DB)
- DB 스키마: cities, air_quality_latest, air_quality_history

## Key Decisions
- OpenAQ v3 API 사용 (v2 deprecated)
- AQI 계산: EPA PM2.5 breakpoint 기준
- dev 서버 포트 3001 (3000은 다른 프로젝트 사용 중)
