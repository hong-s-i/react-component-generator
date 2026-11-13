import { describe, expect, it } from 'vitest';
import { validatePrompt } from './validatePrompt';

describe('validatePrompt', () => {
  it.each([0, 1, 499, 500])('%i자는 길이 제한을 통과한다', (length) => {
    expect(validatePrompt('가'.repeat(length))).toBeNull();
  });

  it('500자를 초과하면 오류 메시지를 반환한다', () => {
    expect(validatePrompt('가'.repeat(501))).toBe('프롬프트는 500자 이하로 입력해주세요.');
  });

  it('이모지도 코드 포인트 하나를 한 글자로 계산한다', () => {
    expect(validatePrompt('😀'.repeat(500))).toBeNull();
    expect(validatePrompt('😀'.repeat(501))).not.toBeNull();
  });

  it('공백과 줄바꿈을 길이에 포함한다', () => {
    expect(validatePrompt('가'.repeat(499) + ' \n')).not.toBeNull();
  });
});
