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
import { WelcomeModal } from './components/WelcomeModal';

import { useAuth } from './contexts/AuthContext';
import { 
  subscribeToUserSpeeches, 
  saveSpeechToFirestore, 
  deleteSpeechFromFirestore,
  migrateLocalSpeechesToFirestore 
} from './services/speechService';
import {
  getLocalSpeeches,
  saveLocalSpeech,
  deleteLocalSpeech,
  hasLocalSpeeches
} from './services/localStorageService';

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

  // First-visit welcome modal state
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('khitab_welcome_modal_dismissed');
      return dismissed !== 'true';
    }
    return false;
  });

  const handleCloseWelcomeModal = () => {
    setIsWelcomeModalOpen(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('khitab_welcome_modal_dismissed', 'true');
    }
  };

  const handleSignInFromWelcomeModal = async () => {
    handleCloseWelcomeModal();
    try {
      await signIn();
    } catch (err) {
      console.error('[WelcomeModal] Sign-in error:', err);
    }
  };

  // If user is logged in, ensure welcome modal is closed and permanently marked dismissed
  useEffect(() => {
    if (user) {
      setIsWelcomeModalOpen(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('khitab_welcome_modal_dismissed', 'true');
      }
    }
  }, [user]);

  // Speeches library state (local for anonymous users, Firestore for authenticated users)
  const [speeches, setSpeeches] = useState<Speech[]>(() => {
    return getLocalSpeeches();
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [migrationNotice, setMigrationNotice] = useState<string | null>(null);

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

  // Handle speeches source and automatic migration
  useEffect(() => {
    if (!user) {
      // Unauthenticated: load from local storage
      setSpeeches(getLocalSpeeches());
      setIsSyncing(false);
      setSyncError(null);
      return;
    }

    // Authenticated user: perform migration if local speeches exist
    let isSubscribed = true;

    async function handleAuthInit() {
      if (!user) return;

      if (hasLocalSpeeches()) {
        const local = getLocalSpeeches();
        if (local.length > 0) {
          try {
            const migrationResult = await migrateLocalSpeechesToFirestore(user.uid, local);
            if (migrationResult.success && migrationResult.migratedCount > 0) {
              setMigrationNotice(`تمت مزامنة ${migrationResult.migratedCount} خطابًا محليًا ونقلها بنجاح إلى حسابك السحابي.`);
              setTimeout(() => setMigrationNotice(null), 5000);
            }
          } catch (mErr: any) {
            console.error('[Khitab] Migration error:', mErr);
            setMigrationNotice('تعذر إكمال مزامنة بعض الخطابات المحلية إلى السحابة، وهي لا تزال محفوظة بأمان في متصفحك.');
            setTimeout(() => setMigrationNotice(null), 6000);
          }
        }
      }

      setIsSyncing(true);
      setSyncError(null);

      const unsubscribe = subscribeToUserSpeeches(
        user.uid,
        (remoteSpeeches) => {
          if (!isSubscribed) return;
          setSpeeches(remoteSpeeches);
          setIsSyncing(false);
        },
        (error) => {
          if (!isSubscribed) return;
          console.error('[Khitab] Firestore sync error:', error);
          setSyncError('تعذر مزامنة الخطابات من السحابة. يرجى التحقق من الاتصال.');
          setIsSyncing(false);
        }
      );

      return unsubscribe;
    }

    const unsubPromise = handleAuthInit();

    return () => {
      isSubscribed = false;
      unsubPromise.then((unsub) => unsub && unsub());
    };
  }, [user]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Handlers for speeches: saves locally if unauthenticated, to Firestore if authenticated
  const handleSaveSpeech = async (speech: Speech) => {
    if (!user) {
      const saved = saveLocalSpeech(speech);
      setSpeeches(getLocalSpeeches());
      setSelectedSpeech(saved);
      return;
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
      if (!user) {
        deleteLocalSpeech(speechId);
        setSpeeches(getLocalSpeeches());
        if (selectedSpeech?.id === speechId) {
          setSelectedSpeech(null);
        }
        return;
      }

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
            {/* Migration Notification Banner */}
            {migrationNotice && (
              <div className="mt-4 p-3.5 bg-[#F8F9FA] border border-[#212529] text-[#212529] rounded-xl text-sm flex items-center justify-between gap-3 animate-fadeIn">
                <span>{migrationNotice}</span>
                <button
                  onClick={() => setMigrationNotice(null)}
                  className="text-xs font-semibold underline hover:no-underline"
                >
                  إغلاق
                </button>
              </div>
            )}

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

          {/* First-Visit Welcome & Onboarding Modal */}
          <WelcomeModal
            isOpen={isWelcomeModalOpen && !user && !authLoading}
            onClose={handleCloseWelcomeModal}
            onSignIn={handleSignInFromWelcomeModal}
          />
        </>
      )}
    </div>
  );
}
