import type { StudySession } from '../types';
import { RoFocusLogo } from './RoFocusLogo';
import { Clock, Volume2, VolumeX, Home, Layers, ListTodo, BarChart2 } from 'lucide-react';

type Tab = 'home' | 'modules' | 'tasks' | 'focus' | 'analytics';

interface NavbarProps {
  activeTab: Tab;
  onSelectTab: (tab: Tab, title: string) => void;
  activeSession: StudySession | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const LINKS: { tab: Tab; label: string; title: string; icon: typeof Home }[] = [
  { tab: 'home', label: 'Home', title: 'Study Command Center', icon: Home },
  { tab: 'modules', label: 'Modules', title: 'Study Modules', icon: Layers },
  { tab: 'tasks', label: 'Tasks', title: 'Task Manager', icon: ListTodo },
  { tab: 'analytics', label: 'Analytics', title: 'Session Analytics', icon: BarChart2 }
];

const formatClock = (session: StudySession) => {
  const remaining = session.plannedMinutes * 60 - session.elapsedSeconds;
  const total = Math.abs(remaining);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `${remaining < 0 ? '+' : ''}${hours > 0 ? String(hours).padStart(2, '0') + ':' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  activeSession,
  soundEnabled,
  onToggleSound
}) => {
  return (
    <>
    <header className="sticky top-0 z-40 bg-[#fdfcdc]/90 backdrop-blur-md border-b border-[#0081a7]/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={() => onSelectTab('home', 'Study Command Center')}
          className="text-left group cursor-pointer"
        >
          <RoFocusLogo size={32} variant="full" />
        </button>

        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {LINKS.map(link => (
            <button
              key={link.tab}
              type="button"
              onClick={() => onSelectTab(link.tab, link.title)}
              aria-current={activeTab === link.tab ? 'page' : undefined}
              className={`nav-link ${activeTab === link.tab ? 'is-active' : ''}`}
            >
              <span className="nav-roll">
                <span>{link.label}</span>
                <span aria-hidden="true">{link.label}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute completion sound' : 'Enable completion sound'}
            className="p-2.5 rounded-xl bg-[#fed9b7]/40 hover:bg-[#fed9b7] text-[#0081a7] transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#f07167]" />}
          </button>

          {activeSession ? (
            <button
              onClick={() => onSelectTab('focus', 'Focus Session')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f07167] text-[#fdfcdc] font-medium text-xs shadow-sm hover:bg-[#f07167]/90 transition-all animate-pulse cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Resume Session</span>
              <span className="font-mono tabular-nums opacity-80">{formatClock(activeSession)}</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectTab('modules', 'Start Study Session')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00afb9] text-[#fdfcdc] font-medium text-xs shadow-sm hover:bg-[#00afb9]/90 transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Start Focus</span>
            </button>
          )}
        </div>
      </div>
    </header>

    {/* Small screens keep the same four destinations in a thumb-reachable bar. */}
    <nav className="mobile-tabbar" aria-label="Mobile navigation">
      {LINKS.map(link => {
        const Icon = link.icon;
        return (
          <button
            key={link.tab}
            type="button"
            onClick={() => onSelectTab(link.tab, link.title)}
            aria-current={activeTab === link.tab ? 'page' : undefined}
            className={`mobile-tab ${activeTab === link.tab ? 'is-active' : ''}`}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            <span>{link.label}</span>
          </button>
        );
      })}
    </nav>
    </>
  );
};
