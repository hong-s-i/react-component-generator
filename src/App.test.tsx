import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ envKeys: { google: false, anthropic: false } }) }));
});
afterEach(() => vi.unstubAllGlobals());

it('제공자와 직접 입력한 API 키를 리마운트 후 복원하고 제공자 전환 시 키를 지운다', async () => {
  const user = userEvent.setup();
  const first = render(<App />);
  await user.selectOptions(screen.getByLabelText('AI 제공자'), 'anthropic');
  await user.type(screen.getByLabelText('API 키'), 'test-key');
  first.unmount();
  const second = render(<App />);
  expect(screen.getByLabelText('AI 제공자')).toHaveValue('anthropic');
  expect(screen.getByLabelText('API 키')).toHaveValue('test-key');
  await user.selectOptions(screen.getByLabelText('AI 제공자'), 'google');
  expect(screen.getByLabelText('API 키')).toHaveValue('');
  second.unmount();
  render(<App />);
  expect(screen.getByLabelText('AI 제공자')).toHaveValue('google');
  expect(screen.getByLabelText('API 키')).toHaveValue('');
});
