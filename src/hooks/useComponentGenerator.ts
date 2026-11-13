import { useState, useCallback } from 'react';
import type { GeneratedComponent, Provider } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { validatePrompt } from '../utils/validatePrompt';

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  promptHistory: string[];
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useLocalStorage<GeneratedComponent[]>('component-studio.components', [], (value) => {
    if (!Array.isArray(value)) return [];
    return value.flatMap((item: unknown) => {
      if (!item || typeof item !== 'object') return [];
      const entry = item as Record<string, unknown>;
      if (typeof entry.id !== 'string' || typeof entry.prompt !== 'string' ||
          typeof entry.code !== 'string' || typeof entry.createdAt !== 'string') return [];
      const createdAt = new Date(entry.createdAt);
      return Number.isNaN(createdAt.getTime()) ? [] : [{
        id: entry.id, prompt: entry.prompt, code: entry.code, createdAt,
      }];
    });
  });
  const [promptHistory, setPromptHistory] = useLocalStorage<string[]>('component-studio.prompt-history', [],
    (value) => Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    const validationError = validatePrompt(prompt);
    if (validationError) {
      setError(validationError);
      return;
    }
    setPromptHistory((previous) => [prompt, ...previous]);
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate component');
      }

      const newComponent: GeneratedComponent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        prompt,
        code: data.code,
        createdAt: new Date(),
      };

      setComponents((prev) => [newComponent, ...prev]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [setComponents, setPromptHistory]);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, [setComponents]);

  const clearAll = useCallback(() => {
    setComponents([]);
  }, [setComponents]);

  return { components, promptHistory, isLoading, error, generate, removeComponent, clearAll };
}
