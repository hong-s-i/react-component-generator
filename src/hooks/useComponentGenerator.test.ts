import { renderHook, act } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useComponentGenerator } from './useComponentGenerator';

afterEach(() => vi.unstubAllGlobals());

it('500자 초과 프롬프트는 요청하지 않고 오류를 표시한다', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: '' }) });
  vi.stubGlobal('fetch', fetchMock);
  const { result } = renderHook(() => useComponentGenerator());
  await act(() => result.current.generate('가'.repeat(501), undefined, 'google'));
  expect(fetchMock).not.toHaveBeenCalled();
  expect(result.current.error).toBe('프롬프트는 500자 이하로 입력해주세요.');
  expect(result.current.isLoading).toBe(false);
  expect(result.current.components).toEqual([]);
});
