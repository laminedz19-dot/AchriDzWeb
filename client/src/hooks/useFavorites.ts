/* AchriDZ design support: the favorite state is persistent, lightweight, and shared across the marketplace experience. */
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "achridz-favorite-listings";
const EVENT_NAME = "achridz-favorites-updated";

function readFavorites(): number[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.filter((value) => Number.isInteger(value)) : [];
  } catch {
    return [];
  }
}

function saveFavorites(next: number[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<number[]>(() => typeof window === "undefined" ? [] : readFavorites());

  useEffect(() => {
    const sync = () => setFavorites(readFavorites());
    window.addEventListener(EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVENT_NAME, sync); window.removeEventListener("storage", sync); };
  }, []);

  const toggleFavorite = useCallback((id: number) => {
    const current = readFavorites();
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    saveFavorites(next);
    return !current.includes(id);
  }, []);

  const removeFavorite = useCallback((id: number) => saveFavorites(readFavorites().filter((item) => item !== id)), []);
  const isFavorite = useCallback((id: number) => favorites.includes(id), [favorites]);
  const clearFavorites = useCallback(() => saveFavorites([]), []);

  return { favorites, toggleFavorite, removeFavorite, isFavorite, clearFavorites };
}
