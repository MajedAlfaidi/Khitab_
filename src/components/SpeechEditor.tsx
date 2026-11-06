import React, { useState } from 'react';
import { Speech, AnalysisPreferences } from '../types/speech';
import { SPEECH_TEMPLATES, DEFAULT_ANALYSIS_PREFERENCES } from '../data/mockSpeeches';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sparkles, 
  Save, 
  FileText, 
  Clock, 
  ArrowRight, 
  BookMarked, 
  Check, 
  AlertCircle,
  Sliders,
  Type,
  Volume2,
  Highlighter,
  PauseCircle,
  Loader2
} from 'lucide-react';

interface SpeechEditorProps {
  initialSpeech?: Speech | null;
  onSave: (speech: Speech) => void;
  onProceedToAnalysis: (speech: Speech) => void;
  onCancel: () => void;
}

export const SpeechEditor: React.FC<SpeechEditorProps> = ({
  initialSpeech,
  onSave,
  onProceedToAnalysis,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialSpeech?.title || '');
  const [category, setCategory] = useState(initialSpeech?.category || 'كلمة افتتاحية ومؤتمرات');
  const [audience, setAudience] = useState(initialSpeech?.audience || '');
  const [content, setContent] = useState(
    initialSpeech?.content ||
      `أيها الحضور الكريم، السلام عليكم ورحمة الله وبركاته،
يسعدني أن أقف بينكم اليوم لنتبادل الرؤى حول آفاق التطوير والابتكار في مسيرتنا المشتركة.

إن النجاح لا يأتي بالصدفة، بل هو ثمرة إرادة صلبة وتخطيط مستمر وعمل جماعي متكامل.
دعونا نستثمر هذا اللقاء لنصنع فارقًا حقيقيًا في مستقبل قطاعنا. شكرًا لكم.`
  );
  const [notes, setNotes] = useState(initialSpeech?.notes || '');
  const [saveToast, setSaveToast] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  // Analysis preferences (all enabled by default)
  const [preferences, setPreferences] = useState<AnalysisPreferences>(
    initialSpeech?.preferences || DEFAULT_ANALYSIS_PREFERENCES
  );

  // Calculate live statistics
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const characterCount = content.length;
  const estimatedMinutes = Math.max(1, Math.ceil(wordCount / 130)); // Arabic speaking rate avg: 130 wpm

  const handleApplyTemplate = (template: { title: string; category: string; content: string }) => {
    setTitle(template.title);
    setCategory(template.category);
    setContent(template.content);
    setValidationError(null);
    setShowTemplatesModal(false);
  };

  const handleTogglePreference = (key: keyof AnalysisPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const { user, signIn } = useAuth();

  const constructSpeechObject = (status: Speech['status'] = 'draft'): Speech => {
    return {
      id: initialSpeech?.id || `speech-${Date.now()}`,
      title: title.trim() || 'خطاب بدون عنوان',
      category: category || 'عام',
      content: content.trim(),
      status: status,
      createdAt: initialSpeech?.createdAt || new Date().toLocaleDateString('ar-SA'),
      lastEdited: 'الآن',
      estimatedMinutes,
      wordCount,
      paragraphs: initialSpeech?.paragraphs || [],
      preferences,
      audience: audience.trim() || 'جمهور عام',
      notes: notes.trim(),
      userId: user?.uid,
    };
  };

  const handleSaveDraft = () => {
    if (!title.trim() && !content.trim()) {
      setValidationError('يرجى إدخال عنوان أو نص لحفظ المسودة.');
      return;
    }
    setValidationError(null);
    const speech = constructSpeechObject('draft');
    onSave(speech);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleStartAnalysis = async () => {
    if (isAnalyzing) return;

    if (!content.trim()) {
      setValidationError('يرجى كتابة أو لصق نص الخطاب قبل بدء التحليل.');
      return;
    }

    setValidationError(null);
    setIsAnalyzing(true);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 45000);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (user) {
        try {
          const idToken = await user.getIdToken();
          if (idToken) {
            headers['Authorization'] = `Bearer ${idToken}`;
          }
        } catch (tokenErr) {
          console.warn('[SpeechEditor] Could not fetch token, proceeding anonymously:', tokenErr);
        }
      }

      const response = await fetch('/api/analyze-speech', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          preferences,
          audience: audience.trim(),
        }),
        signal: abortController.signal,
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {
        throw new Error('تعذر قراءة استجابة الخادم. يرجى إعادة المحاولة.');
      }

      if (!response.ok) {
        throw new Error(data?.error || 'فشلت معالجة تحليل الخطاب.');
      }

      if (!data?.paragraphs || !Array.isArray(data.paragraphs)) {
        throw new Error('لم يقدم الخادم فقرات تحليل صالحة للخطاب.');
      }

      const analyzedSpeech: Speech = {
        id: initialSpeech?.id || `speech-${Date.now()}`,
        title: title.trim() || 'خطاب بدون عنوان',
        category: category || 'عام',
        content: content.trim(),
        status: 'analyzed',
        createdAt: initialSpeech?.createdAt || new Date().toLocaleDateString('ar-SA'),
        lastEdited: 'الآن',
        estimatedMinutes,
        wordCount,
        paragraphs: data.paragraphs,
        preferences,
        audience: audience.trim() || 'جمهور عام',
        notes: notes.trim(),
        userId: user?.uid,
      };

      onProceedToAnalysis(analyzedSpeech);
    } catch (err: any) {
      console.error('[SpeechEditor] Analysis request failed:', err);
      if (err.name === 'AbortError') {
        setValidationError('استغرقت معالجة الطلب وقتاً طويلاً. يرجى التحقق من اتصال الإنترنت وإعادة المحاولة.');
      } else {
        setValidationError(err.message || 'حدث خطأ غير متوقع أثناء تحليل الخطاب بالذكاء الاصطناعي. يرجى المحاولة لاحقًا.');
      }
    } finally {
      clearTimeout(timeoutId);
      setIsAnalyzing(false);
    }
  };

  const insertPauseAtCursor = () => {
    setContent((prev) => prev + ' [⏸ وقفة قصيرة] ');
    setValidationError(null);
  };

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      
      {/* Header and Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9ECEF]">
        <div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs text-[#6C757D] hover:text-[#212529] mb-1.5 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للوحة التحكم</span>
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#212529]">
            {initialSpeech ? 'تعديل الخطاب' : 'إنشاء خطاب جديد'}
          </h1>
          <p className="text-sm text-[#6C757D] mt-0.5">
            اكتب نص خطابك بالعربية أو اختر نموذجًا جاهزًا للبدء فورًا
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTemplatesModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#212529] bg-[#F8F9FA] hover:bg-[#E9ECEF] border border-[#E9ECEF] rounded-lg transition-colors"
          >
            <BookMarked className="w-4 h-4 text-[#212529]" />
            <span>نماذج خطابات مقترحة</span>
          </button>

          <button
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-[#212529] bg-[#F8F9FA] hover:bg-[#E9ECEF] border border-[#E9ECEF] rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>حفظ كمسودة</span>
          </button>

          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-[#FFFFFF] bg-[#212529] hover:bg-[#343a40] disabled:opacity-75 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#212529]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جارٍ التحليل...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>تحليل الخطاب</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="flex items-center gap-2 p-3.5 bg-[#F8F9FA] border border-[#212529] text-[#212529] rounded-xl text-sm transition-all animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#212529]" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Save Notification Toast */}
      {saveToast && (
        <div className="flex items-center gap-2 p-3 bg-[#F8F9FA] border border-[#E9ECEF] text-[#212529] rounded-xl text-sm transition-all">
          <Check className="w-4 h-4 shrink-0 text-[#212529]" />
          <span>تم حفظ مسودة الخطاب بنجاح في مكتبتك المحلية.</span>
        </div>
      )}

      {/* Speech Details Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Title Input */}
        <div className="md:col-span-2 space-y-2">
          <label className="block text-xs font-semibold text-[#212529]">
            عنوان الخطاب <span className="text-[#6C757D]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="مثال: قيادة التحول والريادة في العصر الرقمي"
            className="w-full px-4 py-2.5 text-base bg-[#FFFFFF] border border-[#E9ECEF] rounded-xl focus:outline-none focus:border-[#212529] text-[#212529] placeholder-[#6C757D]/60 font-medium"
          />
        </div>

        {/* Category Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#212529]">
            نوع ومناسبة الخطاب
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-[#FFFFFF] border border-[#E9ECEF] rounded-xl focus:outline-none focus:border-[#212529] text-[#212529]"
          >
            <option value="كلمة افتتاحية ومؤتمرات">كلمة افتتاحية ومؤتمرات</option>
            <option value="مؤتمر تقني">مؤتمر تقني وعلمي</option>
            <option value="عرض استثماري">عرض استثماري (Pitch Deck)</option>
            <option value="مناسبة رسمية وتكريم">مناسبة رسمية وتكريم</option>
            <option value="محاضرة أكاديمية">محاضرة أكاديمية وتوعوية</option>
            <option value="خطاب تحفيزي للموظفين">خطاب تحفيزي للموظفين</option>
          </select>
        </div>
      </div>

      {/* Editor Main Container */}
      <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-2xl p-6 space-y-4">
        
        {/* Editor Sub-toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E9ECEF] text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#212529]">
              محرر الإلقاء
            </span>
            <span className="text-[#E9ECEF]">|</span>
            <button
              onClick={insertPauseAtCursor}
              className="px-2.5 py-1 bg-[#F8F9FA] text-[#212529] border border-[#E9ECEF] hover:bg-[#E9ECEF] rounded-md font-medium transition-colors"
              title="إدراج علامة وقفة صوتية"
            >
              + إضافة علامة وقفة [⏸]
            </button>
          </div>

          {/* Real-time stats */}
          <div className="flex items-center gap-4 text-[#6C757D] font-mono">
            <div className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#212529]" />
              <span className="tabular-nums">{wordCount}</span> كلمة
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#212529]" />
              <span className="tabular-nums">~{estimatedMinutes}</span> دقائق إلقاء
            </div>
            <div className="text-[11px] text-[#6C757D] hidden sm:block">
              (١٣٠ كلمة/دقيقة)
            </div>
          </div>
        </div>

        {/* Spacious comfortable text area */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (validationError) setValidationError(null);
            }}
            rows={14}
            placeholder="اكتب أو الصق نص الخطاب باللغة العربية هنا...&#10;نصيحة: افصل بين الفقرات بسطر فارغ لتسهيل قراءتها وإلقائها على المنصة."
            className="w-full p-4 bg-transparent border-0 focus:outline-none text-[#212529] text-base sm:text-lg leading-loose resize-y placeholder-[#6C757D]/50"
            style={{ minHeight: '340px' }}
          />
        </div>

        {/* Footer info inside editor */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E9ECEF] text-xs text-[#6C757D]">
          <div>
            نصيحة للإلقاء المؤثر: اجعل كل فقرة تعبر عن فكرة واحدة مركزة لا تتجاوز ٤ أسطر.
          </div>
          <div className="tabular-nums">
            {characterCount} حرفًا
          </div>
        </div>
      </div>

      {/* Target Audience & Internal Speaker Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#FFFFFF] border border-[#E9ECEF] rounded-2xl p-6">
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#212529]">
            الجمهور المستهدف والمقام
          </label>
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="مثال: قيادات تنفيذية، شركاء استراتيجيون، طلاب جامعيون"
            className="w-full px-3.5 py-2 text-sm bg-transparent border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] text-[#212529] placeholder-[#6C757D]/60"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#212529]">
            ملاحظات المتحدث الشخصية (للتذكير)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثال: التنويه بشكر المنظمين في الدقيقة الأولى"
            className="w-full px-3.5 py-2 text-sm bg-transparent border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] text-[#212529] placeholder-[#6C757D]/60"
          />
        </div>
      </div>

      {/* 2. Analysis Preferences Section */}
      <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-2xl p-6 sm:p-8 space-y-5">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-[#212529]">
            خيارات التحليل
          </h2>
          <p className="text-sm text-[#6C757D] mt-1">
            خصص تحليل خطابك حسب احتياجك.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Option 1: إضافة التشكيل العربي */}
          <div
            onClick={() => handleTogglePreference('addDiacritics')}
            className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer select-none transition-all ${
              preferences.addDiacritics
                ? 'bg-[#F8F9FA] border-[#212529]'
                : 'bg-[#FFFFFF] border-[#E9ECEF] hover:bg-[#F8F9FA]/60'
            }`}
          >
            <input
              type="checkbox"
              checked={preferences.addDiacritics}
              onChange={() => {}}
              className="mt-1 w-4 h-4 rounded border-[#E9ECEF] text-[#212529] focus:ring-0 accent-[#212529] cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-[#212529] block">
                إضافة التشكيل العربي
              </span>
              <span className="text-xs text-[#6C757D] block leading-relaxed">
                ضبط أواخر وحركات الكلمات الأساسية لضمان سلامة النطق والإعراب.
              </span>
            </div>
          </div>

          {/* Option 2: تحسين الإلقاء ونبرة الصوت */}
          <div
            onClick={() => handleTogglePreference('improveTone')}
            className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer select-none transition-all ${
              preferences.improveTone
                ? 'bg-[#F8F9FA] border-[#212529]'
                : 'bg-[#FFFFFF] border-[#E9ECEF] hover:bg-[#F8F9FA]/60'
            }`}
          >
            <input
              type="checkbox"
              checked={preferences.improveTone}
              onChange={() => {}}
              className="mt-1 w-4 h-4 rounded border-[#E9ECEF] text-[#212529] focus:ring-0 accent-[#212529] cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-[#212529] block">
                تحسين الإلقاء ونبرة الصوت
              </span>
              <span className="text-xs text-[#6C757D] block leading-relaxed">
                اقتراح النبرات المناسبة (حماسية، هادئة، رصينة) مع إرشادات وتيرة السرعة.
              </span>
            </div>
          </div>

          {/* Option 3: تحديد الكلمات التي تحتاج إلى تأكيد */}
          <div
            onClick={() => handleTogglePreference('highlightEmphasis')}
            className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer select-none transition-all ${
              preferences.highlightEmphasis
                ? 'bg-[#F8F9FA] border-[#212529]'
                : 'bg-[#FFFFFF] border-[#E9ECEF] hover:bg-[#F8F9FA]/60'
            }`}
          >
            <input
              type="checkbox"
              checked={preferences.highlightEmphasis}
              onChange={() => {}}
              className="mt-1 w-4 h-4 rounded border-[#E9ECEF] text-[#212529] focus:ring-0 accent-[#212529] cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-[#212529] block">
                تحديد الكلمات التي تحتاج إلى تأكيد
              </span>
              <span className="text-xs text-[#6C757D] block leading-relaxed">
                تمييز الكلمات والمفاهيم المحورية بصريًا للضغط الصوتي عليها أثناء الإلقاء.
              </span>
            </div>
          </div>

          {/* Option 4: اقتراح أماكن الوقفات والتنفس */}
          <div
            onClick={() => handleTogglePreference('suggestPauses')}
            className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer select-none transition-all ${
              preferences.suggestPauses
                ? 'bg-[#F8F9FA] border-[#212529]'
                : 'bg-[#FFFFFF] border-[#E9ECEF] hover:bg-[#F8F9FA]/60'
            }`}
          >
            <input
              type="checkbox"
              checked={preferences.suggestPauses}
              onChange={() => {}}
              className="mt-1 w-4 h-4 rounded border-[#E9ECEF] text-[#212529] focus:ring-0 accent-[#212529] cursor-pointer"
            />
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-[#212529] block">
                اقتراح أماكن الوقفات والتنفس
              </span>
              <span className="text-xs text-[#6C757D] block leading-relaxed">
                إدراج محطات صمت مدروسة بين المعاني لتمكين التنفس الطبيعي وثبات الإيقاع.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E9ECEF]">
        <div className="text-xs text-[#6C757D]">
          سيتم تحليل الخطاب بالاعتماد حصرًا على الخيارات المفعلة أعلاه.
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-medium text-[#6C757D] hover:text-[#212529] rounded-lg transition-colors"
          >
            إلغاء
          </button>

          <button
            onClick={handleSaveDraft}
            className="px-5 py-2.5 text-sm font-medium text-[#212529] bg-[#F8F9FA] hover:bg-[#E9ECEF] border border-[#E9ECEF] rounded-lg transition-colors"
          >
            حفظ كمسودة
          </button>

          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
            className="inline-flex items-center justify-center gap-2 px-7 py-2.5 text-sm font-semibold text-[#FFFFFF] bg-[#212529] hover:bg-[#343a40] disabled:opacity-75 rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#212529] min-w-[140px]"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جارٍ التحليل...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>تحليل الخطاب</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9ECEF]">
              <div>
                <h3 className="font-display text-lg font-bold text-[#212529]">
                  نماذج خطابات مقترحة
                </h3>
                <p className="text-xs text-[#6C757D] mt-0.5">
                  اختر نموذجًا محررًا مسبقًا باللغة العربية الفصيحة لتعديله مباشرة
                </p>
              </div>
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="text-xs px-2.5 py-1 text-[#6C757D] hover:text-[#212529]"
              >
                إغلاق
              </button>
            </div>

            <div className="space-y-4">
              {SPEECH_TEMPLATES.map((tmpl, idx) => (
                <div
                  key={idx}
                  className="border border-[#E9ECEF] rounded-xl p-4 hover:border-[#212529] transition-colors space-y-2 group bg-[#FFFFFF]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-sm text-[#212529]">
                      {tmpl.title}
                    </span>
                    <span className="text-[11px] text-[#6C757D] bg-[#F8F9FA] border border-[#E9ECEF] px-2 py-0.5 rounded">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#6C757D] line-clamp-2 leading-relaxed">
                    {tmpl.content}
                  </p>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="px-3 py-1.5 text-xs font-semibold text-[#FFFFFF] bg-[#212529] hover:bg-[#343a40] rounded-lg transition-colors"
                    >
                      استخدام هذا النموذج
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
