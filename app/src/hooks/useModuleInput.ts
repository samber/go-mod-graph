// Custom hook for managing module input with normalization

import { useState, useCallback, useMemo, useEffect } from 'react';

type UseModuleInputResult = {
  moduleInput: string;
  setModuleInput: (value: string) => void;
  normalizedInput: string;
  parseModuleInput: (input: string) => { path: string; release: string | null };
};

export function useModuleInput(initialValue = ''): UseModuleInputResult {
  const [moduleInput, setModuleInput] = useState(initialValue);

  const parseModuleInput = useCallback((input: string) => {
    const withoutProtocol = input.replace(/^https?:\/\//, '');
    const match = withoutProtocol.match(/^(.+?)(?:@(.+))?$/);
    if (match) {
      return { path: match[1].trim().toLowerCase(), release: match[2] || null };
    }
    return { path: withoutProtocol.trim().toLowerCase(), release: null };
  }, []);

  // Normalize module input in real-time (lowercase + remove protocol)
  const normalizedInput = useMemo(() => {
    if (!moduleInput) return moduleInput;
    const { path, release } = parseModuleInput(moduleInput);
    return release ? `${path}@${release}` : path;
  }, [moduleInput, parseModuleInput]);

  // Update input field with normalized value
  useEffect(() => {
    if (normalizedInput && normalizedInput !== moduleInput) {
      setModuleInput(normalizedInput);
    }
  }, [normalizedInput]);

  return {
    moduleInput,
    setModuleInput,
    normalizedInput,
    parseModuleInput,
  };
}
