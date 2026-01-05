// Custom hook for localStorage persistence with type safety

import { useState, useEffect } from 'react';

export type useLocalStorageProps<T> = {
  key: string;
  defaultValue: T;
};

export function useLocalStorage<T>({ key, defaultValue }: useLocalStorageProps<T>) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    if (stored !== null) {
      try {
        return JSON.parse(stored) as T;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Specialized version for boolean values (stored as strings for compatibility)
export function useLocalStorageBoolean({ key, defaultValue }: useLocalStorageProps<boolean>) {
  const [value, setValue] = useState<boolean>(() => {
    const stored = localStorage.getItem(key);
    return stored === 'true' || (stored === null && defaultValue);
  });

  useEffect(() => {
    localStorage.setItem(key, String(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Specialized version for string values
export function useLocalStorageString({ key, defaultValue }: useLocalStorageProps<string>) {
  const [value, setValue] = useState<string>(() => {
    return localStorage.getItem(key) || defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
