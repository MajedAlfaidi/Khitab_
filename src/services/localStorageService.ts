import { Speech } from '../types/speech';
import { INITIAL_SPEECHES } from '../data/mockSpeeches';

export const LOCAL_SPEECHES_KEY = 'khitab_local_speeches';

/**
 * Retrieves all locally saved speeches from browser storage.
 * If no local speeches exist yet, initializes with sample speeches.
 */
export function getLocalSpeeches(): Speech[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(LOCAL_SPEECHES_KEY);
    if (!raw) {
      // First-time anonymous visitor: initialize with sample speeches
      const initialWithFlag = INITIAL_SPEECHES.map((s) => ({
        ...s,
        userId: undefined,
      }));
      localStorage.setItem(LOCAL_SPEECHES_KEY, JSON.stringify(initialWithFlag));
      return initialWithFlag;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.error('[LocalStorageService] Failed to parse local speeches:', err);
  }

  return INITIAL_SPEECHES;
}

/**
 * Saves or updates a speech in local storage.
 * Unauthenticated users' drafts and analyses are stored here.
 */
export function saveLocalSpeech(speech: Speech): Speech {
  const speeches = getLocalSpeeches();
  const existingIdx = speeches.findIndex((s) => s.id === speech.id);

  const updatedSpeech: Speech = {
    ...speech,
    userId: undefined, // Anonymous local speeches have no userId
    lastEdited: 'الآن',
  };

  if (existingIdx >= 0) {
    speeches[existingIdx] = updatedSpeech;
  } else {
    speeches.unshift(updatedSpeech);
  }

  try {
    localStorage.setItem(LOCAL_SPEECHES_KEY, JSON.stringify(speeches));
  } catch (err) {
    console.error('[LocalStorageService] Failed to persist local speech:', err);
  }

  return updatedSpeech;
}

/**
 * Deletes a speech from local storage.
 */
export function deleteLocalSpeech(speechId: string): void {
  const speeches = getLocalSpeeches().filter((s) => s.id !== speechId);
  try {
    localStorage.setItem(LOCAL_SPEECHES_KEY, JSON.stringify(speeches));
  } catch (err) {
    console.error('[LocalStorageService] Failed to delete local speech:', err);
  }
}

/**
 * Checks whether any speeches exist in local storage.
 */
export function hasLocalSpeeches(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(LOCAL_SPEECHES_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

/**
 * Clears local speeches from browser storage once migration to Firestore is verified.
 */
export function clearLocalSpeeches(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOCAL_SPEECHES_KEY);
  } catch (err) {
    console.error('[LocalStorageService] Failed to clear local speeches:', err);
  }
}
