# AdSense 레이아웃 규칙 (SSOT)

**Created:** 2026-03-21

## 금지 사항
- html에 h-full / height:100% 사용 금지
- body에 flex 사용 금지 (vignette와 충돌)
- CSS에서 100vw 사용 금지 (100% 사용)
- data-full-width-responsive="true" 사용 금지
- text-align: center로 광고 정렬 시도 금지
- CSS !important로 body style 강제 금지

## 필수 사항
- viewport: maximum-scale=1, user-scalable=no
- html, body: overflow-x: hidden
- *, *::before, *::after: box-sizing: border-box
- 광고 wrapper: flex justify-center + max-w 제한
- VignetteGuard: body style 리셋 (focus/pageshow/MutationObserver)
- AdSlot: data-full-width-responsive="false"

## 광고 크기 기준
| 디바이스 | max-width |
|----------|-----------|
| 모바일 | 336px |
| 태블릿 | 468px |
| 데스크톱 | 728px |

## 근본 원인 요약

### Vignette (전면 광고)
- AdSense vignette가 body에 position:fixed, top:-XXpx 삽입
- 닫힌 후 복구 안 함 → 레이아웃 틀어짐
- 해결: VignetteGuard (focus/pageshow/MutationObserver)

### Viewport
- maximum-scale 없으면 iOS Safari auto-zoom 허용
- vignette 후 zoom 상태 고정됨
- 해결: layout.tsx viewport export

### CSS 충돌
- h-full + vignette position:fixed = 충돌
- flex flex-col + vignette body 변경 = 깨짐
- 100vw = iOS에서 스크롤바 포함 → 화면보다 넓어짐
- 해결: h-full/flex 제거, 100vw→100%, overflow-x:hidden

### 광고 정렬
- full-width-responsive="true" → width:100% 강제
- flex justify-center 해도 자식이 100%라 왼쪽처럼 보임
- 해결: full-width-responsive="false" + max-w wrapper

## 핵심 원리
> "AdSense는 body를 건드린다. 우리는 건드린 후 복구한다."
> "광고 정렬 = 크기 제어. 위치 제어가 아니다."
