/**
 * React hook for using Supabase-persisted data
 * Works like useState but automatically saves to/loads from Supabase
 *
 * NOTE: Always renders immediately with initialValue, then updates if server data is available
 */

import { useState, useEffect } from 'react';
import { getData, setData } from '../utils/supabaseStorage';

export function useSupabaseData<T>(key: string, initialValue: T) {
  const [data, setDataState] = useState<T>(() => {
    try {
      const local = localStorage.getItem(key);
      if (local !== null) {
        return JSON.parse(local) as T;
      }
    } catch (e) {
      console.warn(`[useSupabaseData] Failed to parse local state for ${key}:`, e);
    }
    return initialValue;
  });
  const [loading] = useState(false); // ALWAYS false - we render immediately with defaults
  const [error, setError] = useState<string | null>(null);

  // Try to load from server in background, but don't block rendering
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const stored = await getData(key);

        if (mounted && stored !== null && stored !== undefined) {
          console.log(`[useSupabaseData] Loaded ${key} from server`);
          setDataState(stored);
          try {
            localStorage.setItem(key, typeof stored === 'string' ? stored : JSON.stringify(stored));
          } catch (e) {
            console.warn(`[useSupabaseData] Failed to sync ${key} to localStorage:`, e);
          }
        }
      } catch (err) {
        console.warn(`[useSupabaseData] Could not load ${key}:`, err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [key]);

  // Custom setter that saves to Supabase (fire and forget)
  const setDataAndSave = (value: T | ((prev: T) => T)) => {
    const newValue = typeof value === 'function'
      ? (value as (prev: T) => T)(data)
      : value;

    setDataState(newValue);

    // Save to localStorage immediately
    try {
      localStorage.setItem(key, typeof newValue === 'string' ? newValue : JSON.stringify(newValue));
    } catch (e) {
      console.warn(`[useSupabaseData] Failed to save ${key} to localStorage:`, e);
    }

    // Save to server in background (don't block UI)
    setData(key, newValue).catch(err =>
      console.warn(`[useSupabaseData] Failed to save ${key}:`, err)
    );
  };

  return { data, setData: setDataAndSave, loading, error };
}
