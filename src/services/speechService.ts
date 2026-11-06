import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Speech } from '../types/speech';

/**
 * Sanitizes speech object for Firestore storage by removing undefined fields
 * and ensuring client-provided data conforms to ownership rules.
 */
function sanitizeSpeechPayload(speech: Speech, authenticatedUid: string): Record<string, any> {
  return {
    id: speech.id,
    userId: authenticatedUid,
    title: speech.title.trim() || 'خطاب بدون عنوان',
    content: speech.content || '',
    category: speech.category || 'عام',
    status: speech.status || 'draft',
    createdAt: speech.createdAt || new Date().toLocaleDateString('ar-SA'),
    lastEdited: 'الآن',
    estimatedMinutes: Number(speech.estimatedMinutes) || 1,
    wordCount: Number(speech.wordCount) || 0,
    paragraphs: (speech.paragraphs || []).map((p, idx) => ({
      id: p.id || `p-${idx}`,
      originalText: p.originalText || '',
      annotatedText: p.annotatedText || p.originalText || '',
      tone: p.tone || 'نبرة متزنة',
      speedPacing: p.speedPacing || 'معتدل طبيعي',
      pacingNote: p.pacingNote || '',
      presenceTip: p.presenceTip || '',
      suggestions: (p.suggestions || []).map((s, sIdx) => ({
        id: s.id || `s-${idx}-${sIdx}`,
        type: s.type || 'emphasis',
        targetWord: s.targetWord || '',
        label: s.label || '',
        description: s.description || '',
        accepted: Boolean(s.accepted),
      })),
    })),
    preferences: {
      addDiacritics: speech.preferences?.addDiacritics ?? true,
      improveTone: speech.preferences?.improveTone ?? true,
      highlightEmphasis: speech.preferences?.highlightEmphasis ?? true,
      suggestPauses: speech.preferences?.suggestPauses ?? true,
    },
    audience: speech.audience || '',
    notes: speech.notes || '',
  };
}

/**
 * Subscribes in real-time to the authenticated user's speeches in Firestore.
 * Strictly verifies that the userId matches the active Firebase Auth user.
 */
export function subscribeToUserSpeeches(
  userId: string,
  onUpdate: (speeches: Speech[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser || currentAuthUser.uid !== userId) {
    const errorMsg = 'Unauthorized: active session UID does not match requested speech storage path.';
    console.error('[SpeechService]', errorMsg);
    onError?.(new Error(errorMsg));
    return () => {};
  }

  const speechesPath = `users/${userId}/speeches`;
  const speechesCollection = collection(db, 'users', userId, 'speeches');

  return onSnapshot(
    speechesCollection,
    (snapshot) => {
      const speeches: Speech[] = snapshot.docs.map((d) => d.data() as Speech);
      onUpdate(speeches);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, speechesPath);
      onError?.(error);
    }
  );
}

/**
 * Saves or updates a speech in Firestore under users/{userId}/speeches/{speechId}.
 * Verifies authenticated ownership before execution.
 */
export async function saveSpeechToFirestore(speech: Speech): Promise<void> {
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser) {
    throw new Error('يرجى تسجيل الدخول بحساب Google أولاً لحفظ الخطاب في السحابة.');
  }

  const userId = currentAuthUser.uid;
  const speechPath = `users/${userId}/speeches/${speech.id}`;
  const speechDocRef = doc(db, 'users', userId, 'speeches', speech.id);
  const payload = sanitizeSpeechPayload(speech, userId);

  try {
    await setDoc(speechDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, speechPath);
  }
}

/**
 * Deletes a speech document from Firestore.
 */
export async function deleteSpeechFromFirestore(speechId: string): Promise<void> {
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser) {
    throw new Error('يرجى تسجيل الدخول لحذف الخطاب.');
  }

  const userId = currentAuthUser.uid;
  const speechPath = `users/${userId}/speeches/${speechId}`;
  const speechDocRef = doc(db, 'users', userId, 'speeches', speechId);

  try {
    await deleteDoc(speechDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, speechPath);
  }
}
