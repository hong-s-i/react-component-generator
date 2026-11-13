# Agent Instructions

## Operational Commands

저장소 루트에서 실행한다. 기존 `bun.lock`을 유지하고 의존성 변경에는 Bun을 사용한다.

- `bun run dev`: API와 Vite 동시 실행. 실행 안내는 [README.md](README.md)를 참고한다.
- `bun run build`: TypeScript 프로젝트 검사와 프로덕션 번들 생성.
- `bun run lint`: TypeScript와 React Hooks 린트.
- `bun run test`: Vite 설정을 사용하는 Vitest 전체 실행. `bun test`로 대체하지 않는다.
- `bun run test:watch`: Vitest 감시 모드.

명령 근거: `package.json:6`, 테스트 설정: `vite.config.ts:16`.

## Golden Rules

- 보안 경계: 서버 환경 키는 서버에만 둔다. `/api/config`는 키의 존재 여부만 반환해야 한다. 클라이언트 번들이나 응답에 실제 서버 키를 넣지 않는다. 근거: `server/index.ts:60`, `server/index.ts:151`, `.gitignore:32`.
- 실행 계약: 생성 결과는 import 없는 JavaScript/JSX이며 `render(...)` 호출을 포함해야 한다. 서버 프롬프트·응답 정규화·미리보기 계약을 함께 유지한다. 근거: `server/index.ts:11`, `server/index.ts:21`, `server/index.ts:197`, `src/components/LivePreview.tsx:14`.
- 통신 경계: UI 요청은 상대 `/api` 경로를 유지한다. API 포트 변경 시 Vite 프록시도 함께 수정한다. 근거: `src/hooks/useComponentGenerator.ts:29`, `server/index.ts:140`, `vite.config.ts:11`.
- 검증 범위: 빌드 성공을 서버 타입 검사 성공으로 보고하지 않는다. 현재 TypeScript 프로젝트 include는 `src`와 `vite.config.ts`이며 서버 라우트를 포함하지 않는다. 근거: `tsconfig.app.json:27`, `tsconfig.node.json:25`, `package.json:9`.

## TDD Rule

**이 규칙은 Rigid — 상황에 맞게 변형하지 마라.**

이 섹션은 **전역 기본값(fallback)**이다. 작업 대상의 하위 디렉토리 `AGENTS.md`에 별도 TDD 규칙이 있으면 **해당 규칙을 우선**한다.

### 적용 기준

- **반드시 적용:** 비즈니스 로직, API, 유틸리티, 버그 수정.
- **불필요:** 타입 정의, 설정 파일, 동작 로직 없는 순수 UI, SQL.
- 적용 대상과 제외 대상이 섞인 변경은 **동작 로직에 TDD를 적용**한다. 순수 UI 변경과 UI 동작 버그 수정을 구분한다.

### RED-GREEN-REFACTOR

1. **RED:** 다음에 구현할 **하나의 동작을 하나의 테스트**로 작성한다. 버그 수정은 재현 테스트부터 작성한다. **반드시 실행하여 실패를 확인**한다. 실패 이유는 **기능 미구현 또는 기대 동작의 부재**여야 한다. 문법 오류, 잘못된 테스트 설정, 환경 문제로 인한 실패는 RED로 인정하지 않는다.
2. **GREEN:** 테스트를 통과하는 **최소한의 프로덕션 코드만** 작성한다. **YAGNI**를 지키고 미래 요구사항이나 불필요한 추상화를 추가하지 않는다. **신규 테스트와 기존 테스트가 모두 통과**하는지 실행하여 확인한다.
3. **REFACTOR:** green 상태에서 중복 제거, 이름 개선, 헬퍼 추출을 수행한다. 변경 후 테스트를 실행해 **green을 유지**한다. **새 동작을 추가하지 않는다.**
4. **반복:** 다음 동작의 **RED로 돌아간다.** 여러 동작을 한 번에 구현하지 않는다.

### 삭제 강제 규칙

TDD 적용 대상에서 **테스트보다 프로덕션 코드를 먼저 작성했다면 해당 코드를 삭제하고 RED부터 재시작**한다. **주석, 별도 파일, 복사본 등으로 “참고용” 코드를 남기는 것도 금지**한다. 삭제 대상은 이번 작업에서 테스트 전에 작성한 코드이며, 기존 코드나 다른 사람의 변경은 삭제하지 않는다.

### 변명 차단표

| 변명 | 반론 |
| --- | --- |
| “너무 단순해서 테스트 불필요” | 단순함은 적용 제외 기준이 아니다. 적용 대상이면 작은 동작부터 테스트한다. |
| “나중에 추가하겠다” | 사후 테스트는 RED를 입증하지 못한다. 지금 테스트부터 작성한다. |
| “시간이 없다” | 구현 범위를 줄여 작은 사이클로 진행한다. 순서를 생략하지 않는다. |
| “삭제하면 낭비” | 테스트 전에 작성한 코드는 삭제한다. 이해한 요구사항으로 RED부터 다시 구현한다. |
| “프로토타입이다” | 프로토타입이라는 이름은 예외가 아니다. 적용 대상 동작에는 같은 규칙을 따른다. |

## Project Context

제품 목적과 기술 스택은 [README.md](README.md)를 기준으로 한다. 에이전트 작업의 기준은 생성된 코드가 실제 미리보기에서 실행되는 계약을 보존하는 것이다.

## Standards & References

- TypeScript strict와 type-only import 제약을 따른다: `tsconfig.app.json`. 린트 기준은 `eslint.config.js`를 따른다.
- 커밋은 논리적 단위로 나누고 `feat/fix/refactor/chore: 한국어 요약`을 사용한다. 커밋 요청 시 별도 승인 없이 진행하는 [.agents/skills/commit/SKILL.md](.agents/skills/commit/SKILL.md)를 따른다. 문서 수정 자체를 커밋 요청으로 해석하지 않는다.
- 요청에 별도 지정이 없으면 현재 체크아웃에서 작업하고, push나 기존 커밋 재작성은 커밋 요청에 포함하지 않는다.
- Maintenance Policy: 규칙과 코드가 달라지면 근거를 다시 확인하고 업데이트를 제안한다. 규칙 변경 시 파일·라인 참조와 같은 디렉토리의 `CLAUDE.md` 연결도 확인한다. 각 `AGENTS.md`는 500라인 미만으로 유지한다.

## Context Map

- **[프롬프트 입력·미리보기·UI 수정](src/AGENTS.md)** — 브라우저 상태와 생성 결과 표시 계약.
- **[AI 호출·응답 정규화·API 수정](server/AGENTS.md)** — Bun 실행 경계와 제공자별 처리.
