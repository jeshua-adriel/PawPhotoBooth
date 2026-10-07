import { useState, useCallback } from 'react'

/**
 Same shape as React.useState, but persists to localStorage under `key`.
 Reads once on mount; every update is written straight back to storage.
 **/
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) return initialValue
      const parsed = JSON.parse(raw)
      // Merge with defaults only for plain-object state (e.g. settings),
      // so array state (e.g. the gallery) is used as-is.
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && !Array.isArray(initialValue)) {
        return { ...initialValue, ...parsed }
      }
      return parsed
    } catch {
      return initialValue
    }
  })

  const update = useCallback((next) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next
      try {
        localStorage.setItem(key, JSON.stringify(resolved))
      } catch {
        // storage full or unavailable — keep going in-memory
      }
      return resolved
    })
  }, [key])

  return [value, update]
}
