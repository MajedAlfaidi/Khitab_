/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Speech } from './types/speech';
import { INITIAL_SPEECHES } from './data/mockSpeeches';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { SpeechEditor } from './components/SpeechEditor';
import { SpeechAnalysis } from './components/SpeechAnalysis';
import { PresentationMode } from './components/PresentationMode';
import { DeliveryGuideModal } from './components/DeliveryGuideModal';

import { useAuth } from './contexts/AuthContext';
import { 
  subscribeToUserSpeeches, 
  saveSpeechToFirestore, 
  deleteSpeechFromFirestore 
} from './services/speechService';

type ActiveView = 'dashboard' | 'create' | 'analysis' | 'presentation';

export default function App() {
  const { user, loading: authLoading, signIn } = useAuth();

  // Theme state: dark / light (UI preference stored in localStorage)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('khitab_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Speeches library state (synced directly from Firestore)
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Current view state
  const [currentView, setCurrentView] = useState<ActiveView>('dashboard');
  const [selectedSpeech, setSelectedSpeech] = useState<Speech | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Sync dark class on html tag
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('khitab_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('khitab_theme', 'light');
    }
  }, [isDarkMode]);

  // Subscribe to Firestore speeches in real-time when authenticated
  useEffect(() => {
    if (!user) {
      setSpeeches([]);
      setIsSyncing(false);
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    const unsubscribe = subscribeToUserSpeeches(
      user.uid,
      (remoteSpeeches) => {
        setSpeeches(remoteSpeeches);
        setIsSyncing(false);
      },
      (error) => {
        console.error('[Khitab] Firestore sync error:', error);
        setSyncError('تعذر مزامنة الخطابات من السحابة. يرجى التحقق من الاتصال.');
        setIsSyncing(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Handlers for speeches saving directly to Firestore
  const handleSaveSpeech = async (speech: Speech) => {
    if (!user) {
      try {
        await signIn();
      } catch (err) {
        alert('يجب تسجيل الدخول بحساب Google أولاً لحفظ الخطاب في السحابة.');
        return;
      }
    }

    try {
      await saveSpeechToFirestore(speech);
      setSelectedSpeech(speech);
    } catch (err: any) {
      console.error('[Khitab] Save to Firestore failed:', err);
      alert(err.message || 'حدث خطأ أثناء حفظ الخطاب في السحابة.');
    }
  };

  const handleDeleteSpeech = async (speechId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الخطاب؟')) {
      try {
        await deleteSpeechFromFirestore(speechId);
        if (selectedSpeech?.id === speechId) {
          setSelectedSpeech(null);
        }
      } catch (err: any) {
        console.error('[Khitab] Delete from Firestore failed:', err);
        alert(err.message || 'حدث خطأ أثناء حذف الخطاب.');
      }
    }
  };

  const handleDuplicateSpeech = async (speech: Speech) => {
    const copy: Speech = {
      ...speech,
      id: `speech-${Date.now()}`,
      title: `${speech.title} (نسخة)`,
      createdAt: new Date().toLocaleDateString('ar-SA'),
      lastEdited: 'الآن',
      status: 'draft',
      userId: user?.uid,
    };
    await handleSaveSpeech(copy);
  };

  // Navigation handlers
  const handleCreateNew = () => {
    setSelectedSpeech(null);
    setCurrentView('create');
  };

  const handleSelectForEdit = (speech: Speech) => {
    setSelectedSpeech(speech);
    setCurrentView('create');
  };

  const handleSelectForAnalysis = (speech: Speech) => {
    setSelectedSpeech(speech);
    setCurrentView('analysis');
  };

  const handleSelectForPresentation = (speech: Speech) => {
    setSelectedSpeech(speech);
    setCurrentView('presentation');
  };

  const handleProceedFromEditorToAnalysis = (speech: Speech) => {
    setSelectedSpeech(speech);
    setCurrentView('analysis');
  };

  const handleProceedFromAnalysisToPresentation = (speech: Speech) => {
    handleSaveSpeech(speech);
    setSelectedSpeech(speech);
    setCurrentView('presentation');
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#212529] flex flex-col font-sans" dir="rtl">
      
      {/* Presentation Mode is Fullscreen Overlay */}
      {currentView === 'presentation' && selectedSpeech ? (
        <PresentationMode
          speech={selectedSpeech}
          onExit={() => setCurrentView('dashboard')}
        />
      ) : (
        <>
          {/* Main Navigation Top Bar */}
          <Navbar
            currentTab={
              currentView === 'dashboard'
                ? 'dashboard'
                : currentView === 'create'
                ? 'create'
                : 'dashboard'
            }
            onNavigate={(tab) => {
              if (tab === 'dashboard') {
                setCurrentView('dashboard');
              } else if (tab === 'create') {
                setSelectedSpeech(null);
                setCurrentView('create');
              } else if (tab === 'guide') {
                setIsGuideOpen(true);
              }
            }}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
          />

          {/* Main App Content Viewport */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
            {currentView === 'dashboard' && (
              <Dashboard
                speeches={speeches}
                onCreateSpeech={handleCreateNew}
                onSelectSpeechForEdit={handleSelectForEdit}
                onSelectSpeechForAnalysis={handleSelectForAnalysis}
                onSelectSpeechForPresentation={handleSelectForPresentation}
                onDeleteSpeech={handleDeleteSpeech}
                onDuplicateSpeech={handleDuplicateSpeech}
              />
            )}

            {currentView === 'create' && (
              <SpeechEditor
                initialSpeech={selectedSpeech}
                onSave={handleSaveSpeech}
                onProceedToAnalysis={handleProceedFromEditorToAnalysis}
                onCancel={() => setCurrentView('dashboard')}
              />
            )}

            {currentView === 'analysis' && selectedSpeech && (
              <SpeechAnalysis
                speech={selectedSpeech}
                onUpdateSpeech={handleSaveSpeech}
                onProceedToPresentation={handleProceedFromAnalysisToPresentation}
                onBackToEditor={handleSelectForEdit}
              />
            )}
          </main>

          {/* Clean Editorial Footer */}
          <footer className="mt-auto border-t border-[#E9ECEF] py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6C757D]">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-[#212529] text-sm">
                  خِطاب
                </span>
                <span>·</span>
                <span>منصة إعداد وإلقاء الخطابات باحترافية وبلاغة</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="hover:text-[#212529] transition-colors"
                >
                  دليل الإلقاء البلاغي
                </button>
                <span>·</span>
                <span>واجهة عربية متكاملة تدعم RTL</span>
              </div>
            </div>
          </footer>

          {/* Delivery Guide Modal */}
          <DeliveryGuideModal
            isOpen={isGuideOpen}
            onClose={() => setIsGuideOpen(false)}
          />
        </>
      )}
    </div>
  );
}
