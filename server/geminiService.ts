import { GoogleGenAI, Type } from '@google/genai';
import { AnalysisPreferences, SpeechParagraph } from '../src/types/speech';

export class GeminiAnalysisError extends Error {
  statusCode: number;
  originalCode: string;

  constructor(message: string, statusCode = 500, originalCode = 'ANALYSIS_FAILED') {
    super(message);
    this.name = 'GeminiAnalysisError';
    this.statusCode = statusCode;
    this.originalCode = originalCode;
  }
}

// Server-side initialization of GoogleGenAI SDK with user-agent header
function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiAnalysisError(
      'مفتاح خدمة الذكاء الاصطناعي (GEMINI_API_KEY) غير مهيأ في الخادم.',
      500,
      'MISSING_API_KEY'
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface AnalysisRequestParams {
  title: string;
  content: string;
  preferences: AnalysisPreferences;
  audience?: string;
}

export async function analyzeSpeechWithGemini({
  title,
  content,
  preferences,
  audience,
}: AnalysisRequestParams): Promise<SpeechParagraph[]> {
  // Use gemini-3.1-flash-lite as primary high-performance model
  const primaryModel = 'gemini-3.1-flash-lite';
  const fallbackModel = 'gemini-flash-latest';

  const systemInstruction = `
أنت خبير بلاغي ومدرب محترف في فن الإلقاء والخطابة العربية لمنصة "خِطاب" (Khitab).
مهمتك تحليل نص الخطاب العربي بدقة، وتقسيمه إلى فقرات إلقائية متوازنة، وتقديم توصيات أداء صوتي وفقًا لخيارات المستخدم المحددة حصراً.

خيارات التحليل المعتمدة في هذا الطلب:
1. التشكيل العربي (addDiacritics): ${preferences.addDiacritics ? 'مفعل (قم بضبط أواخر الكلمات والتشكيل السليم لتيسير القراءة السليمة)' : 'معطل (حافظ على النص الأصلي دون إضافة تشكيل)'}
2. تحسين نبرة وإيقاع الإلقاء (improveTone): ${preferences.improveTone ? 'مفعل (اقترح النبرة البلاغية المناسبة للفقرة، وملاحظة الوتيرة، وتوصية الحضور ولغة الجسد)' : 'معطل (اجعل النبرة "نبرة طبيعية متوازنة" والوتيرة "معتدل طبيعي" واترك الملاحظات فارغة)'}
3. تحديد الكلمات المحورية للتأكيد الصوتي (highlightEmphasis): ${preferences.highlightEmphasis ? 'مفعل (حدد كلمة أو كلمتين محوريتين في كل فقرة، وقم بلفهما في annotatedText بوسم <mark class="emphasis-word">الكلمة</mark> مع إضافة مقترح نوع emphasis)' : 'معطل (لا تقم بتمييز أي كلمات ولا تضف مقترحات تأكيد)'}
4. اقتراح أماكن الوقفات والتنفس (suggestPauses): ${preferences.suggestPauses ? 'مفعل (أدرج علامات الوقفات الطبيعية والتأملية مثل [⏸ وقفة قصيرة] أو [⏸ وقفة استيعاب] في مواضع التنفس المناسبة في annotatedText مع إضافة مقترحات نوع pause)' : 'معطل (لا تقم بإدراج علامات وقفات ولا تضف مقترحات وقفات)'}

قواعد صارمة:
- قسم النص وفق تسلسل أفكاره إلى فقرات متكاملة ومريحة للقراءة.
- لا تحرف معاني النص العربي أو تحذف عبارات منه.
- التزم حصرًا بالخيارات المفعلة؛ لا تضف وقفات أو تأكيدات إذا كان الخيار غير مفعل.
`.trim();

  const userPrompt = `
عنوان الخطاب: "${title || 'خطاب عام'}"
${audience ? `الجمهور المستهدف: "${audience}"` : ''}

نص الخطاب للتحليل:
"""
${content}
"""
`.trim();

  const ai = getAiClient();
  const schemaConfig = {
    systemInstruction,
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.ARRAY,
      description: 'قائمة الفقرات المحللة للخطاب بالترتيب',
      items: {
        type: Type.OBJECT,
        properties: {
          originalText: {
            type: Type.STRING,
            description: 'نص الفقرة (مشكول إذا كان التشكيل مفعلًا، أو مجردًا إذا كان معطلًا)',
          },
          annotatedText: {
            type: Type.STRING,
            description: 'نص الفقرة منسقًا بشارات الوقفات [⏸ ...] ووسوم التأكيد <mark class="emphasis-word">...</mark> حسب الخيارات المفعلة',
          },
          tone: {
            type: Type.STRING,
            description: 'نبرة الإلقاء المقترحة باللغة العربية (مثل: نبرة رصينة ومرحبة، نبرة حماسية وحازمة) أو محايدة إذا كان الخيار معطلًا',
          },
          speedPacing: {
            type: Type.STRING,
            description: 'وتيرة السرعة: بطيء ومتزن أو معتدل طبيعي أو سريع وحيوي',
          },
          pacingNote: {
            type: Type.STRING,
            description: 'ملاحظة عملية حول وتيرة وسرعة الإلقاء، أو نص فارغ إذا كان الخيار معطلًا',
          },
          presenceTip: {
            type: Type.STRING,
            description: 'توصية حول لغة الجسد وتوزيع النظرات والحضور، أو نص فارغ إذا كان الخيار معطلًا',
          },
          suggestions: {
            type: Type.ARRAY,
            description: 'اقتراحات الأداء الصوتي والوقفات التابعة لهذه الفقرة',
            items: {
              type: Type.OBJECT,
              properties: {
                type: {
                  type: Type.STRING,
                  description: 'نوع التوصية: emphasis أو pause أو tone',
                },
                targetWord: {
                  type: Type.STRING,
                  description: 'الكلمة المعنية بالتأكيد الصوتي إن وجدت',
                },
                label: {
                  type: Type.STRING,
                  description: 'عنوان المقترح المختصر باللغة العربية',
                },
                description: {
                  type: Type.STRING,
                  description: 'توضيح الفائدة الإلقائية للمقترح باللغة العربية',
                },
              },
              required: ['type', 'label', 'description'],
            },
          },
        },
        required: [
          'originalText',
          'annotatedText',
          'tone',
          'speedPacing',
          'pacingNote',
          'presenceTip',
          'suggestions',
        ],
      },
    },
  };

  async function executeCall(model: string) {
    return await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: schemaConfig,
    });
  }

  let response: any = null;

  try {
    response = await executeCall(primaryModel);
  } catch (primaryErr: any) {
    const status = primaryErr?.status;
    const msg = String(primaryErr?.message || '');

    // If primary model hit 503 or 429, attempt fallback model once
    if (status === 503 || status === 429 || msg.includes('503') || msg.includes('UNAVAILABLE')) {
      console.warn(`[Gemini API] Primary model ${primaryModel} reported ${status || '503'}, trying fallback ${fallbackModel}...`);
      try {
        response = await executeCall(fallbackModel);
      } catch (fallbackErr: any) {
        console.error('[Gemini API] Fallback model also failed:', fallbackErr?.status || fallbackErr?.message);
        throw translateGeminiError(fallbackErr);
      }
    } else {
      throw translateGeminiError(primaryErr);
    }
  }

  if (!response || !response.text) {
    throw new GeminiAnalysisError(
      'لم يقدم نموذج الذكاء الاصطناعي أي استجابة قابلة للقراءة.',
      502,
      'EMPTY_AI_RESPONSE'
    );
  }

  const rawJson = response.text.trim();
  let parsedData: any[];

  try {
    parsedData = JSON.parse(rawJson);
  } catch {
    throw new GeminiAnalysisError(
      'أعاد نموذج الذكاء الاصطناعي استجابة غير متوافقة مع نسق البيانات المطلوب.',
      502,
      'INVALID_JSON'
    );
  }

  if (!Array.isArray(parsedData) || parsedData.length === 0) {
    throw new GeminiAnalysisError(
      'لم يقم النموذج بتوليد فقرات متوافقة مع هيكلية تحليل الخطاب.',
      502,
      'NO_PARAGRAPHS_RETURNED'
    );
  }

  // Format and enforce unique IDs and types
  const paragraphs: SpeechParagraph[] = parsedData.map((item: any, pIdx: number) => {
    const validPacing = ['بطيء ومتزن', 'معتدل طبيعي', 'سريع وحيوي'].includes(item.speedPacing)
      ? item.speedPacing
      : 'معتدل طبيعي';

    const suggestions = Array.isArray(item.suggestions)
      ? item.suggestions.map((sug: any, sIdx: number) => ({
          id: `ai-sug-${pIdx}-${sIdx}-${Date.now()}`,
          type: (['emphasis', 'pause', 'tone', 'speed'].includes(sug.type) ? sug.type : 'emphasis') as any,
          targetWord: sug.targetWord || '',
          label: sug.label || 'توصية إلقائية',
          description: sug.description || '',
          accepted: true,
        }))
      : [];

    return {
      id: `ai-para-${pIdx}-${Date.now()}`,
      originalText: item.originalText || '',
      annotatedText: item.annotatedText || item.originalText || '',
      tone: item.tone || 'نبرة متزنة',
      speedPacing: validPacing,
      pacingNote: item.pacingNote || '',
      presenceTip: item.presenceTip || '',
      suggestions,
    };
  });

  return paragraphs;
}

function translateGeminiError(err: any): GeminiAnalysisError {
  const status = Number(err?.status) || 0;
  const msg = String(err?.message || '');

  if (status === 503 || msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand')) {
    return new GeminiAnalysisError(
      'خدمة التحليل بالذكاء الاصطناعي تشهد ضغطًا مؤقتًا في الوقت الحالي. يرجى إعادة المحاولة بعد لحظات.',
      503,
      'SERVICE_UNAVAILABLE'
    );
  }

  if (status === 429 || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
    return new GeminiAnalysisError(
      'تم تجاوز حد الاستخدام المسموح لنموذج الذكاء الاصطناعي مؤقتًا. يرجى الانتظار دقيقة والمحاولة مجددًا.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  }

  if (status === 400 || msg.includes('INVALID_ARGUMENT')) {
    return new GeminiAnalysisError(
      'تعذر إتمام التحليل بسبب عدم توافق مدخلات النص. يرجى مراجعة نص الخطاب والمحاولة مرة أخرى.',
      400,
      'INVALID_ARGUMENT'
    );
  }

  if (status === 401 || status === 403 || msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_INVALID')) {
    return new GeminiAnalysisError(
      'تعذر التحقق من صلاحية مفتاح الذكاء الاصطناعي في الخادم. يرجى التواصل مع الدعم الفني.',
      500,
      'AUTH_ERROR'
    );
  }

  return new GeminiAnalysisError(
    'حدث خطأ أثناء معالجة تحليل الخطاب بواسطة نموذج الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.',
    500,
    'ANALYSIS_FAILED'
  );
}
