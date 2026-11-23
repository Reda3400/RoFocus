import React, { useState } from 'react';
import type { Module, StudySession } from '../types';
import { Play, Plus, ArrowRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import { DurationPicker } from './DurationPicker';

interface HomeViewProps {
  modules: Module[];
  activeSession: StudySession | null;
  history: StudySession[];
  onStartSession: (module: Module, plannedMinutes: number) => void;
  onNavigate: (tab: 'modules' | 'tasks' | 'focus' | 'analytics', title: string) => void;
  onOpenNewModule: () => void;
  soundEnabled: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  modules,
  activeSession,
  onStartSession,
  onNavigate,
  onOpenNewModule,
  soundEnabled
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedTargetModule, setSelectedTargetModule] = useState<Module | null>(null);
  const [pickHours, setPickHours] = useState(1);
  const [pickMinutes, setPickMinutes] = useState(30);

  const handleOpenPicker = (mod: Module) => {
    setSelectedTargetModule(mod);
    setIsPickerOpen(true);
  };

  const handleConfirmDuration = () => {
    if (!selectedTargetModule) return;
    const totalMinutes = pickHours * 60 + pickMinutes;
    if (totalMinutes <= 0) return;
    setIsPickerOpen(false);
    onStartSession(selectedTargetModule, totalMinutes);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10">
      <div className="home-compact-head flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#f07167] mb-2">
            RoFocus / Today
          </div>
          <h1 className="home-compact-title">Your study modules</h1>
        </div>
        <button
          onClick={onOpenNewModule}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0081a7] text-[#fdfcdc] font-medium text-xs tracking-wider uppercase shadow-sm hover:bg-[#0081a7]/90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#fed9b7]" />
          New Module
        </button>
      </div>

      {activeSession && (
        <div className="bg-[#fed9b7]/30 border-2 border-[#f07167] rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-4 rounded-2xl bg-[#f07167] text-[#fdfcdc]">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-[#f07167] mb-1">
                Active Study Session
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#0081a7]">
                {activeSession.moduleName}
              </h2>
              <p className="font-sans text-sm text-[#0081a7]/80 mt-1">
                {activeSession.topic} — {activeSession.tasksCompleted} / {activeSession.totalTasks} tasks completed
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('focus', 'Focus Session')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#f07167] text-[#fdfcdc] font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#f07167]/90 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Resume Focus Session
          </button>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="home-section-label font-mono text-xs uppercase tracking-[0.2em]">
            Modules / Tasks
          </h2>
          <button
            onClick={() => onNavigate('tasks', 'Task Manager')}
            className="text-xs font-mono uppercase tracking-wider text-[#00afb9] hover:text-[#0081a7] flex items-center gap-1 cursor-pointer"
          >
            All tasks <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.slice(0, 3).map(mod => {
            const completedCount = mod.tasks.filter(t => t.completed).length;
            const totalCount = mod.tasks.length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <div
                key={mod.id}
                role="button"
                tabIndex={0}
                aria-label={`Choose a focus duration for ${mod.name}`}
                onClick={() => handleOpenPicker(mod)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenPicker(mod);
                  }
                }}
                className="feature-card bg-[#fed9b7]/15 border border-[#fed9b7] rounded-3xl p-6 flex flex-col justify-between gap-6 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00afb9]"></span>
                    <span className="font-mono text-xs text-[#0081a7]/70">
                      {completedCount}/{totalCount} tasks
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#0081a7]">
                    {mod.name}
                  </h3>
                  <p className="font-sans text-xs font-semibold text-[#f07167] mt-1">
                    {mod.topic}
                  </p>

                  <ul className="mt-4 flex flex-col gap-2">
                    {mod.tasks.slice(0, 3).map(task => (
                      <li key={task.id} className="flex items-start gap-2 text-[11px] leading-snug">
                        {task.completed
                          ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
                          : <Circle className="w-3.5 h-3.5 flex-shrink-0 mt-px" />}
                        <span className={task.completed ? 'task-done' : ''}>{task.title}</span>
                      </li>
                    ))}
                    {mod.tasks.length > 3 && (
                      <li className="font-mono text-[9px] uppercase tracking-widest opacity-60">
                        +{mod.tasks.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="w-full h-1.5 bg-[#fed9b7] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-[#00afb9]"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="feature-card-cta w-full py-3 px-4 rounded-xl bg-[#0081a7] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Choose Duration & Start
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isPickerOpen && selectedTargetModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0081a7]/40 backdrop-blur-md p-4 sm:p-6" onClick={() => setIsPickerOpen(false)}>
          <div
            className="bg-[#fdfcdc] border border-[#fed9b7] w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
            style={{ borderRadius: 28 }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Set focus duration"
          >
            <div className="flex items-start justify-between gap-6 px-6 sm:px-8 pt-6 sm:pt-8 pb-5 border-b border-[#0081a7]/10">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#f07167] mb-2">
                  {selectedTargetModule.name}
                </div>
                <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[#0081a7] leading-[0.95]">
                  Set your focus time
                </h3>
                <p className="font-sans text-sm text-[#0081a7]/65 mt-3 max-w-md">
                  Choose a duration that feels realistic. You can adjust it with presets, the wheels, or the step buttons.
                </p>
              </div>
              <button
                onClick={() => setIsPickerOpen(false)}
                className="shrink-0 px-3 py-2 border border-[#0081a7]/15 text-[10px] font-mono uppercase tracking-[0.18em] text-[#0081a7]/70 hover:text-[#0081a7] hover:border-[#0081a7]/35 cursor-pointer"
                style={{ borderRadius: 999 }}
              >
                Close
              </button>
            </div>

            <div className="px-6 sm:px-8 py-6 overflow-y-auto">
              <DurationPicker
                hours={pickHours}
                minutes={pickMinutes}
                onChange={(h, m) => {
                  setPickHours(h);
                  setPickMinutes(m);
                }}
                soundEnabled={soundEnabled}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 px-6 sm:px-8 py-5 border-t border-[#0081a7]/10 bg-[#fed9b7]/10">
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="sm:flex-1 py-3.5 px-5 text-xs font-mono uppercase tracking-[0.16em] text-[#0081a7]/75 hover:text-[#0081a7] hover:bg-[#fed9b7]/20 cursor-pointer"
                style={{ borderRadius: 999 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDuration}
                disabled={pickHours * 60 + pickMinutes <= 0}
                className="sm:flex-[1.4] py-3.5 px-5 bg-[#00afb9] text-[#fdfcdc] font-bold text-xs uppercase tracking-[0.16em] hover:bg-[#00afb9]/90 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                style={{ borderRadius: 999 }}
              >
                Start Focus Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
