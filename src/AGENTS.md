# Frontend Instructions

## Module Context

프롬프트와 연결 설정을 받아 생성 API를 호출하고 결과를 표시한다. API 결과를 브라우저에서 실행하므로 생성 코드와 앱 상태의 경계를 유지한다.

## Tech Stack & Constraints

React 19, TypeScript, react-live 4, Testing Library, Vitest. UI의 타입 정의와 생성되는 JavaScript 코드는 서로 다른 실행 대상이다.

## Implementation Patterns

- 생성 요청과 결과 목록 상태는 `hooks/useComponentGenerator.ts`에서 관리하고 화면 구성은 컴포넌트에 둔다.
- 외부 요청 테스트는 `fetch`를 대체하여 성공·실패 응답을 재현한다. UI 확인을 위해 실제 유료 AI 요청을 실행할 필요는 없다.

## Testing Strategy

- 루트에서 `bun run test -- src/components/PromptInput.test.tsx`로 입력 동작을 확인한다.
- 기존 테스트는 역할 기반 조회와 `userEvent`로 비활성 상태·입력·제출을 검증한다: `components/PromptInput.test.tsx:6`.
- 테스트 DOM 정리는 공통 설정에 있다. 개별 테스트에서 중복 구현하지 않는다: `test/setup.ts:6`.
- 훅 테스트는 초과 입력의 요청 차단을 검증하지만 실제 네트워크 처리나 react-live 실행까지 보장하지 않는다. 해당 경로 변경 시 관련 동작을 별도로 검증하고 검증 범위를 보고한다.

## Local Golden Rules

- 이중 방어: 생성 버튼의 disabled 처리와 제출 핸들러의 공백·로딩 검사를 모두 유지한다. 단축키도 같은 핸들러를 사용한다. 근거: `components/PromptInput.tsx:20`, `components/PromptInput.tsx:45`, `components/PromptInput.tsx:54`.
- 제공자 전환 시 직접 입력한 키를 지우는 동작을 유지한다. 이전 제공자의 키를 다음 요청에 재사용하지 않는다. 근거: `App.tsx:41`.
- 제공자를 요청에 명시한다. UI 기본값은 Google이지만 서버의 생략 시 기본값은 Anthropic이므로 생략을 같은 동작으로 취급하지 않는다. 근거: `App.tsx:16`, `hooks/useComponentGenerator.ts:32`, `../server/index.ts:162`.
- 미리보기 새로고침은 생성 API 재호출이 아니라 React key 변경을 통한 리마운트다. 재생성과 구분한다. 근거: `components/ComponentCard.tsx:17`, `components/ComponentCard.tsx:33`, `components/ComponentCard.tsx:41`, `components/ComponentCard.tsx:70`.
- API 실패 시 결과 카드를 추가하지 않고 오류를 표시하며 로딩은 finally에서 해제한다. 근거: `hooks/useComponentGenerator.ts:37`, `hooks/useComponentGenerator.ts:48`, `hooks/useComponentGenerator.ts:52`.
- 생성 결과는 현재 페이지의 react-live에서 실행되며 격리된 iframe이 아니다. 이를 보안 샌드박스로 설명하거나 실행 scope에 API 키를 제공하지 않는다. 근거: `components/LivePreview.tsx:14`, `App.tsx:14`.
