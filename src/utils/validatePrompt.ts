export const MAX_PROMPT_LENGTH = 500;

/** 공백을 포함하고 유니코드 코드 포인트를 한 글자로 계산한다. */
export function validatePrompt(prompt: string): string | null {
  if (Array.from(prompt).length > MAX_PROMPT_LENGTH) {
    return `프롬프트는 ${MAX_PROMPT_LENGTH}자 이하로 입력해주세요.`;
  }
  return null;
}
