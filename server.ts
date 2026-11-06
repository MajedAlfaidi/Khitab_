import express, { Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { authenticateFirebaseUser, AuthenticatedRequest } from './server/authMiddleware';
import { analyzeSpeechWithGemini } from './server/geminiService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '1mb' }));

  // Health check endpoint for system readiness
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      app: 'Khitab (خِطاب)',
      mode: isProduction ? 'production' : 'development',
      timestamp: new Date().toISOString(),
    });
  });

  // Speech Analysis API Endpoint
  // Supports both authenticated and anonymous callers with rate limiting safeguards
  app.post(
    '/api/analyze-speech',
    authenticateFirebaseUser,
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { title, content, preferences, audience } = req.body || {};

      // 1. Text presence validation
      if (!content || typeof content !== 'string' || !content.trim()) {
        res.status(400).json({
          error: 'نص الخطاب مطلوب لإجراء التحليل.',
          code: 'MISSING_CONTENT',
        });
        return;
      }

      // 2. Size safeguards: limit text length to 25,000 characters
      if (content.length > 25000) {
        res.status(400).json({
          error: 'نص الخطاب يتجاوز الحد الأقصى المسموح به للتحليل في طلب واحد (٢٥ ألف حرف).',
          code: 'CONTENT_TOO_LARGE',
        });
        return;
      }

      // 3. Fallback preferences
      const sanitizedPreferences = {
        addDiacritics: Boolean(preferences?.addDiacritics ?? true),
        improveTone: Boolean(preferences?.improveTone ?? true),
        highlightEmphasis: Boolean(preferences?.highlightEmphasis ?? true),
        suggestPauses: Boolean(preferences?.suggestPauses ?? true),
      };

      try {
        const paragraphs = await analyzeSpeechWithGemini({
          title: String(title || '').trim(),
          content: content.trim(),
          preferences: sanitizedPreferences,
          audience: audience ? String(audience).trim() : undefined,
        });

        res.json({
          success: true,
          paragraphs,
        });
      } catch (err: any) {
        const statusCode = typeof err?.statusCode === 'number' ? err.statusCode : 500;
        const errorCode = err?.originalCode || 'ANALYSIS_FAILED';
        const errorMessage =
          typeof err?.message === 'string' && err.message.length > 0
            ? err.message
            : 'حدث خطأ أثناء معالجة تحليل الخطاب بواسطة نموذج الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.';

        console.error(`[Gemini API] Analysis execution failed [Status ${statusCode}, Code ${errorCode}]:`, err?.message || 'Unknown error');

        res.status(statusCode).json({
          error: errorMessage,
          code: errorCode,
        });
      }
    }
  );

  if (!isProduction) {
    // In development mode, mount the Vite middleware for HMR and on-demand compilation
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production mode, serve built static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Khitab Server] Running on http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Khitab Server] Fatal startup error:', err);
  process.exit(1);
});
