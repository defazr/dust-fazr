# Vultr Docker 안전 배포 체크리스트

## 서버 구조 (2026-03-21 기준)
| 컨테이너 | 포트 | 용도 |
|----------|------|------|
| dustfazr_db | 5433 (외부) | DUST.FAZR PostgreSQL |
| apps_ng_db | 5432 (localhost) | 뉴스포그린 PostgreSQL |
| debt-workbench-db | 5432 (내부) | 부채 계산기 PostgreSQL |
| apps_ng_caddy | 80, 443 | 리버스 프록시 (Caddy) |
| apps_ng_web | 3000 (localhost) | 뉴스포그린 프론트 |
| vat_web | 3000 (내부) | VAT 계산기 |
| calc_fazr_web | 3000 (내부) | 계산기 |
| debt-workbench-web | 3000 (내부) | 부채 계산기 |

## 절대 금지
- `docker-compose down` (전체 죽음)
- Caddyfile 전체 덮어쓰기 (다른 사이트 죽음)
- `docker system prune -a` (모든 이미지/볼륨 삭제)
- 기존 컨테이너 이름 재사용 (web, app 등)
- 포트 5432 사용 (apps_ng_db 충돌)

## 안전 재시작
```bash
# DB만 재시작
docker restart dustfazr_db

# Collector만 재시작
pkill -f openaq_collector.py

# 상태 확인
docker ps
docker logs dustfazr_db --tail 50
tail -f /root/dust-fazr/collector.log
crontab -l | grep dust
```

## 장애 대응
```bash
# DB 죽었을 때
docker start dustfazr_db

# Collector 안 돌 때
crontab -l | grep dust
cd /root/dust-fazr/collector && python3 openaq_collector.py

# 프론트 문제
# → Vercel 대시보드에서 확인 (서버와 무관)
```

## 핵심 원칙
> "건드릴 때는 하나만 건드린다"
> "배포 = 수술" (조심해서 한 군데만)
