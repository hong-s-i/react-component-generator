# Server Instructions

## Module Context

Bun HTTP 핸들러가 AI 제공자를 호출하고 응답을 미리보기용 코드로 정규화한다. 정규화와 모델 폴백은 서버 시작 없이 테스트하는 순수 모듈로 분리되어 있다.

## Tech Stack & Constraints

Bun.serve, TypeScript, native fetch, Vitest. `index.ts`를 import하면 서버가 시작되므로 순수 함수 테스트의 진입점으로 사용하지 않는다.

## Implementation Patterns

- 제공자별 응답 형식은 해당 호출 함수에서 해석하고 공통 응답은 `{ code }`, 오류는 `{ error }`로 유지한다. 근거: `index.ts:199`, `index.ts:218`.
- 코드 정규화는 `ensureRenderCall(stripCodeFences(text))` 순서를 사용한다. 새 변환도 HTTP 부수효과와 분리하여 테스트한다. 근거: `index.ts:197`, `generator.ts:1`.

## Testing Strategy

- 루트에서 `bun run test -- server/generator.test.ts server/fallback.test.ts`를 실행한다.
- 정규화는 입력·출력 문자열로, 폴백은 가짜 attempt 함수와 호출 횟수로 검증한다. 근거: `generator.test.ts:4`, `fallback.test.ts:5`.
- `index.test.ts`는 Bun.serve와 외부 fetch를 대체하여 초과 입력의 HTTP 400 응답과 AI 호출 차단을 검증한다. 실제 제공자 응답이나 실행 중인 HTTP 서버는 검증하지 않는다. 라우트·인증 키 선택·오류 매핑 변경 시 fetch 대체 또는 로컬 HTTP 검증을 추가한다. 기존 단위 테스트 통과를 API 통합 검증으로 보고하지 않는다.

## Local Golden Rules

- 비대칭: 순차 모델 폴백은 현재 Google에만 적용된다. 제공자 통합 리팩터링에서 이를 제거하거나 Anthropic에도 같은 정책이 있다고 가정하지 않는다. 근거: `index.ts:6`, `index.ts:69`, `index.ts:135`.
- 비대칭: Google의 `MAX_TOKENS` 종료는 코드 성공으로 반환하지 않는다. 잘린 코드를 미리보기에 전달하지 않도록 예외 경로를 유지한다. 근거: `index.ts:124`.
- 폴백은 첫 성공에서 멈추고 모두 실패하면 마지막 오류를 던진다. 호출 순서와 빈 목록의 오류 동작을 보존한다. 근거: `fallback.ts:7`, `fallback.ts:12`, `fallback.ts:19`, `fallback.test.ts:5`.
- 이중 방어: 프롬프트에 render 호출을 요구해도 응답 후 render 보완을 제거하지 않는다. 이미 render 호출이 있는 코드는 중복 호출을 추가하지 않는다. 근거: `index.ts:13`, `generator.ts:16`.
- 키 선택은 직접 입력한 키가 서버 환경 키보다 우선한다. UI에 서버 키가 있다는 이유로 직접 입력을 무시하지 않는다. 근거: `index.ts:65`, `../src/App.tsx:119`.
- 제공자 오류의 503·429 응답 매핑을 유지한다. 폴백 변경 시 마지막 오류가 이 매핑까지 전달되는지 검증한다. 근거: `index.ts:203`, `index.ts:210`, `fallback.ts:19`.
