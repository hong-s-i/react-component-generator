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

it('생성 결과와 날짜를 리마운트 후 복원한다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'render(<div>Hello</div>)' }) }));
  const first = renderHook(() => useComponentGenerator());
  await act(() => first.result.current.generate('프로필 카드', undefined, 'google'));
  const saved = first.result.current.components;
  first.unmount();
  const restored = renderHook(() => useComponentGenerator());
  expect(restored.result.current.components).toEqual(saved);
  expect(restored.result.current.components[0].createdAt).toBeInstanceOf(Date);
});


it('요청한 프롬프트를 실패해도 히스토리에 남기고 리마운트 후 복원한다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
  const first = renderHook(() => useComponentGenerator());
  await act(() => first.result.current.generate('프로필 카드', undefined, 'google'));
  first.unmount();
  const restored = renderHook(() => useComponentGenerator());
  expect(restored.result.current.promptHistory).toEqual(['프로필 카드']);
  expect(restored.result.current.components).toEqual([]);
});

it('개별 삭제와 전체 삭제가 복원한 목록에도 반영되고 히스토리는 유지된다', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'render(<div />)' }) }));
  const first = renderHook(() => useComponentGenerator());
  await act(() => first.result.current.generate('첫 카드', undefined, 'google'));
  await act(() => first.result.current.generate('둘째 카드', undefined, 'google'));
  act(() => first.result.current.removeComponent(first.result.current.components[0].id));
  first.unmount();
  const second = renderHook(() => useComponentGenerator());
  expect(second.result.current.components.map((entry) => entry.prompt)).toEqual(['첫 카드']);
  act(() => second.result.current.clearAll());
  second.unmount();
  const third = renderHook(() => useComponentGenerator());
  expect(third.result.current.components).toEqual([]);
  expect(third.result.current.promptHistory).toEqual(['둘째 카드', '첫 카드']);
});

it('손상된 저장 데이터는 빈 상태로 복원한다', () => {
  window.localStorage.setItem('component-studio.components', '{broken');
  window.localStorage.setItem('component-studio.prompt-history', '{}');
  const { result } = renderHook(() => useComponentGenerator());
  expect(result.current.components).toEqual([]);
  expect(result.current.promptHistory).toEqual([]);
});

it('저장소 접근이 차단되어도 생성 결과를 현재 세션에 유지한다', async () => {
  vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
  vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => { throw new Error('quota'); });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ code: 'render(<div />)' }) }));
  const { result } = renderHook(() => useComponentGenerator());
  await act(() => result.current.generate('프로필 카드', undefined, 'google'));
  expect(result.current.components).toHaveLength(1);
  expect(result.current.promptHistory).toEqual(['프로필 카드']);
  expect(result.current.error).toBeNull();
});
