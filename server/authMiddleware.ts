import { Request, Response, NextFunction } from 'express';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, DecodedIdToken } from 'firebase-admin/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const adminAuth = getAuth();

export interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken;
}

// In-memory rate limiting map: userId -> timestamps array
const userRequestTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // max 10 analysis requests per minute per user
const MIN_INTERVAL_BETWEEN_REQUESTS_MS = 2000; // at least 2 seconds between submissions

/**
 * Middleware to verify Firebase ID token and apply rate-limiting safeguards.
 * Does NOT log any private user data or sensitive payloads.
 */
export async function authenticateFirebaseUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'المصادقة مطلوبة للوصول إلى خدمة تحليل الخطاب.',
      code: 'AUTH_REQUIRED',
    });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();

  if (!idToken) {
    res.status(401).json({
      error: 'رمز المصادقة غير موجود في الطلب.',
      code: 'INVALID_TOKEN',
    });
    return;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    req.user = decodedToken;

    // Rate Limiting Check
    const userId = decodedToken.uid;
    const now = Date.now();
    const timestamps = userRequestTimestamps.get(userId) || [];

    // Filter out timestamps outside the current window
    const recentTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

    // Check minimum interval
    if (recentTimestamps.length > 0) {
      const lastRequestTime = recentTimestamps[recentTimestamps.length - 1];
      if (now - lastRequestTime < MIN_INTERVAL_BETWEEN_REQUESTS_MS) {
        res.status(429).json({
          error: 'يرجى الانتظار بضع ثوانٍ قبل إرسال طلب تحليل آخر.',
          code: 'RATE_LIMIT_INTERVAL',
        });
        return;
      }
    }

    // Check volume limit
    if (recentTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
      res.status(429).json({
        error: 'لقد تجاوزت الحد المسموح به من طلبات التحليل في الدقيقة (الحد الأقصى ١٠ طلبات/دقيقة). يرجى الانتظار قليلًا.',
        code: 'RATE_LIMIT_EXCEEDED',
      });
      return;
    }

    recentTimestamps.push(now);
    userRequestTimestamps.set(userId, recentTimestamps);

    next();
  } catch (err: any) {
    // Return clean error without leaking internals
    res.status(401).json({
      error: 'انتهت صلاحية جلسة تسجيل الدخول أو الرمز غير صالح. يرجى إعادة تسجيل الدخول.',
      code: 'AUTH_FAILED',
    });
  }
}
