import React, { useState, useMemo } from 'react';
import { Speech } from '../types/speech';
import { useAuth } from '../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Play, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Layers,
  Copy,
  ChevronLeft,
  LogIn,
  AlertCircle
} from 'lucide-react';

interface DashboardProps {
  speeches: Speech[];
  onCreateSpeech: () => void;
  onSelectSpeechForEdit: (speech: Speech) => void;
  onSelectSpeechForAnalysis: (speech: Speech) => void;
  onSelectSpeechForPresentation: (speech: Speech) => void;
  onDeleteSpeech: (speechId: string) => void;
  onDuplicateSpeech: (speech: Speech) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  speeches,
  onCreateSpeech,
  onSelectSpeechForEdit,
  onSelectSpeechForAnalysis,
  onSelectSpeechForPresentation,
  onDeleteSpeech,
  onDuplicateSpeech,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'analyzed' | 'draft'>('all');

  // Quantitative stats
  const totalMinutes = useMemo(() => {
    return speeches.reduce((acc, s) => acc + (s.estimatedMinutes || 0), 0);
  }, [speeches]);

  const readyCount = useMemo(() => {
    return speeches.filter((s) => s.status === 'ready').length;
  }, [speeches]);

  // Filtered speeches
  const filteredSpeeches = useMemo(() => {
    return speeches.filter((speech) => {
      const matchesSearch =
        speech.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        speech.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        speech.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus =
        statusFilter === 'all' || speech.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [speeches, searchQuery, statusFilter]);

  const getStatusLabel = (status: Speech['status']) => {
    switch (status) {
      case 'ready':
        return { text: 'جاهز للإلقاء', class: 'text-[#212529] bg-[#F8F9FA] border border-[#E9ECEF]' };
      case 'analyzed':
        return { text: 'تم التحليل', class: 'text-[#6C757D] bg-[#F8F9FA] border border-[#E9ECEF]' };
      case 'draft':
      default:
        return { text: 'مسودة قيد التجهيز', class: 'text-[#6C757D] bg-[#F8F9FA] border border-[#E9ECEF]' };
    }
  };

  const { user, signIn, authError } = useAuth();

  return (
    <div className="space-y-10 py-6">
      
      {/* Auth Error Banner if present */}
      {authError && (
        <div className="p-3.5 bg-[#F8F9FA] border border-[#212529] rounded-xl flex items-center gap-2 text-xs text-[#212529]">
          <AlertCircle className="w-4 h-4 text-[#212529] shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <section className="bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl p-6 sm:p-10 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="text-xs font-semibold text-[#6C757D] tracking-wide">
            منصة الإلقاء البلاغي
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#212529] tracking-tight leading-tight">
            {user?.displayName ? `مرحبًا بك، ${user.displayName}` : 'مرحبًا بك في خِطاب'}
          </h1>
          <p className="text-lg sm:text-xl text-[#6C757D] font-normal leading-relaxed">
            حضّر خطابك، وطوّر أداءك، وألقِ بثقة.
          </p>
          
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onCreateSpeech}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm sm:text-base font-medium text-[#FFFFFF] bg-[#212529] hover:bg-[#343a40] rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#212529] active:scale-[0.99]"
            >
              <Plus className="w-5 h-5" />
              <span>إنشاء خطاب جديد</span>
            </button>

            <button
              onClick={() => {
                if (speeches[0]) {
                  onSelectSpeechForPresentation(speeches[0]);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-3.5 text-sm sm:text-base font-medium text-[#212529] bg-[#FFFFFF] border border-[#E9ECEF] hover:bg-[#F8F9FA] rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#212529]"
            >
              <Play className="w-4 h-4 text-[#212529]" />
              <span>تجربة إلقاء الخطاب النموذجي</span>
            </button>
          </div>

          {/* Optional Cloud Account Link Card */}
          {!user && (
            <div className="pt-3">
              <div className="p-3.5 bg-[#FFFFFF] border border-[#E9ECEF] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#6C757D]">
                  <LogIn className="w-4 h-4 text-[#212529] shrink-0" />
                  <span>سجّل دخولك بحساب Google لربط وحفظ خطاباتك ومسوداتك الخاصة بأمان.</span>
                </div>
                <button
                  onClick={() => signIn()}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#212529] hover:bg-[#343a40] text-[#FFFFFF] rounded-lg font-medium transition-colors whitespace-nowrap self-start sm:self-auto"
                >
                  <span>تسجيل الدخول عبر Google</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quantitative Overview Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-xl p-5">
          <div className="flex items-center justify-between text-[#6C757D] text-sm mb-2">
            <span>إجمالي الخطابات المحفوظة</span>
            <FileText className="w-4 h-4 text-[#6C757D]" />
          </div>
          <div className="font-display text-3xl font-bold text-[#212529] tabular-nums">
            {speeches.length}
          </div>
          <div className="text-xs text-[#6C757D] mt-1">
            جاهزة ومسودات مسجلة
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-xl p-5">
          <div className="flex items-center justify-between text-[#6C757D] text-sm mb-2">
            <span>معدل زمن الإلقاء الإجمالي</span>
            <Clock className="w-4 h-4 text-[#6C757D]" />
          </div>
          <div className="font-display text-3xl font-bold text-[#212529] tabular-nums">
            {totalMinutes} <span className="text-base font-normal text-[#6C757D]">دقيقة</span>
          </div>
          <div className="text-xs text-[#6C757D] mt-1">
            بمعدل ١٣٠ كلمة / دقيقة
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-xl p-5">
          <div className="flex items-center justify-between text-[#6C757D] text-sm mb-2">
            <span>خطابات جاهزة للمنصة</span>
            <CheckCircle2 className="w-4 h-4 text-[#212529]" />
          </div>
          <div className="font-display text-3xl font-bold text-[#212529] tabular-nums">
            {readyCount}
          </div>
          <div className="text-xs text-[#6C757D] mt-1">
            محللة بالإشارات النغمية والوقفات
          </div>
        </div>
      </section>

      {/* Speeches Management Section */}
      <section className="space-y-6">
        
        {/* Section Header with Search and Segmented Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#212529]">
              الخطابات المسجلة
            </h2>
            <p className="text-sm text-[#6C757D] mt-0.5">
              استعرض خطاباتك، عدّلها، أو ابدأ شاشة الإلقاء المباشر فورًا
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px] sm:w-64">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6C757D] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالعنوان أو الموضوع..."
                className="w-full pl-3 pr-10 py-2 text-sm bg-[#FFFFFF] border border-[#E9ECEF] rounded-lg focus:outline-none focus:border-[#212529] text-[#212529] placeholder-[#6C757D]/60 transition-colors"
              />
            </div>

            {/* Segmented Filter Buttons */}
            <div className="flex items-center gap-1 p-1 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg text-xs font-medium">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-[#212529] text-[#FFFFFF]'
                    : 'text-[#6C757D] hover:text-[#212529]'
                }`}
              >
                الكل ({speeches.length})
              </button>
              <button
                onClick={() => setStatusFilter('ready')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === 'ready'
                    ? 'bg-[#212529] text-[#FFFFFF]'
                    : 'text-[#6C757D] hover:text-[#212529]'
                }`}
              >
                جاهز للإلقاء
              </button>
              <button
                onClick={() => setStatusFilter('analyzed')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === 'analyzed'
                    ? 'bg-[#212529] text-[#FFFFFF]'
                    : 'text-[#6C757D] hover:text-[#212529]'
                }`}
              >
                تم التحليل
              </button>
              <button
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === 'draft'
                    ? 'bg-[#212529] text-[#FFFFFF]'
                    : 'text-[#6C757D] hover:text-[#212529]'
                }`}
              >
                مسودة
              </button>
            </div>
          </div>
        </div>

        {/* Speeches Cards Grid */}
        {filteredSpeeches.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#E9ECEF] rounded-2xl p-12 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#F8F9FA] border border-[#E9ECEF] flex items-center justify-center text-[#212529]">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg font-bold text-[#212529]">
                {searchQuery
                  ? 'لم يتم العثور على خطابات تطابق البحث'
                  : user
                  ? 'لا توجد خطابات مسجلة في مكتبتك السحابية حتى الآن'
                  : 'مرحبًا بك، سجّل دخولك لإدارة خطاباتك السحابية'}
              </h3>
              <p className="text-sm text-[#6C757D] max-w-sm mx-auto">
                {searchQuery
                  ? 'جرّب تعديل كلمات البحث أو تصفية الحالة.'
                  : user
                  ? 'ابدأ الآن بكتابة وتحضير خطابك الأول بكل ثقة وسهولة.'
                  : 'سجّل دخولك بحساب Google لمزامنة وحفظ خطاباتك بأمان تام عبر أجهزتك.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              {!user && (
                <button
                  onClick={() => signIn()}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#212529] bg-[#F8F9FA] hover:bg-[#E9ECEF] border border-[#E9ECEF] rounded-lg transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </button>
              )}
              <button
                onClick={onCreateSpeech}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#FFFFFF] bg-[#212529] hover:bg-[#343a40] rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء خطاب جديد</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpeeches.map((speech) => {
              const statusMeta = getStatusLabel(speech.status);
              return (
                <div
                  key={speech.id}
                  className="bg-[#FFFFFF] border border-[#E9ECEF] hover:border-[#6C757D]/50 rounded-2xl p-6 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Top Row: Unboxed Category and Status Tag */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#6C757D] font-medium">
                        {speech.category}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md font-medium text-xs ${statusMeta.class}`}>
                        {statusMeta.text}
                      </span>
                    </div>

                    {/* Speech Title */}
                    <h3 className="font-display text-lg font-bold text-[#212529] leading-snug">
                      {speech.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-sm text-[#6C757D] line-clamp-3 leading-relaxed">
                      {speech.content}
                    </p>

                    {/* Clean unboxed metadata with bullet separators */}
                    <div className="flex items-center gap-2 text-xs text-[#6C757D] pt-2 border-t border-[#E9ECEF]">
                      <span className="tabular-nums">{speech.estimatedMinutes} دقائق إلقاء</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{speech.wordCount} كلمة</span>
                      <span aria-hidden="true">·</span>
                      <span>{speech.createdAt}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-6 mt-6 border-t border-[#E9ECEF] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Presentation Button (Primary) */}
                      <button
                        onClick={() => onSelectSpeechForPresentation(speech)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#FFFFFF] bg-[#212529] hover:bg-[#343a40] rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#212529]"
                        title="بدء شاشة الإلقاء"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>إلقاء</span>
                      </button>

                      {/* Analysis Button */}
                      <button
                        onClick={() => onSelectSpeechForAnalysis(speech)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#212529] bg-[#F8F9FA] hover:bg-[#E9ECEF] border border-[#E9ECEF] rounded-lg transition-colors"
                        title="عرض التحليل الإلقائي"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#212529]" />
                        <span>التحليل</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => onSelectSpeechForEdit(speech)}
                        className="p-2 text-[#6C757D] hover:text-[#212529] rounded-lg hover:bg-[#F8F9FA] transition-colors"
                        title="تحرير النص"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Duplicate */}
                      <button
                        onClick={() => onDuplicateSpeech(speech)}
                        className="p-2 text-[#6C757D] hover:text-[#212529] rounded-lg hover:bg-[#F8F9FA] transition-colors"
                        title="استنساخ الخطاب"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteSpeech(speech.id)}
                        className="p-2 text-[#6C757D] hover:text-[#212529] rounded-lg hover:bg-[#F8F9FA] transition-colors"
                        title="حذف الخطاب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
