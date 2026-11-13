import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, fallback: T, decode: (value: unknown) => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored === null ? fallback : decode(JSON.parse(stored));
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // 저장소 접근 제한이나 용량 초과 시 현재 세션의 상태는 유지한다.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
