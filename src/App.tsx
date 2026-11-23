import { useState, useEffect, useRef } from 'react';
import type { Module, StudySession, UserPreferences } from './types';
import {
  loadModules,
  saveModules,
  loadActiveSession,
  saveActiveSession,
  loadHistory,
  saveHistory,
  loadPreferences,
  savePreferences,
  STORAGE_KEYS
} from './utils/storage';
import {
  fetchTaskDb,
  taskDbFromModules,
  applyTaskDb,
  downloadTaskDb,
  parseTaskDbText
} from './utils/taskDb';
import { soundService } from './utils/sound';
import { wheelSoundService } from './utils/wheelSound';
import { IntroOverlay } from './components/IntroOverlay';
import { PageTransition } from './components/PageTransition';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { ModulesView } from './components/ModulesView';
import { TasksView } from './components/TasksView';
import { FocusView } from './components/FocusView';
import { AnalyticsView } from './components/AnalyticsView';

type Tab = 'home' | 'modules' | 'tasks' | 'focus' | 'analytics';
type Direction = 'left' | 'right' | 'top' | 'bottom';
const DIRECTIONS: Direction[] = ['left', 'right', 'top', 'bottom'];
const VISIT_KEY = 'refocus_visit_count_v1';

export function App() {
  // The counter is a reload ritual: it runs on every fresh page load.
  const [showIntro] = useState<boolean>(true);
  const [visitCount] = useState<number>(() => {
    try {
      const next = Number(localStorage.getItem(VISIT_KEY) || '0') + 1;
      localStorage.setItem(VISIT_KEY, String(next));
      return next;
    } catch {
      return 1;
    }
  });

  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [pendingTab, setPendingTab] = useState<Tab | null>(null);
  const [transitionTitle, setTransitionTitle] = useState<string>('Study Command Center');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [transitionDirection, setTransitionDirection] = useState<Direction>('bottom');

  // App State
  const [modules, setModules] = useState<Module[]>(loadModules);
  const [activeSession, setActiveSession] = useState<StudySession | null>(loadActiveSession);
  const [history, setHistory] = useState<StudySession[]>(loadHistory);
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);
  const chimePlayedRef = useRef(false);

  // On a first visit the JSON file seeds the task database. Later visits use
  // the saved copy so the person's own edits are never overwritten.
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEYS.MODULES)) return;
    fetchTaskDb()
      .then(db => setModules(prev => applyTaskDb(prev, db)))
      .catch(() => { /* keep the built-in seed if the file cannot be read */ });
  }, []);

  useEffect(() => {
    saveModules(modules);
  }, [modules]);

  useEffect(() => {
    saveActiveSession(activeSession);
  }, [activeSession]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    savePreferences(preferences);
    soundService.setMuted(!preferences.soundEnabled);
    soundService.setVolume(preferences.volume);
    wheelSoundService.setMuted(!preferences.soundEnabled);
  }, [preferences]);

  // The clock lives in the app shell, so it keeps running while the person
  // visits other pages and comes back.
  useEffect(() => {
    if (activeSession?.status !== 'running' && activeSession?.status !== 'overtime') return;

    const interval = window.setInterval(() => {
      setActiveSession(prev => {
        if (!prev || (prev.status !== 'running' && prev.status !== 'overtime')) return prev;
        const planned = prev.plannedMinutes * 60;
        const elapsed = prev.elapsedSeconds + 1;
        const isOvertime = elapsed > planned;
        if (isOvertime && !chimePlayedRef.current) {
          chimePlayedRef.current = true;
          if (preferences.soundEnabled) soundService.playCompletionChime();
        }
        return {
          ...prev,
          elapsedSeconds: elapsed,
          overtimeSeconds: isOvertime ? elapsed - planned : 0,
          status: isOvertime ? 'overtime' : 'running'
        };
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [activeSession?.status, activeSession?.plannedMinutes, preferences.soundEnabled]);

  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [activeTab]);

  const handleIntroComplete = () => {
    // Nothing to store: the counter comes back on the next reload on purpose.
  };

  // Any of the four sides, chosen fresh every time (including the previous one).
  const pickDirection = (): Direction =>
    DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];

  const handleNavigate = (tab: Tab, title: string) => {
    if (tab === activeTab || isTransitioning) return;
    setTransitionTitle(title);
    setTransitionDirection(pickDirection());
    setPendingTab(tab);
    setIsTransitioning(true);
  };

  const handleTransitionMidpoint = () => {
    if (pendingTab) setActiveTab(pendingTab);
    setPendingTab(null);
  };

  const handleStartSession = (module: Module, plannedMinutes: number) => {
    chimePlayedRef.current = false;
    const newSession: StudySession = {
      id: `session_${Date.now()}`,
      moduleId: module.id,
      moduleName: module.name,
      topic: module.topic,
      plannedMinutes,
      elapsedSeconds: 0,
      overtimeSeconds: 0,
      status: 'running',
      startTime: new Date().toISOString(),
      tasksCompleted: module.tasks.filter(t => t.completed).length,
      totalTasks: module.tasks.length
    };
    setActiveSession(newSession);
    setTransitionTitle('Focus Session');
    setTransitionDirection(pickDirection());
    setPendingTab('focus');
    setIsTransitioning(true);
  };

  const handleFinishSession = (completedSession: StudySession) => {
    setHistory(prev => [completedSession, ...prev]);
    setActiveSession(null);
  };

  const handleRestartTimer = () => {
    chimePlayedRef.current = false;
    setActiveSession(prev => prev ? {
      ...prev,
      elapsedSeconds: 0,
      overtimeSeconds: 0,
      status: 'running',
      startTime: new Date().toISOString()
    } : prev);
  };

  const handleToggleSound = () => {
    const updated = { ...preferences, soundEnabled: !preferences.soundEnabled };
    setPreferences(updated);
  };

  const handleExportTasks = () => downloadTaskDb(taskDbFromModules(modules));

  const handleImportTasks = async (file: File) => {
    const db = parseTaskDbText(await file.text());
    setModules(prev => applyTaskDb(prev, db));
  };

  const handleReloadTasks = async () => {
    const db = await fetchTaskDb();
    setModules(prev => applyTaskDb(prev, db));
  };

  return (
    <div className="min-h-screen bg-[#fdfcdc] text-[#0081a7] font-['Manrope',sans-serif] selection:bg-[#fed9b7] selection:text-[#f07167]">
      {showIntro && <IntroOverlay onComplete={handleIntroComplete} visitCount={visitCount} />}

      <PageTransition
        isTransitioning={isTransitioning}
        targetTitle={transitionTitle}
        direction={transitionDirection}
        onMidpoint={handleTransitionMidpoint}
        onTransitionFinished={() => setIsTransitioning(false)}
      />

      {activeTab !== 'focus' && (
        <Navbar
          activeTab={activeTab}
          onSelectTab={handleNavigate}
          activeSession={activeSession}
          soundEnabled={preferences.soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      <main className={activeTab === 'focus' ? '' : 'main-with-tabbar'}>
        {activeTab === 'home' && (
          <HomeView
            modules={modules}
            activeSession={activeSession}
            history={history}
            onStartSession={handleStartSession}
            onNavigate={handleNavigate}
            onOpenNewModule={() => handleNavigate('modules', 'Study Modules')}
            soundEnabled={preferences.soundEnabled}
          />
        )}

        {activeTab === 'modules' && (
          <ModulesView
            modules={modules}
            onAddModule={(newModData) => {
              const newMod: Module = {
                ...newModData,
                id: `mod_${Date.now()}`,
                createdAt: new Date().toISOString()
              };
              setModules(prev => [newMod, ...prev]);
            }}
            onUpdateModule={(updatedMod) => {
              setModules(prev => prev.map(m => m.id === updatedMod.id ? updatedMod : m));
            }}
            onDeleteModule={(id) => {
              setModules(prev => prev.filter(m => m.id !== id));
            }}
            onStartSession={handleStartSession}
            soundEnabled={preferences.soundEnabled}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            modules={modules}
            onUpdateModule={(updatedMod) => {
              setModules(prev => prev.map(m => m.id === updatedMod.id ? updatedMod : m));
            }}
            onExportDb={handleExportTasks}
            onImportDb={handleImportTasks}
            onReloadDb={handleReloadTasks}
          />
        )}

        {activeTab === 'focus' && activeSession && (
          <FocusView
            session={activeSession}
            modules={modules}
            onUpdateSession={(updated) => setActiveSession(updated)}
            onUpdateModule={(updatedMod) => {
              setModules(prev => prev.map(m => m.id === updatedMod.id ? updatedMod : m));
            }}
            onFinishSession={handleFinishSession}
            onBackToHome={() => handleNavigate('home', 'Study Command Center')}
            onRestartTimer={handleRestartTimer}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView history={history} />
        )}
      </main>
    </div>
  );
}

export default App;
