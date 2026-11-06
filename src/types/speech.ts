export type SpeechStatus = 'draft' | 'analyzed' | 'ready';

export type PacingSpeed = 'بطيء ومتزن' | 'معتدل طبيعي' | 'سريع وحيوي';

export interface DeliverySuggestion {
  id: string;
  type: 'emphasis' | 'pause' | 'tone' | 'speed';
  targetWord?: string;
  label: string;
  description: string;
  accepted: boolean;
}

export interface SpeechParagraph {
  id: string;
  originalText: string;
  annotatedText: string;
  tone: string;
  speedPacing: PacingSpeed;
  pacingNote: string;
  presenceTip: string;
  suggestions: DeliverySuggestion[];
}

export interface AnalysisPreferences {
  addDiacritics: boolean; // إضافة التشكيل العربي
  improveTone: boolean; // تحسين الإلقاء ونبرة الصوت
  highlightEmphasis: boolean; // تحديد الكلمات التي تحتاج إلى تأكيد
  suggestPauses: boolean; // اقتراح أماكن الوقفات والتنفس
}

export interface Speech {
  id: string;
  title: string;
  content: string;
  category: string;
  status: SpeechStatus;
  createdAt: string;
  lastEdited: string;
  estimatedMinutes: number;
  wordCount: number;
  paragraphs: SpeechParagraph[];
  preferences?: AnalysisPreferences;
  audience?: string;
  notes?: string;
  userId?: string;
}

export type PresentationTheme = 'navy' | 'light' | 'dark-contrast';

