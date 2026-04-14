## 2026-04-14 — CTR 최적화: 도시 페이지 메타 교체

### 변경 대상
- `/air-quality/[slug]` generateMetadata 함수
- OG, Twitter 메타 포함

### Before
- title: `${data.name} Air Quality Today (AQI ${aq.aqi}) – Is It Safe Right Now? PM2.5 Guide`
- description: `Live AQI in ${data.name} is AQI ${aq.aqi} (${level}). PM2.5: ${aq.pm25} µg/m³. Check PM2.5 levels...`

### After
- title: `${data.name} Air Quality Today — Live AQI & Is It Safe to Go Outside?`
- description: `Is it safe to go outside in ${data.name} today? Check live AQI, PM2.5 levels, and real-time air quality updates. Updated hourly.`
- OG/Twitter: 메인과 동일 적용

### 이유
- 노출 1,084 / 클릭 3 / CTR 0.28%
- 동적 데이터(AQI 숫자, PM2.5)가 메타에 있어서 ISR로 매시간 바뀜 → Google 안정성 깨짐
- 기존 "PM2.5 Guide"는 검색 의도 약함 → "Is It Safe to Go Outside?"로 클릭 유도 강화

### 측정
- 2주 후 GSC에서 타겟 12개 페이지 CTR 확인
- 목표: 0.28% → 2%+
- 순위 동일 유지 + CTR 상승 = 성공
