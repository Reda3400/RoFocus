import React, { useState } from 'react';
import type { Module, Task } from '../types';
import { Plus, Play, CheckCircle2, Circle, Trash2, Sparkles } from 'lucide-react';
import { DurationPicker } from './DurationPicker';

interface ModulesViewProps {
  modules: Module[];
  onAddModule: (module: Omit<Module, 'id' | 'createdAt'>) => void;
  onUpdateModule: (module: Module) => void;
  onDeleteModule: (id: string) => void;
  onStartSession: (module: Module, plannedMinutes: number) => void;
  soundEnabled: boolean;
}

export const ModulesView: React.FC<ModulesViewProps> = ({
  modules,
  onAddModule,
  onUpdateModule,
  onDeleteModule,
  onStartSession,
  soundEnabled
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(modules[0] || null);

  const [newName, setNewName] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTasksInput, setNewTasksInput] = useState('');

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [sessionTargetModule, setSessionTargetModule] = useState<Module | null>(null);
  const [pickHours, setPickHours] = useState(1);
  const [pickMinutes, setPickMinutes] = useState(30);

  const handleOpenPicker = (mod: Module) => {
    setSessionTargetModule(mod);
    setIsPickerOpen(true);
  };

  const handleConfirmDuration = () => {
    if (!sessionTargetModule) return;
    const totalMinutes = pickHours * 60 + pickMinutes;
    if (totalMinutes <= 0) return;
    setIsPickerOpen(false);
    onStartSession(sessionTargetModule, totalMinutes);
  };

  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newTopic.trim()) return;

    const taskTitles = newTasksInput
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const tasks: Task[] = taskTitles.map((title, idx) => ({
      id: `task_${Date.now()}_${idx}`,
      title,
      completed: false,
      priority: 'medium',
      estimatedMinutes: 25
    }));

    const newMod: Omit<Module, 'id' | 'createdAt'> = {
      name: newName,
      topic: newTopic,
      description: newDescription,
      objectives: ['Master core concepts', 'Complete hands-on practice'],
      tasks,
      color: '#00afb9'
    };

    onAddModule(newMod);
    setNewName('');
    setNewTopic('');
    setNewDescription('');
    setNewTasksInput('');
    setIsCreating(false);
  };

  const toggleTaskCompletion = (mod: Module, taskId: string) => {
    const updatedTasks = mod.tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const updatedMod = { ...mod, tasks: updatedTasks };
    onUpdateModule(updatedMod);
    if (selectedModule?.id === mod.id) {
      setSelectedModule(updatedMod);
    }
  };

  const deleteTask = (mod: Module, taskId: string) => {
    const updatedTasks = mod.tasks.filter(t => t.id !== taskId);
    const updatedMod = { ...mod, tasks: updatedTasks };
    onUpdateModule(updatedMod);
    if (selectedModule?.id === mod.id) {
      setSelectedModule(updatedMod);
    }
  };

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const addNewTaskToSelected = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || !newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      completed: false,
      priority: 'medium',
      estimatedMinutes: 25
    };

    const updatedMod = {
      ...selectedModule,
      tasks: [...selectedModule.tasks, newTask]
    };

    onUpdateModule(updatedMod);
    setSelectedModule(updatedMod);
    setNewTaskTitle('');
  };

  return (
    <div data-reveal className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#0081a7]/10 pb-6">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-[#f07167] mb-1">
            Curated Study Paths
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#0081a7]">
            Study Modules & Objectives
          </h1>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#00afb9] text-[#fdfcdc] font-medium text-xs tracking-wider uppercase shadow-sm hover:bg-[#00afb9]/90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#fed9b7]" />
          Create New Module
        </button>
      </div>

      {/* Create Module Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0081a7]/40 backdrop-blur-sm p-4">
          <div className="bg-[#fdfcdc] border border-[#fed9b7] rounded-3xl p-8 max-w-xl w-full shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-[#0081a7] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#f07167]" />
                Create Study Module
              </h2>
              <button
                onClick={() => setIsCreating(false)}
                className="text-sm font-mono text-[#0081a7]/60 hover:text-[#0081a7] cursor-pointer"
              >
                ✕ ESC
              </button>
            </div>

            <form onSubmit={handleCreateModule} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#0081a7] mb-1">
                  Module Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Systems Architecture"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#fed9b7]/20 border border-[#fed9b7] text-[#0081a7] focus:outline-none focus:border-[#00afb9]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#0081a7] mb-1">
                  Topic / Sub-focus
                </label>
                <input
                  type="text"
                  placeholder="e.g. Raft Consensus Algorithm"
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#fed9b7]/20 border border-[#fed9b7] text-[#0081a7] focus:outline-none focus:border-[#00afb9]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#0081a7] mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Briefly describe the study goals..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-[#fed9b7]/20 border border-[#fed9b7] text-[#0081a7] focus:outline-none focus:border-[#00afb9]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#0081a7] mb-1">
                  Initial Tasks (one per line)
                </label>
                <textarea
                  placeholder="Read Raft paper section 1&#10;Implement leader election state machine&#10;Write unit tests for log replication"
                  value={newTasksInput}
                  onChange={e => setNewTasksInput(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-[#fed9b7]/20 border border-[#fed9b7] text-[#0081a7] focus:outline-none focus:border-[#00afb9]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider text-[#0081a7] hover:bg-[#fed9b7]/40 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#00afb9] text-[#fdfcdc] text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#00afb9]/90 cursor-pointer"
                >
                  Save Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Grid: Module List & Selected Module Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Module List */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="font-mono text-xs uppercase tracking-wider text-[#0081a7]/70">
            All Modules ({modules.length})
          </div>
          <div className="flex flex-col gap-3">
            {modules.map(mod => {
              const isSelected = selectedModule?.id === mod.id;
              const completedCount = mod.tasks.filter(t => t.completed).length;
              const totalCount = mod.tasks.length;

              return (
                <div
                  key={mod.id}
                  onClick={() => setSelectedModule(mod)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 ${
                    isSelected
                      ? 'bg-[#fed9b7]/40 border-[#00afb9] shadow-sm'
                      : 'bg-[#fed9b7]/10 border-[#fed9b7] hover:bg-[#fed9b7]/25'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00afb9]"></span>
                    <span className="font-mono text-xs text-[#0081a7]/60">
                      {completedCount}/{totalCount} completed
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#0081a7]">
                      {mod.name}
                    </h3>
                    <p className="font-sans text-xs font-medium text-[#f07167] mt-0.5">
                      {mod.topic}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Module Details */}
        <div className="lg:col-span-8">
          {selectedModule ? (
            <div className="bg-[#fed9b7]/15 border border-[#fed9b7] rounded-3xl p-8 flex flex-col gap-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-[#0081a7]/10 pb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00afb9]"></span>
                    <span className="font-mono text-xs uppercase tracking-widest text-[#f07167]">
                      Active Module
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-[#0081a7]">
                    {selectedModule.name}
                  </h2>
                  <p className="font-sans text-sm font-semibold text-[#00afb9] mt-1">
                    {selectedModule.topic}
                  </p>
                  <p className="font-sans text-sm text-[#0081a7]/80 mt-2">
                    {selectedModule.description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenPicker(selectedModule)}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0081a7] text-[#fdfcdc] font-bold text-xs uppercase tracking-wider shadow-sm hover:bg-[#0081a7]/90 transition-all cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Start Session
                  </button>
                  <button
                    onClick={() => {
                      onDeleteModule(selectedModule.id);
                      const remaining = modules.filter(m => m.id !== selectedModule.id);
                      setSelectedModule(remaining[0] || null);
                    }}
                    className="delete-action delete-module"
                    title="Delete this module and all of its tasks"
                    aria-label={`Delete module ${selectedModule.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete module
                  </button>
                </div>
              </div>

              {/* Tasks Section */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl font-bold text-[#0081a7]">
                    Module Tasks ({selectedModule.tasks.filter(t => t.completed).length} / {selectedModule.tasks.length})
                  </h3>
                </div>

                <form onSubmit={addNewTaskToSelected} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Add a new task to this module..."
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-[#fdfcdc] border border-[#fed9b7] text-[#0081a7] text-xs focus:outline-none focus:border-[#00afb9]"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-[#00afb9] text-[#fdfcdc] text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#00afb9]/90 cursor-pointer"
                  >
                    Add Task
                  </button>
                </form>

                <div className="flex flex-col gap-3 mt-2">
                  {selectedModule.tasks.length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#0081a7]/60 font-mono">
                      No tasks defined yet. Add one above.
                    </div>
                  ) : (
                    selectedModule.tasks.map(task => (
                      <div
                        key={task.id}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                          task.completed
                            ? 'bg-[#fed9b7]/10 border-[#fed9b7]/50 opacity-75 line-through'
                            : 'bg-[#fdfcdc] border-[#fed9b7] shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            type="button"
                            onClick={() => toggleTaskCompletion(selectedModule, task.id)}
                            className="text-[#00afb9] hover:text-[#0081a7] cursor-pointer"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-[#00afb9]" />
                            ) : (
                              <Circle className="w-5 h-5 text-[#0081a7]/40" />
                            )}
                          </button>
                          <span className={`text-xs md:text-sm font-medium ${task.completed ? 'text-[#0081a7]/60' : 'text-[#0081a7]'}`}>
                            {task.title}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteTask(selectedModule, task.id)}
                          className="delete-action delete-task"
                          title="Delete task"
                          aria-label={`Delete task ${task.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#fed9b7]/15 border border-[#fed9b7] rounded-3xl p-12 text-center text-[#0081a7]/70 font-mono">
              Select a module or create a new one to begin.
            </div>
          )}
        </div>
      </div>

      {/* Duration Picker Modal */}
      {isPickerOpen && sessionTargetModule && (
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
                  {sessionTargetModule.name}
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
