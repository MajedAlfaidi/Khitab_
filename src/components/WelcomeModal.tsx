import React from 'react';
import { 
  X, 
  Cloud, 
  Laptop, 
  History, 
  ArrowLeft,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onSignIn,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none animate-fadeIn"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA] rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#212529]"
          aria-label="إغلاق النافذة الترحيبية"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon and Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-center text-[#212529]">
            <Sparkles className="w-7 h-7 text-[#212529]" />
          </div>
          
          <h2 id="welcome-modal-title" className="font-display text-2xl sm:text-3xl font-extrabold text-[#212529]">
            مرحبًا بك في خِطاب
          </h2>
          
          <p className="text-sm text-[#6C757D] max-w-sm mx-auto leading-relaxed">
            منصتك المتكاملة لتحضير الخطابات العربية، وضبط التشكيل، وتحسين نبرة وإيقاع الإلقاء باحترافية وبلاغة.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="space-y-3 pt-1">
          <div className="text-xs font-semibold text-[#6C757D] uppercase tracking-wider">
            مزايا تسجيل الدخول الاختياري:
          </div>

          <div className="space-y-2.5">
            {/* Benefit 1 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF]">
              <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E9ECEF] text-[#212529] shrink-0 mt-0.5">
                <Cloud className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[#212529]">
                  حفظ سحابي آمن ومستمر
                </h4>
                <p className="text-xs text-[#6C757D] leading-normal">
                  تخزين خطاباتك ومسوداتك وتحليلاتك بأمان في حسابك السحابي دون الخوف من فقدانها.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF]">
              <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E9ECEF] text-[#212529] shrink-0 mt-0.5">
                <Laptop className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[#212529]">
                  الوصول عبر مختلف الأجهزة
                </h4>
                <p className="text-xs text-[#6C757D] leading-normal">
                  متابعة تحرير وإلقاء خطاباتك بسهولة من الحاسوب أو الهاتف أو الجهاز اللوحي في أي وقت.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF]">
              <div className="p-2 rounded-lg bg-[#FFFFFF] border border-[#E9ECEF] text-[#212529] shrink-0 mt-0.5">
                <History className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[#212529]">
                  مزامنة السجل وتاريخ الخطابات
                </h4>
                <p className="text-xs text-[#6C757D] leading-normal">
                  استرجاع كافة توصيات الأداء والوقفات التعبيرية السابقة بسلاسة وتوحيد مسيرتك البلاغية.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Free Access Guarantee Footnote */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F8F9FA]/60 border border-dashed border-[#E9ECEF] text-[11px] text-[#6C757D]">
          <ShieldCheck className="w-4 h-4 text-[#212529] shrink-0" />
          <span>يمكنك دائمًا استخدام كافة مزايا التحرير والتحليل الذكي والإلقاء مجانًا وبحرية تامة دون تسجيل الدخول.</span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Primary Action: Google Sign-in */}
          <button
            onClick={onSignIn}
            className="w-full flex items-center justify-center gap-2.5 px-5 py-3 text-sm font-semibold text-[#FFFFFF] bg-[#212529] hover:bg-[#343a40] rounded-xl transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#212529] active:scale-[0.99]"
          >
            {/* Google G icon SVG */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
            </svg>
            <span>تسجيل الدخول عبر Google</span>
          </button>

          {/* Secondary Action: Continue without account */}
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA] rounded-xl transition-colors"
          >
            <span>المتابعة كضيف بدون حساب</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
