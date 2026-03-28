# Session 8: WAQI 전환 + 데이터 파이프라인 복구 (2026-03-28)

## 작업 요약

### 1. 문제 진단 — OpenAQ API 키 무효화

- 증상: 2026-03-21 이후 7일째 데이터 업데이트 중단
- 원인: config.py에 하드코딩된 API 키가 GitHub 노출 → 자동 revoke
- Collector 로그: Success 0, Errors 0 (API 401 Unauthorized)

### 2. OpenAQ 키 하드코딩 제거

**collector/config.py:**
```python
# Before
OPENAQ_API_KEY = os.environ.get("OPENAQ_API_KEY", "fcd4345cf...")

# After
OPENAQ_API_KEY = os.environ.get("OPENAQ_API_KEY")
```

**openaq_collector.py:**
```python
def collect():
    if not OPENAQ_API_KEY:
        print("ERROR: OPENAQ_API_KEY not set — skipping collection")
        return
```

### 3. 데이터 지연 경고 UI 추가

**CityHero.tsx:**
- `updated_at`이 6시간 이상 오래되면 amber 색상 경고 메시지 표시
- "Data may be delayed due to temporary API issues"

### 4. WAQI API 커버리지 테스트

130개 도시 전수 테스트 결과:

| 항목 | OpenAQ | WAQI |
|------|--------|------|
| API 성공 | ~96/130 | **130/130** |
| PM2.5 있음 | 96 (73.8%) | **119 (91.5%)** |
| PM10 있음 | ~90 | **110 (84.6%)** |
| AQI 있음 | ~96 | **129 (99.2%)** |

OpenAQ에서 데이터 없던 34개 도시 중 **31개 복구!**

### 5. WAQI Collector 구현

**신규 파일:**
- `collector/waqi_collector.py` — geo 기반 WAQI API 호출, DB 저장
- `collector/collect.py` — API_PROVIDER 스위치 엔트리포인트

**수정 파일:**
- `collector/config.py` — API_PROVIDER, WAQI_TOKEN 추가

**config.py 구조:**
```python
API_PROVIDER = os.environ.get("API_PROVIDER", "waqi")  # 기본값 waqi
WAQI_TOKEN = os.environ.get("WAQI_TOKEN")
OPENAQ_API_KEY = os.environ.get("OPENAQ_API_KEY")      # fallback 유지
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://dust@localhost:5432/dustfazr")
```

### 6. UI 출처 변경

모든 페이지에서 "OpenAQ" → "WAQI" 변경:
- CityHero, 도시 페이지, 비교 페이지, 랭킹, 국가, 키워드 페이지 등
- src 내 "OpenAQ" 잔존: **0건**

### 7. 서버(Vultr) 적용

- SSH 접속으로 직접 적용
- 파일 업로드: config.py, waqi_collector.py, collect.py
- 서버 config.py DB 접속 수정: localhost:5432 → localhost:5433 (dustfazr_db 포트)
- WAQI_TOKEN 환경변수 설정
- 수동 실행: **Success 129, Errors 0**
- DB 반영 확인: updated_at = 2026-03-28 06:28 (7일만에 복구)
- crontab 변경: `openaq_collector.py` → `collect.py`

**crontab (변경 후):**
```
0 * * * * cd /root/dust-fazr/collector && WAQI_TOKEN=xxx python3 collect.py >> /root/dust-fazr/collector.log 2>&1
```

---

## 커밋 이력

| 커밋 | 내용 |
|------|------|
| 7d1ca8f | fix: remove hardcoded API key + add data delay warning |
| 6121d54 | feat: add WAQI collector + switch data source from OpenAQ to WAQI |

---

## 현재 상태 (Last: 2026-03-28)

| 항목 | 상태 |
|------|------|
| 데이터 파이프라인 | ✅ WAQI 전환 완료, 매시간 수집 |
| 커버리지 | ✅ 129/130 도시 (OpenAQ 대비 +33) |
| API 키 보안 | ✅ 하드코딩 제거, env var only |
| UI 출처 표시 | ✅ "Data from WAQI" |
| 데이터 지연 경고 | ✅ 6시간 기준 자동 표시/숨김 |
| OpenAQ fallback | ✅ 유지 (openaq_collector.py 보존) |
| OG 메타 | ✅ 전항목 PASS |
| Scroll 버그 | ✅ 수정 완료 |
| 기술 문제 전체 | ✅ 해결 완료 |

---

## SC Performance 분석 (첫 번째 데이터)

- 기간: 2026-03-20 ~ 03-26 (7일)
- 총 클릭 3, 노출 170, CTR 1.76%
- 한국에서만 클릭 발생 (3건)
- 허브 페이지 4개 순위 4~8위인데 클릭 0 → Title 문제

### CTR 최적화 1차 — 4개 허브 페이지 Title/Description 수정

| 페이지 | Before Title | After Title |
|--------|-------------|-------------|
| /air-quality-today | Air Quality Today (Live AQI Worldwide) – Is the Air Safe Right Now? | Air Quality Today (Real-Time AQI & PM2.5 Worldwide) |
| /top-most-polluted-cities | Most Polluted Cities Right Now (Live AQI Ranking) – Should You Stay Indoors? | Most Polluted Cities in the World (Live AQI Ranking) |
| /best-air-quality-cities | Cleanest Cities Right Now (Best Air Quality) – Where Is the Air Safest? | Cities with the Best Air Quality (Live AQI Ranking) |
| /air-quality-by-country | Air Quality by Country (Live AQI Rankings) | Air Quality by Country (Live AQI Map & Rankings) |

커밋: 8ed139f

---

## 다음 단계

1. ✅ ~~SC 데이터 수집 → CTR 최적화 진입~~ (완료)
2. 2~3일 후 SC 재확인 → CTR 변화 모니터링
3. 도시 페이지 순위 개선 (도쿄/시드니/상하이 30~50위 → 콘텐츠 보강)
4. 색인 리스트 v3 재구성 (WAQI 커버리지 기준)
5. 비교 페이지 데이터 재평가

**핵심:** API 장애를 업그레이드 기회로 전환 완료. CTR 최적화 시작.
