import React, { useState } from 'react';
import { Speech, SpeechParagraph, DeliverySuggestion } from '../types/speech';
import { 
  Sparkles, 
  Play, 
  ArrowRight, 
  Check, 
  X, 
  Volume2, 
  Clock, 
  Compass, 
  Eye, 
  Sliders, 
  Layers, 
  Edit2, 
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Plus,
  Save
} from 'lucide-react';

interface SpeechAnalysisProps {
  speech: Speech;
  onUpdateSpeech: (updated: Speech) => void;
  onProceedToPresentation: (speech: Speech) => void;
  onBackToEditor: (speech: Speech) => void;
}

export const SpeechAnalysis: React.FC<SpeechAnalysisProps> = ({
  speech,
  onUpdateSpeech,
  onProceedToPresentation,
  onBackToEditor,
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'preview'>('cards');
  const [editingParagraphId, setEditingParagraphId] = useState<string | null>(null);
  const [editedText, setEditedText] = useState<string>('');

  // Count metrics from paragraphs
  const totalSuggestions = speech.paragraphs.reduce(
    (acc, p) => acc + (p.suggestions?.length || 0),
    0
  );

  const acceptedSuggestionsCount = speech.paragraphs.reduce(
    (acc, p) => acc + (p.suggestions?.filter((s) => s.accepted).length || 0),
    0
  );

  const toggleSuggestionAccepted = (paragraphId: string, suggestionId: string) => {
    const updatedParagraphs = speech.paragraphs.map((para) => {
      if (para.id !== paragraphId) return para;
      const updatedSuggestions = para.suggestions.map((sug) => {
        if (sug.id === suggestionId) {
          return { ...sug, accepted: !sug.accepted };
        }
        return sug;
      });

      // Also refresh the annotated text dynamically based on accepted suggestions
      return {
        ...para,
        suggestions: updatedSuggestions,
      };
    });

    const updatedSpeech: Speech = {
      ...speech,
      paragraphs: updatedParagraphs,
      status: 'ready',
    };
    onUpdateSpeech(updatedSpeech);
  };

  const startEditingParagraph = (para: SpeechParagraph) => {
    setEditingParagraphId(para.id);
    setEditedText(para.originalText);
  };

  const saveEditedParagraph = (paragraphId: string) => {
    const updatedParagraphs = speech.paragraphs.map((para) => {
      if (para.id !== paragraphId) return para;
      return {
        ...para,
        originalText: editedText,
        annotatedText: editedText, // Reset to updated base
      };
    });

    const updatedSpeech: Speech = {
      ...speech,
      paragraphs: updatedParagraphs,
    };
    onUpdateSpeech(updatedSpeech);
    setEditingParagraphId(null);
  };

  const acceptAllSuggestions = () => {
    const updatedParagraphs = speech.paragraphs.map((para) => ({
      ...para,
      suggestions: para.suggestions.map((s) => ({ ...s, accepted: true })),
    }));
    onUpdateSpeech({
      ...speech,
      paragraphs: updatedParagraphs,
      status: 'ready',
    });
  };

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9ECEF]">
        <div>
          <button
            onClick={() => onBackToEditor(speech)}
            className="inline-flex items-center gap-1.5 text-xs text-[#6C757D] hover:text-[#212529] mb-1.5 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة لتحرير النص</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#212529]">
              تحليل الإلقاء البلاغي
            </h1>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[#F8F9FA] border border-[#E9ECEF] text-[#212529] rounded-md">
              تحليل ذكي متكامل
            </span>
          </div>
          <p className="text-sm text-[#6C757D] mt-1">
            خطاب: <span className="font-semibold text-[#212529]">{speech.title}</span>
          </p>

          {/* Applied Preferences Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs">
            <span className="text-[#6C757D] text-[11px]">خيارات التحليل المطبقة:</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] border font-medium ${
                speech.preferences?.addDiacritics !== false
                  ? 'bg-[#F8F9FA] border-[#212529]/30 text-[#212529]'
                  : 'bg-[#FFFFFF] border-[#E9ECEF] text-[#6C757D] line-through'
              }`}
            >
              التشكيل العربي
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] border font-medium ${
                speech.preferences?.improveTone !== false
                  ? 'bg-[#F8F9FA] border-[#212529]/30 text-[#212529]'
                  : 'bg-[#FFFFFF] border-[#E9ECEF] text-[#6C757D] line-through'
              }`}
            >
              تحسين النبرة
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] border font-medium ${
                speech.preferences?.highlightEmphasis !== false
                  ? 'bg-[#F8F9FA] border-[#212529]/30 text-[#212529]'
                  : 'bg-[#FFFFFF] border-[#E9ECEF] text-[#6C757D] line-through'
              }`}
            >
              تأكيد الكلمات
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] border font-medium ${
                speech.preferences?.suggestPauses !== false
                  ? 'bg-[#F8F9FA] border-[#212529]/30 text-[#212529]'
                  : 'bg-[#FFFFFF] border-[#E9ECEF] text-[#6C757D] line-through'
              }`}
            >
              الوقفات والتنفس
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onBackToEditor(speech)}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-[#212529] bg-[#F8F9FA] hover:bg-[#E9ECEF] border border-[#E9ECEF] rounded-lg transition-colors"
          >
            تعديل النص
          </button>

          <button
            onClick={() => onUpdateSpeech(speech)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-[#212529] bg-[#F8F9FA] hover:bg-[#E9ECEF] border border-[#E9ECEF] rounded-lg transition-colors"
            title="حفظ الخطاب المحلل في السحابة"
          >
            <Save className="w-3.5 h-3.5" />
            <span>حفظ في السحابة</span>
          </button>

          <button
            onClick={() => onProceedToPresentation(speech)}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-[#FFFFFF] bg-[#212529] hover:bg-[#343a40] rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#212529]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>بدء الإلقاء التجريبي (شاشة الإلقاء)</span>
          </button>
        </div>
      </div>

      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-xl p-4">
          <div className="text-xs text-[#6C757D] mb-1">
            فقرات الخطاب
          </div>
          <div className="font-display text-2xl font-bold text-[#212529] tabular-nums">
            {speech.paragraphs.length}
          </div>
          <div className="text-[11px] text-[#6C757D] mt-0.5">
            محطات إلقاء منظمة
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-xl p-4">
          <div className="text-xs text-[#6C757D] mb-1">
            التوصيات المعتمدة
          </div>
          <div className="font-display text-2xl font-bold text-[#212529] tabular-nums">
            {acceptedSuggestionsCount} / {totalSuggestions}
          </div>
          <div className="text-[11px] text-[#6C757D] mt-0.5">
            تأكيدات صوتية ووقفات
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-xl p-4">
          <div className="text-xs text-[#6C757D] mb-1">
            زمن الإلقاء المتوقع
          </div>
          <div className="font-display text-2xl font-bold text-[#212529] tabular-nums">
            ~{speech.estimatedMinutes} دقائق
          </div>
          <div className="text-[11px] text-[#6C757D] mt-0.5">
            شامل الوقفات التأملية
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-xl p-4">
          <div className="text-xs text-[#6C757D] mb-1">
            جاهزية العرض
          </div>
          <div className="font-display text-2xl font-bold text-[#212529]">
            جاهز للمنصة
          </div>
          <div className="text-[11px] text-[#6C757D] mt-0.5">
            انتقل لشاشة الإلقاء
          </div>
        </div>
      </div>

      {/* Control Bar: View Toggle & Accept All */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'cards'
                ? 'bg-[#212529] text-[#FFFFFF]'
                : 'text-[#6C757D] hover:text-[#212529]'
            }`}
          >
            توصيات الفقرات التفصيلية
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'preview'
                ? 'bg-[#212529] text-[#FFFFFF]'
                : 'text-[#6C757D] hover:text-[#212529]'
            }`}
          >
            معاينة النص مع علامات الإلقاء
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={acceptAllSuggestions}
            className="text-xs text-[#212529] hover:underline font-medium px-2 py-1 transition-colors"
          >
            اعتماد جميع المقترحات (قبول الكل)
          </button>
        </div>
      </div>

      {/* Main Analysis Body */}
      {activeTab === 'cards' ? (
        <div className="space-y-6">
          {speech.paragraphs.map((para, pIdx) => (
            <div
              key={para.id}
              className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-2xl p-6 sm:p-8 space-y-6"
            >
              {/* Paragraph Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E9ECEF]">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#F8F9FA] border border-[#E9ECEF] text-[#212529] font-bold text-xs flex items-center justify-center tabular-nums">
                    {pIdx + 1}
                  </span>
                  <span className="font-display font-bold text-base text-[#212529]">
                    الفقرة {pIdx + 1} من {speech.paragraphs.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {/* Tone Badge */}
                  <span className="px-2.5 py-1 bg-[#F8F9FA] border border-[#E9ECEF] text-[#212529] rounded-md font-medium">
                    🎙️ {para.tone}
                  </span>
                  
                  {/* Speed Badge */}
                  <span className="px-2.5 py-1 bg-[#F8F9FA] border border-[#E9ECEF] text-[#6C757D] rounded-md font-medium">
                    ⏱️ الوتيرة: {para.speedPacing}
                  </span>
                </div>
              </div>

              {/* Paragraph Text View / Edit */}
              {editingParagraphId === para.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    rows={4}
                    className="w-full p-4 text-base bg-[#F8F9FA] border border-[#212529] rounded-xl focus:outline-none text-[#212529] leading-relaxed"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditingParagraphId(null)}
                      className="px-3 py-1.5 text-xs text-[#6C757D]"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => saveEditedParagraph(para.id)}
                      className="px-4 py-1.5 text-xs font-semibold text-[#FFFFFF] bg-[#212529] rounded-lg"
                    >
                      حفظ التعديل
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <p className="text-lg sm:text-xl text-[#212529] leading-loose font-normal">
                    {para.originalText}
                  </p>
                  <button
                    onClick={() => startEditingParagraph(para)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity absolute left-2 top-2 p-1.5 text-[#6C757D] hover:text-[#212529] bg-[#FFFFFF] border border-[#E9ECEF] rounded-md shadow-xs"
                    title="تعديل نص هذه الفقرة"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Coach Guidelines Grid (Speed Notes & Body Language Presence) */}
              {(para.pacingNote || para.presenceTip) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Pacing Speed Note */}
                  {para.pacingNote && (
                    <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#212529]">
                        <Clock className="w-3.5 h-3.5 text-[#212529]" />
                        <span>ملاحظة حول سرعة الإلقاء والوتيرة:</span>
                      </div>
                      <p className="text-xs text-[#6C757D] leading-relaxed">
                        {para.pacingNote}
                      </p>
                    </div>
                  )}

                  {/* Presence & Impact Recommendation */}
                  {para.presenceTip && (
                    <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#212529]">
                        <Eye className="w-3.5 h-3.5 text-[#212529]" />
                        <span>توصية لتحسين الحضور والتأثير:</span>
                      </div>
                      <p className="text-xs text-[#6C757D] leading-relaxed">
                        {para.presenceTip}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Delivery Suggestions Checklist (Emphasis & Pause Controls) */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-[#212529]">
                  اقتراحات الأداء الصوتي والوقفات (انقر للقبول أو الرفض):
                </div>

                {para.suggestions.length > 0 ? (
                  <div className="space-y-2">
                    {para.suggestions.map((sug) => (
                      <div
                        key={sug.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          sug.accepted
                            ? 'bg-[#F8F9FA] border-[#212529]/30'
                            : 'bg-transparent border-[#E9ECEF] opacity-60'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold ${
                                sug.accepted
                                  ? 'text-[#212529]'
                                  : 'text-[#6C757D] line-through'
                              }`}
                            >
                              {sug.label}
                            </span>
                            <span className="text-[10px] text-[#6C757D]">
                              {sug.type === 'emphasis'
                                ? 'تأكيد صوتي'
                                : sug.type === 'pause'
                                ? 'وقفة صمت'
                                : 'نبرة صوتية'}
                            </span>
                          </div>
                          <p className="text-xs text-[#6C757D]">
                            {sug.description}
                          </p>
                        </div>

                        {/* Acceptance Toggle Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => toggleSuggestionAccepted(para.id, sug.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                              sug.accepted
                                ? 'bg-[#212529] text-[#FFFFFF]'
                                : 'bg-[#F8F9FA] border border-[#E9ECEF] text-[#6C757D] hover:text-[#212529]'
                            }`}
                          >
                            {sug.accepted ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>معتمد</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>قبول المقترح</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl text-xs text-[#6C757D]">
                    لم يتم توليد اقتراحات تأكيد أو وقفات لهذه الفقرة نظرًا لتعطيل الخيارات المقابلة في إعدادات التحليل.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Formatted text preview mode with pauses and emphasis */
        <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-2xl p-6 sm:p-10 space-y-8">
          <div className="border-b border-[#E9ECEF] pb-4">
            <h3 className="font-display text-lg font-bold text-[#212529]">
              معاينة النص المسرحي المنسق
            </h3>
            <p className="text-xs text-[#6C757D] mt-1">
              هكذا سيظهر نصك الإلقائي مع تمييز الكلمات الهامة وتحديد محطات الصمت المدروسة.
            </p>
          </div>

          <div className="space-y-8">
            {speech.paragraphs.map((p, idx) => (
              <div key={p.id} className="space-y-2">
                <div className="text-xs font-semibold text-[#212529]">
                  [محطة {idx + 1}] — {p.tone}
                </div>
                <div
                  className="text-xl sm:text-2xl text-[#212529] leading-loose font-normal"
                  dangerouslySetInnerHTML={{ __html: p.annotatedText }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Launch Callout */}
      <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold text-[#212529]">
            جاهز لتجربة الإلقاء الحي؟
          </h3>
          <p className="text-sm text-[#6C757D] mt-1">
            ادخل إلى شاشة الإلقاء المخصصة (Teleprompter) للتدرب على الخطاب فقرة بفقرة بكل سلاسة وثقة.
          </p>
        </div>

        <button
          onClick={() => onProceedToPresentation(speech)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-bold text-[#FFFFFF] bg-[#212529] hover:bg-[#343a40] rounded-xl transition-all active:scale-[0.99] whitespace-nowrap"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>الانتقال لشاشة الإلقاء</span>
        </button>
      </div>
    </div>
  );
};
