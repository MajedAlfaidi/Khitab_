import React from 'react';
import { Moon, Sun, Plus, BookOpen, Mic2, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  currentTab: 'dashboard' | 'create' | 'guide';
  onNavigate: (tab: 'dashboard' | 'create' | 'guide') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const { user, loading, signIn, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b border-[#E9ECEF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        
        {/* Zone 1: Brand Wordmark only - Arabic text-based placeholder */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('dashboard')}
            className="text-right group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#212529] rounded-md px-1 py-0.5"
            aria-label="خِطاب - الصفحة الرئيسية"
          >
            <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#212529]">
              خِطاب
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'dashboard'
                ? 'text-[#212529] font-semibold border-b-2 border-[#212529]'
                : 'text-[#6C757D] hover:text-[#212529]'
            }`}
          >
            لوحة التحكم
          </button>
          
          <button
            onClick={() => onNavigate('create')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'create'
                ? 'text-[#212529] font-semibold border-b-2 border-[#212529]'
                : 'text-[#6C757D] hover:text-[#212529]'
            }`}
          >
            محرر الخطابات
          </button>

          <button
            onClick={() => onNavigate('guide')}
            className={`whitespace-nowrap transition-colors py-1 ${
              currentTab === 'guide'
                ? 'text-[#212529] font-semibold border-b-2 border-[#212529]'
                : 'text-[#6C757D] hover:text-[#212529]'
            }`}
          >
            دليل الإلقاء البلاغي
          </button>
        </nav>

        {/* Zone 3: Actions (Theme Toggle, Auth & Primary CTA) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
            className="p-2.5 rounded-lg text-[#6C757D] hover:text-[#212529] hover:bg-[#F8F9FA] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#212529]"
            aria-label="تبديل المظهر"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-[#212529]" />
            ) : (
              <Moon className="w-5 h-5 text-[#212529]" />
            )}
          </button>

          {/* User Auth Profile / Google Sign-in */}
          {user ? (
            <div className="flex items-center gap-2 bg-[#F8F9FA] border border-[#E9ECEF] rounded-lg px-2.5 py-1">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'المستخدم'}
                  className="w-6 h-6 rounded-full object-cover border border-[#E9ECEF]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#E9ECEF] flex items-center justify-center text-xs font-bold text-[#212529]">
                  {(user.displayName || user.email || 'خ')[0]}
                </div>
              )}
              <span className="text-xs font-medium text-[#212529] hidden lg:inline max-w-[110px] truncate">
                {user.displayName || user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="p-1 text-[#6C757D] hover:text-[#212529] transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#212529] bg-[#F8F9FA] hover:bg-[#E9ECEF] border border-[#E9ECEF] rounded-lg transition-colors whitespace-nowrap"
              title="تسجيل الدخول بحساب Google"
            >
              <LogIn className="w-3.5 h-3.5 text-[#212529]" />
              <span className="hidden sm:inline">تسجيل الدخول</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('create')}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#FFFFFF] bg-[#212529] hover:bg-[#343a40] rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#212529] focus-visible:ring-offset-2 whitespace-nowrap active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء خطاب جديد</span>
          </button>
        </div>
      </div>

      {/* Mobile sub-navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-[#E9ECEF] py-2 px-3 text-xs font-medium">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            currentTab === 'dashboard'
              ? 'bg-[#F8F9FA] text-[#212529] font-semibold'
              : 'text-[#6C757D]'
          }`}
        >
          الرئيسية
        </button>
        <button
          onClick={() => onNavigate('create')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            currentTab === 'create'
              ? 'bg-[#F8F9FA] text-[#212529] font-semibold'
              : 'text-[#6C757D]'
          }`}
        >
          خطاب جديد
        </button>
        <button
          onClick={() => onNavigate('guide')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            currentTab === 'guide'
              ? 'bg-[#F8F9FA] text-[#212529] font-semibold'
              : 'text-[#6C757D]'
          }`}
        >
          دليل الإلقاء
        </button>
      </div>
    </header>
  );
};
