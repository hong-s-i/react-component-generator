import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

it('500자 초과 요청은 AI 호출 없이 HTTP 400을 반환한다', async () => {
  let handler!: (req: Request) => Promise<Response>;
  vi.stubGlobal('Bun', {
    serve: (options: { fetch: typeof handler; port: number }) => {
      handler = options.fetch;
      return { port: options.port };
    },
  });
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ content: [{ type: 'text', text: 'render(null);' }] }),
  });
  vi.stubGlobal('fetch', fetchMock);
  await import('./index');
  const response = await handler(new Request('http://localhost/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: '가'.repeat(501), apiKey: 'test-key' }),
  }));
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: '프롬프트는 500자 이하로 입력해주세요.' });
  expect(fetchMock).not.toHaveBeenCalled();
});
