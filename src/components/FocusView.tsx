import React, { useState } from 'react';
import type { Module, StudySession } from '../types';
import { Play, Pause, Square, CheckCircle2, Circle, ArrowLeft, Sparkles, Award, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FocusViewProps {
  session: StudySession;
  modules: Module[];
  onUpdateSession: (session: StudySession | null) => void;
  onUpdateModule: (module: Module) => void;
  onFinishSession: (completedSession: StudySession) => void;
  onBackToHome: () => void;
  onRestartTimer: () => void;
}

export const FocusView: React.FC<FocusViewProps> = ({
  session,
  modules,
  onUpdateSession,
  onUpdateModule,
  onFinishSession,
  onBackToHome,
  onRestartTimer
}) => {
  // The shared clock lives in App; this screen only shows it.
  const currentSession = session;
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState<boolean>(false);

  const module = modules.find(m => m.id === currentSession.moduleId);
  const tasks = module ? module.tasks : [];
  const completedTasksCount = tasks.filter(t => t.completed).length;

  const plannedSecondsTotal = currentSession.plannedMinutes * 60;

  const handleTogglePause = () => {
    const nextStatus: StudySession['status'] = currentSession.status === 'running'
      ? 'paused'
      : currentSession.status === 'overtime'
      ? 'overtime'
      : 'running';

    const updated: StudySession = { ...currentSession, status: nextStatus };
    onUpdateSession(updated);
  };

  const handleToggleTask = (taskId: string) => {
    if (!module) return;
    const updatedTasks = module.tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const updatedMod = { ...module, tasks: updatedTasks };
    onUpdateModule(updatedMod);

    const newCompletedCount = updatedTasks.filter(t => t.completed).length;
    const updatedSession: StudySession = {
      ...currentSession,
      tasksCompleted: newCompletedCount,
      totalTasks: updatedTasks.length
    };
    onUpdateSession(updatedSession);
  };

  const handleEndSession = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00afb9', '#f07167', '#0081a7', '#fed9b7', '#fdfcdc']
      });
    } catch {
      // ignore
    }

    setIsCompletedModalOpen(true);
  };

  const confirmFinishAndExit = () => {
    const finalSession: StudySession = {
      ...currentSession,
      status: 'completed',
      endTime: new Date().toISOString()
    };
    onFinishSession(finalSession);
    onBackToHome();
  };

  const remainingSeconds = plannedSecondsTotal - currentSession.elapsedSeconds;
  const isOvertime = remainingSeconds < 0;
  const absRemaining = Math.abs(remainingSeconds);

  const hours = Math.floor(absRemaining / 3600);
  const minutes = Math.floor((absRemaining % 3600) / 60);
  const seconds = absRemaining % 60;

  const formatTimeStr = `${hours > 0 ? String(hours).padStart(2, '0') + ':' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const elapsedHours = Math.floor(currentSession.elapsedSeconds / 3600);
  const elapsedMinutes = Math.floor((currentSession.elapsedSeconds % 3600) / 60);
  const elapsedSecs = currentSession.elapsedSeconds % 60;
  const formatElapsedStr = `${String(elapsedHours).padStart(2, '0')}:${String(elapsedMinutes).padStart(2, '0')}:${String(elapsedSecs).padStart(2, '0')}`;

  return (
    <div data-reveal className="min-h-[calc(100vh-80px)] max-w-7xl mx-auto px-6 py-12 flex flex-col justify-between bg-[#fdfcdc] text-[#0081a7]">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#fed9b7]/30 hover:bg-[#fed9b7] text-[#0081a7] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer border border-[#fed9b7]"
        >
          <ArrowLeft className="w-4 h-4" />
          Command Center
        </button>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-[#0081a7]/70">
            {currentSession.moduleName}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider ${
              isOvertime
                ? 'bg-[#f07167] text-[#fdfcdc] font-bold animate-pulse'
                : currentSession.status === 'paused'
                ? 'bg-[#fed9b7] text-[#0081a7]'
                : 'bg-[#00afb9] text-[#fdfcdc]'
            }`}
          >
            {isOvertime ? 'Overtime Active' : currentSession.status}
          </span>
        </div>
      </div>

      {/* Center Huge Timer & Display */}
      <div className="flex flex-col items-center justify-center my-auto py-12">
        <div className="font-mono text-xs uppercase tracking-widest text-[#f07167] mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          {currentSession.topic}
        </div>

        {/* Huge Timer Display */}
        <div className="flex flex-col items-center">
          <div className="font-serif focus-timer font-bold text-[#0081a7] select-none tabular-nums">
            {isOvertime ? `+${formatTimeStr}` : formatTimeStr}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 sm:gap-6 mt-6 text-xs font-mono text-[#0081a7]/70">
            <span>Planned: {currentSession.plannedMinutes} mins</span>
            <span>•</span>
            <span>Elapsed: {formatElapsedStr}</span>
            {isOvertime && (
              <>
                <span>•</span>
                <span className="text-[#f07167] font-bold uppercase tracking-wider animate-pulse">Overtime! Keep going.</span>
              </>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-12">
          <button
            onClick={handleTogglePause}
            className="flex items-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-[#0081a7] text-[#fdfcdc] font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#0081a7]/90 transition-all cursor-pointer"
          >
            {currentSession.status === 'running' || currentSession.status === 'overtime' ? (
              <>
                <Pause className="w-4 h-4 text-[#fed9b7]" /> Pause Session
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-[#fed9b7] fill-current" /> Resume Session
              </>
            )}
          </button>
          <button
            onClick={onRestartTimer}
            className="flex items-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl border border-[#0081a7] bg-transparent text-[#0081a7] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Restart Timer
          </button>
          <button
            onClick={handleEndSession}
            className="flex items-center gap-2 px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-[#f07167] text-[#fdfcdc] font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#f07167]/90 transition-all cursor-pointer"
          >
            <Square className="w-4 h-4 fill-current" /> Finish Session
          </button>
        </div>
      </div>

      {/* Bottom Task Checklist */}
      <div className="w-full max-w-2xl mx-auto bg-[#fed9b7]/20 border border-[#fed9b7] rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-[#0081a7]">
            Session Tasks ({completedTasksCount} / {tasks.length})
          </span>
          <span className="text-xs text-[#00afb9] font-mono">
            {tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0}% done
          </span>
        </div>

        <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
          {tasks.map(task => (
            <div
              key={task.id}
              onClick={() => handleToggleTask(task.id)}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                task.completed
                  ? 'bg-[#fed9b7]/10 border-[#fed9b7]/40 opacity-75 line-through'
                  : 'bg-[#fdfcdc] border-[#fed9b7] shadow-sm hover:border-[#00afb9]'
              }`}
            >
              <div className="flex items-center gap-3">
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-[#00afb9] shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-[#0081a7]/40 shrink-0" />
                )}
                <span className={`text-xs md:text-sm font-medium ${task.completed ? 'text-[#0081a7]/60' : 'text-[#0081a7]'}`}>
                  {task.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Modal */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0081a7]/50 backdrop-blur-md p-4">
          <div className="bg-[#fdfcdc] border border-[#fed9b7] rounded-3xl p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-[#00afb9] text-[#fdfcdc] flex items-center justify-center mx-auto shadow-md">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-[#f07167] mb-1">
                Session Completed Successfully
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#0081a7]">
                {currentSession.moduleName}
              </h2>
              <p className="font-sans text-sm text-[#0081a7]/80 mt-2">
                {currentSession.topic}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-[#fed9b7]/20 p-4 rounded-2xl border border-[#fed9b7]">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#0081a7]/70">Planned Duration</div>
                <div className="font-serif text-xl font-bold text-[#0081a7]">{currentSession.plannedMinutes} mins</div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#0081a7]/70">Actual Duration</div>
                <div className="font-serif text-xl font-bold text-[#00afb9]">
                  {Math.floor(currentSession.elapsedSeconds / 60)}m {currentSession.elapsedSeconds % 60}s
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#0081a7]/70">Overtime</div>
                <div className="font-serif text-xl font-bold text-[#f07167]">
                  {Math.floor(currentSession.overtimeSeconds / 60)}m {currentSession.overtimeSeconds % 60}s
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-[#0081a7]/70">Tasks Finished</div>
                <div className="font-serif text-xl font-bold text-[#0081a7]">
                  {completedTasksCount} / {tasks.length}
                </div>
              </div>
            </div>

            <button
              onClick={confirmFinishAndExit}
              className="w-full py-4 rounded-2xl bg-[#0081a7] text-[#fdfcdc] font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#0081a7]/90 transition-all cursor-pointer"
            >
              Return to Command Center
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
