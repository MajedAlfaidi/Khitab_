import React from 'react';
import { 
  X, 
  Volume2, 
  Clock, 
  Eye, 
  Sparkles, 
  Compass, 
  Heart, 
  CheckCircle2, 
  BookOpen, 
  Layers 
} from 'lucide-react';

interface DeliveryGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryGuideModal: React.FC<DeliveryGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E9ECEF]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F8F9FA] border border-[#E9ECEF] text-[#212529] flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#212529]">
                دليل الإلقاء البلاغي والحضور المسرحي
              </h2>
              <p className="text-xs text-[#6C757D] mt-0.5">
                مبادئ وأسرار الخطابة المؤثرة باللغة العربية
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#6C757D] hover:text-[#212529] rounded-lg transition-colors"
            aria-label="إغلاق الدليل"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm text-[#212529] leading-relaxed">
          
          {/* Section 1: Pauses */}
          <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 font-display font-bold text-base text-[#212529]">
              <Clock className="w-4 h-4 text-[#212529]" />
              <span>١. سحر الصمت: أنواع الوقفات في البلاغة العربية</span>
            </div>
            <p className="text-xs text-[#6C757D]">
              الصمت المدروس على المنصة ليس فراغًا، بل هو أداة جذب وانتباه أقوى من الكلمات.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E9ECEF]">
                <span className="font-bold text-[#212529] block mb-1">وقفة الفصل (نصف ثانية)</span>
                تُوضع بين الجمل التامة ومواقع الفواصل لمنح الأذن راحة واستقرارًا صوتيًا.
              </div>
              <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E9ECEF]">
                <span className="font-bold text-[#212529] block mb-1">وقفة التشويق (ثانية واحدة)</span>
                تأتي قبل الكلمات الجوهرية أو الأرقام المفاجئة لحث المستمع على الترقب.
              </div>
              <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E9ECEF]">
                <span className="font-bold text-[#212529] block mb-1">وقفة التأمل (٢ - ٣ ثوانٍ)</span>
                تلي السؤال البلاغي أو الحكمة العميقة، لتمنح الحضور فرصة التفكير الذاتي.
              </div>
            </div>
          </div>

          {/* Section 2: Vocal Modulation */}
          <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 font-display font-bold text-base text-[#212529]">
              <Volume2 className="w-4 h-4 text-[#212529]" />
              <span>٢. التنغيم الصوتي ومخارج الحروف</span>
            </div>
            <ul className="space-y-2 text-xs text-[#6C757D] list-disc list-inside">
              <li>
                <strong className="text-[#212529]">تجنب الوتيرة الرتيبة (Monotone):</strong> غيّر في نبرتك وطبقة صوتك صعودًا وهبوطًا لتبقى حيوية الجمهور متقدة.
              </li>
              <li>
                <strong className="text-[#212529]">ضغط الحروف الهامة:</strong> عند الكلمات المفتاحية (مثل "التحول"، "الشجاعة"، "المستقبل")، اضغط برفق على مخارج الحروف وانطقها بتمهل.
              </li>
              <li>
                <strong className="text-[#212529]">معدل الإلقاء النموذجي:</strong> المعدل الأنسب للمتحدث العربي المحترف هو ما بين ١٢٠ إلى ١٤٠ كلمة في الدقيقة.
              </li>
            </ul>
          </div>

          {/* Section 3: Presence and Eye Contact */}
          <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 font-display font-bold text-base text-[#212529]">
              <Eye className="w-4 h-4 text-[#212529]" />
              <span>٣. لغة الجسد وقاعدة مثلث النظرات</span>
            </div>
            <div className="space-y-2 text-xs text-[#6C757D]">
              <p>
                قسّم قاعة الحضور ذهنيًا إلى ثلاثة أقسام (يمين، وسط، يسار). انظر إلى كل قطاع لمدة ٣ إلى ٥ ثوانٍ ثم انتقل بسلاسة إلى القطاع الآخر. هذا يُشعر كل فرد بأنه معني ومخاطب مباشرة.
              </p>
              <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E9ECEF] text-[#212529]">
                <span className="font-semibold text-[#212529]">وضعية اليدين:</span> اجعل اليدين مفتوحتين بمستوى الصدر، وتجنب تشبيك الأصابع أو وضع اليدين في الجيوب.
              </div>
            </div>
          </div>

          {/* Section 4: Stage Fright */}
          <div className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 font-display font-bold text-base text-[#212529]">
              <Heart className="w-4 h-4 text-[#212529]" />
              <span>٤. إدارة رهبة المسرح بالتنفس البطني (4-7-8)</span>
            </div>
            <p className="text-xs text-[#6C757D]">
              قبل الصعود إلى المنصة بدقيقتين: خذ شهيقًا عميقًا من الأنف لـ ٤ ثوانٍ، احبس النفس لـ ٧ ثوانٍ، ثم ازفر ببطء من الفم لـ ٨ ثوانٍ. هذه التقنية تُهدئ ضربات القلب فورًا وتعيد تركيز الأكسجين في الدماغ.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-[#E9ECEF] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-[#FFFFFF] bg-[#212529] hover:bg-[#343a40] rounded-xl transition-colors"
          >
            حسنًا، فهمت
          </button>
        </div>
      </div>
    </div>
  );
};
