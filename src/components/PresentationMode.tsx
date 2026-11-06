import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Speech, PresentationTheme } from '../types/speech';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Clock, 
  Play, 
  Pause, 
  Maximize, 
  Minimize, 
  Sliders, 
  Type, 
  CheckCircle2, 
  Volume2, 
  Eye, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface PresentationModeProps {
  speech: Speech;
  onExit: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  speech,
  onExit,
}) => {
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(3); // 1: small, 2: medium, 3: large, 4: extra large, 5: huge
  const [theme, setTheme] = useState<PresentationTheme>('light');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const totalParagraphs = speech.paragraphs.length;
  const currentParagraph = speech.paragraphs[currentParagraphIndex];
  const nextParagraph =
    currentParagraphIndex + 1 < totalParagraphs
      ? speech.paragraphs[currentParagraphIndex + 1]
      : null;

  // Stopwatch timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && !isCompleted) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isCompleted]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentParagraphIndex < totalParagraphs - 1) {
      setCurrentParagraphIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      setIsTimerRunning(false);
    }
  }, [currentParagraphIndex, totalParagraphs]);

  const handlePrev = useCallback(() => {
    if (currentParagraphIndex > 0) {
      setCurrentParagraphIndex((prev) => prev - 1);
      setIsCompleted(false);
    }
  }, [currentParagraphIndex]);

  const handleReset = () => {
    setCurrentParagraphIndex(0);
    setSecondsElapsed(0);
    setIsTimerRunning(true);
    setIsCompleted(false);
  };

  // Keyboard navigation support: Space, Arrows, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // In RTL: ArrowLeft often advances forward, but we support both ArrowLeft and ArrowDown or Space for Next
      if (e.code === 'Space' || e.code === 'ArrowDown' || e.code === 'ArrowLeft') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowUp' || e.code === 'ArrowRight') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else {
          onExit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onExit, isFullscreen]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Font size classes mapping
  const getFontSizeClass = () => {
    switch (fontSizeLevel) {
      case 1:
        return 'text-xl sm:text-2xl leading-relaxed sm:leading-loose';
      case 2:
        return 'text-2xl sm:text-3xl leading-relaxed sm:leading-loose';
      case 4:
        return 'text-4xl sm:text-5xl leading-loose sm:leading-[1.8]';
      case 5:
        return 'text-5xl sm:text-6xl leading-loose sm:leading-[1.9]';
      case 3:
      default:
        return 'text-3xl sm:text-4xl leading-loose sm:leading-[1.85]';
    }
  };

  // Stage theme classes mapping (Clean White, Charcoal Dark, Pure Black)
  const getThemeClasses = () => {
    switch (theme) {
      case 'navy':
        return {
          wrapper: 'bg-[#212529] text-[#FFFFFF]',
          topbar: 'bg-[#212529] border-white/10 text-[#FFFFFF]',
          card: 'bg-[#2c3136] border-white/10 text-white shadow-xl',
          nextCard: 'bg-[#212529] border-white/5 text-white/50',
          bottomBar: 'bg-[#212529] border-white/10',
          accent: 'text-white',
          badge: 'bg-white/10 text-white',
          emphasis: 'bg-white/20 text-white font-bold px-1.5 py-0.5 rounded border-b-2 border-white',
          pauseMarker: 'bg-white/10 text-white border border-white/20 px-2 py-0.5 rounded-md font-mono text-xs mx-1.5 inline-block align-middle',
          btnPrimary: 'bg-white text-[#212529] hover:bg-neutral-200',
        };
      case 'dark-contrast':
        return {
          wrapper: 'bg-[#000000] text-white',
          topbar: 'bg-black border-zinc-800 text-white',
          card: 'bg-zinc-900 border-zinc-800 text-white shadow-2xl',
          nextCard: 'bg-black border-zinc-900 text-zinc-500',
          bottomBar: 'bg-black border-zinc-800',
          accent: 'text-white',
          badge: 'bg-zinc-800 text-white',
          emphasis: 'bg-zinc-800 text-white font-bold px-1.5 py-0.5 rounded ring-1 ring-white',
          pauseMarker: 'bg-zinc-800 text-white border border-zinc-700 px-2 py-0.5 rounded-md font-mono text-xs mx-1.5 inline-block align-middle',
          btnPrimary: 'bg-white text-black hover:bg-zinc-200',
        };
      case 'light':
      default:
        return {
          wrapper: 'bg-[#FFFFFF] text-[#212529]',
          topbar: 'bg-[#FFFFFF] border-[#E9ECEF] text-[#212529]',
          card: 'bg-[#F8F9FA] border border-[#E9ECEF] text-[#212529] shadow-xs',
          nextCard: 'bg-[#FFFFFF] border border-[#E9ECEF] text-[#6C757D]',
          bottomBar: 'bg-[#FFFFFF] border-[#E9ECEF]',
          accent: 'text-[#212529]',
          badge: 'bg-[#FFFFFF] border border-[#E9ECEF] text-[#212529]',
          emphasis: 'bg-[#FFFFFF] text-[#212529] font-bold px-1.5 py-0.5 rounded border-b-2 border-[#212529]',
          pauseMarker: 'bg-[#FFFFFF] text-[#212529] border border-[#E9ECEF] px-2 py-0.5 rounded-md font-mono text-xs mx-1.5 inline-block align-middle shadow-xs',
          btnPrimary: 'bg-[#212529] text-[#FFFFFF] hover:bg-[#343a40]',
        };
    }
  };

  const themeStyle = getThemeClasses();
  const progressPercent = Math.round(((currentParagraphIndex + 1) / totalParagraphs) * 100);

  // Helper to render text with clean emphasis and pause styling
  const renderFormattedParagraph = (para: typeof currentParagraph) => {
    if (!para) return null;
    let text = para.annotatedText || para.originalText;

    // Replace pause markers with styled badges
    const pauseRegex = /\[⏸\s*([^\]]+)\]/g;
    text = text.replace(
      pauseRegex,
      `<span class="${themeStyle.pauseMarker}">⏸ $1</span>`
    );

    // Replace emphasis tags if present
    text = text.replace(
      /<mark class="emphasis-word">([^<]+)<\/mark>/g,
      `<span class="${themeStyle.emphasis}">$1</span>`
    );

    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col justify-between overflow-hidden select-none transition-colors duration-200 ${themeStyle.wrapper}`}
      dir="rtl"
    >
      {/* Top Header Controls Bar */}
      <header className={`h-16 px-4 sm:px-8 flex items-center justify-between border-b transition-colors ${themeStyle.topbar}`}>
        
        {/* Right side: Exit Button and Speech Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F8F9FA] border border-[#E9ECEF] text-[#212529] hover:bg-[#E9ECEF] transition-colors focus:outline-none"
            title="إنهاء العرض والعودة (Esc)"
          >
            <X className="w-4 h-4" />
            <span>خروج</span>
          </button>

          <span className="text-sm font-semibold truncate max-w-[200px] sm:max-w-md">
            {speech.title}
          </span>
        </div>

        {/* Center: Stage Progress Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium tabular-nums">
            الفقرة {currentParagraphIndex + 1} من {totalParagraphs}
          </span>
          <div className="w-24 sm:w-36 h-2 bg-[#E9ECEF] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#212529] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Left side: Stopwatch Timer, Font Size, Theme & Fullscreen Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Speaking Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] text-[#212529] font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-[#212529]" />
            <span className="tabular-nums font-semibold">{formatTime(secondsElapsed)}</span>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-0.5 hover:opacity-75 transition-opacity"
              title={isTimerRunning ? 'إيقاف المؤقت مؤقتًا' : 'استئناف المؤقت'}
            >
              {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
            </button>
          </div>

          {/* Font Size Adjusters */}
          <div className="hidden sm:flex items-center gap-1 bg-[#F8F9FA] border border-[#E9ECEF] p-1 rounded-lg text-xs text-[#212529]">
            <button
              onClick={() => setFontSizeLevel((prev) => Math.max(1, prev - 1))}
              disabled={fontSizeLevel <= 1}
              className="px-2 py-0.5 rounded hover:bg-[#E9ECEF] disabled:opacity-40"
              title="تصغير الخط"
            >
              أ-
            </button>
            <span className="text-[10px] tabular-nums px-1">{fontSizeLevel}</span>
            <button
              onClick={() => setFontSizeLevel((prev) => Math.min(5, prev + 1))}
              disabled={fontSizeLevel >= 5}
              className="px-2 py-0.5 rounded hover:bg-[#E9ECEF] disabled:opacity-40"
              title="تكبير الخط"
            >
              أ+
            </button>
          </div>

          {/* Theme Selector */}
          <div className="hidden md:flex items-center gap-1 bg-[#F8F9FA] border border-[#E9ECEF] p-1 rounded-lg text-xs text-[#212529]">
            <button
              onClick={() => setTheme('light')}
              className={`px-2 py-0.5 rounded ${theme === 'light' ? 'bg-[#212529] text-[#FFFFFF]' : 'text-[#6C757D] hover:text-[#212529]'}`}
              title="الوضع الأبيض النقي"
            >
              أبيض
            </button>
            <button
              onClick={() => setTheme('navy')}
              className={`px-2 py-0.5 rounded ${theme === 'navy' ? 'bg-[#212529] text-[#FFFFFF]' : 'text-[#6C757D] hover:text-[#212529]'}`}
              title="الوضع الفحمي"
            >
              فحمي
            </button>
            <button
              onClick={() => setTheme('dark-contrast')}
              className={`px-2 py-0.5 rounded ${theme === 'dark-contrast' ? 'bg-[#212529] text-[#FFFFFF]' : 'text-[#6C757D] hover:text-[#212529]'}`}
              title="داكن متباين"
            >
              داكن
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-[#F8F9FA] transition-colors"
            title={isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Teleprompter Stage Viewport */}
      <main className="flex-1 flex flex-col justify-center max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 overflow-y-auto">
        
        {isCompleted ? (
          /* Speech Completed Celebration State */
          <div className={`p-8 sm:p-12 rounded-3xl text-center space-y-6 border transition-all ${themeStyle.card}`}>
            <div className="w-16 h-16 mx-auto rounded-full bg-[#F8F9FA] border border-[#E9ECEF] text-[#212529] flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-[#212529]" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold">
                أحسنت! أتممت إلقاء الخطاب بنجاح
              </h2>
              <p className="text-sm opacity-70 max-w-md mx-auto">
                لقد تدربت على كامل فقرات الخطاب مع مراعاة النبرة والوقفات التأملية.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto py-4">
              <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-xl p-3">
                <div className="text-xs opacity-60">الوقت الإجمالي</div>
                <div className="font-mono text-xl font-bold tabular-nums">
                  {formatTime(secondsElapsed)}
                </div>
              </div>
              <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-xl p-3">
                <div className="text-xs opacity-60">الفقرات الملقاة</div>
                <div className="font-mono text-xl font-bold tabular-nums">
                  {totalParagraphs}
                </div>
              </div>
              <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-xl p-3 col-span-2 sm:col-span-1">
                <div className="text-xs opacity-60">عدد الكلمات</div>
                <div className="font-mono text-xl font-bold tabular-nums">
                  {speech.wordCount}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#FFFFFF] border border-[#E9ECEF] text-[#212529] hover:bg-[#F8F9FA] transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة الإلقاء من البداية</span>
              </button>
              <button
                onClick={onExit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#212529] text-[#FFFFFF] hover:bg-[#343a40] transition-colors"
              >
                <span>العودة للوحة التحكم</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Paragraph Stage */
          <div className="space-y-8 animate-fadeIn">
            
            {/* Contextual Delivery Cue Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full font-semibold ${themeStyle.badge}`}>
                  🎙️ {currentParagraph?.tone || 'نبرة متزنة'}
                </span>
                <span className="opacity-40 hidden sm:inline">·</span>
                <span className="opacity-70">
                  ⏱️ الوتيرة: {currentParagraph?.speedPacing || 'معتدل'}
                </span>
              </div>

              {currentParagraph?.presenceTip && (
                <div className="flex items-center gap-1.5 opacity-80 text-xs">
                  <Eye className="w-3.5 h-3.5 text-[#6C757D]" />
                  <span>{currentParagraph.presenceTip}</span>
                </div>
              )}
            </div>

            {/* Current Paragraph Card (Prominent & Clear) */}
            <div className={`p-6 sm:p-10 rounded-3xl border transition-all duration-200 ${themeStyle.card}`}>
              <div className={`font-normal text-right transition-all duration-200 ${getFontSizeClass()}`}>
                {renderFormattedParagraph(currentParagraph)}
              </div>
            </div>

            {/* Next Paragraph Preview (Subtle beneath) */}
            {nextParagraph && (
              <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-200 opacity-60 hover:opacity-90 cursor-pointer ${themeStyle.nextCard}`}
                onClick={handleNext}
                title="انقر للانتقال للفقرة التالية"
              >
                <div className="text-xs font-semibold text-[#212529] mb-1">
                  الفقرة القادمة (معاينة استباقية):
                </div>
                <div className="text-base sm:text-lg line-clamp-2 leading-relaxed opacity-80">
                  {nextParagraph.originalText}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Sticky Presentation Controls */}
      <footer className={`h-20 px-4 sm:px-8 flex items-center justify-between border-t transition-colors ${themeStyle.bottomBar}`}>
        
        {/* Reset & Navigation Hint */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-[#F8F9FA] transition-colors opacity-70 hover:opacity-100"
            title="إعادة من الفقرة الأولى"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="hidden lg:flex items-center gap-2 text-xs opacity-50">
            <span>التنقل بلوحة المفاتيح:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#F8F9FA] border border-[#E9ECEF] font-mono text-[11px]">مسافة</kbd>
            <span>أو</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#F8F9FA] border border-[#E9ECEF] font-mono text-[11px]">←</kbd>
            <span>للتالي</span>
            <span>·</span>
            <kbd className="px-1.5 py-0.5 rounded bg-[#F8F9FA] border border-[#E9ECEF] font-mono text-[11px]">Esc</kbd>
            <span>للخروج</span>
          </div>
        </div>

        {/* Primary Progression Navigation Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentParagraphIndex === 0 || isCompleted}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#F8F9FA] border border-[#E9ECEF] text-[#212529] hover:bg-[#E9ECEF] disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            <ChevronRight className="w-4 h-4" />
            <span>السابق</span>
          </button>

          <button
            onClick={handleNext}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] ${themeStyle.btnPrimary}`}
          >
            <span>
              {currentParagraphIndex === totalParagraphs - 1 ? 'إنهاء الخطاب' : 'الفقرة التالية'}
            </span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
