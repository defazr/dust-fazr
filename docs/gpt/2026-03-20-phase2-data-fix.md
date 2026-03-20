# Phase 2: Data Cleanup & City Curation

**Date:** 2026-03-20
**Status:** Complete

## Problem
- 초기 seed가 측정소 이름(경인항, 관인면) 사용 → 도시가 아님
- slug가 이상함: `spartan---seoul-air-quality`
- 중국어/비영문 이름 깨짐

## Solution
- 큐레이션된 130개 세계 도시 리스트 생성 (20개국)
- 좌표 기반 nearest OpenAQ location 매칭 (haversine, 100km 이내)
- 23,908개 OpenAQ 위치 스캔 → 130/130 전부 매칭 성공

## 결과
- 도시 이름: Seoul, Tokyo, Beijing, New York 등
- slug: `seoul-air-quality`, `tokyo-air-quality` 등
- 42개 도시 실측 데이터 수집 완료

## Cities by Country
| Country | Count |
|---------|-------|
| South Korea | 15 |
| Japan | 8 |
| China | 10 |
| India | 10 |
| United States | 15 |
| UK | 8 |
| France | 7 |
| Germany | 7 |
| Australia | 6 |
| Southeast Asia | 7 |
| Americas | 10 |
| Europe | 18 |
| Middle East/Africa | 9 |
| **Total** | **130** |
