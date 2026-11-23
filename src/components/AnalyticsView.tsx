import type { StudySession } from '../types';
import { BarChart2, Clock, Award, CheckCircle2, Calendar } from 'lucide-react';

interface AnalyticsViewProps {
  history: StudySession[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ history }) => {
  const completedSessions = history.filter(s => s.status === 'completed');
  const totalMinutes = completedSessions.reduce((acc, s) => acc + Math.floor(s.elapsedSeconds / 60), 0);
  const totalOvertimeMinutes = completedSessions.reduce((acc, s) => acc + Math.floor(s.overtimeSeconds / 60), 0);

  return (
    <div data-reveal className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-[#0081a7]/10 pb-6">
        <div className="font-mono text-xs uppercase tracking-widest text-[#f07167] mb-1">
          Performance & Consistency
        </div>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#0081a7]">
          Session Analytics & History
        </h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#fed9b7]/20 border border-[#fed9b7] rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#0081a7]/70 mb-4">
            <span className="font-mono text-xs uppercase tracking-wider">Completed Sessions</span>
            <Award className="w-5 h-5 text-[#f07167]" />
          </div>
          <div>
            <div className="font-serif text-4xl font-bold text-[#0081a7]">
              {completedSessions.length}
            </div>
            <p className="font-sans text-xs text-[#0081a7]/70 mt-1">Intentional study sessions finished</p>
          </div>
        </div>

        <div className="bg-[#fed9b7]/20 border border-[#fed9b7] rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#0081a7]/70 mb-4">
            <span className="font-mono text-xs uppercase tracking-wider">Total Focused Time</span>
            <Clock className="w-5 h-5 text-[#00afb9]" />
          </div>
          <div>
            <div className="font-serif text-4xl font-bold text-[#0081a7]">
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
            </div>
            <p className="font-sans text-xs text-[#0081a7]/70 mt-1">Accumulated commitment</p>
          </div>
        </div>

        <div className="bg-[#fed9b7]/20 border border-[#fed9b7] rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#0081a7]/70 mb-4">
            <span className="font-mono text-xs uppercase tracking-wider">Overtime Effort</span>
            <BarChart2 className="w-5 h-5 text-[#0081a7]" />
          </div>
          <div>
            <div className="font-serif text-4xl font-bold text-[#0081a7]">
              {Math.floor(totalOvertimeMinutes / 60)}h {totalOvertimeMinutes % 60}m
            </div>
            <p className="font-sans text-xs text-[#0081a7]/70 mt-1">Extra persistence beyond planned time</p>
          </div>
        </div>
      </div>

      {/* History Log */}
      <div className="flex flex-col gap-4">
        <h2 className="font-serif text-xl font-bold text-[#0081a7] flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#f07167]" />
          Session History Log
        </h2>

        {completedSessions.length === 0 ? (
          <div className="bg-[#fed9b7]/15 border border-[#fed9b7] rounded-3xl p-12 text-center text-[#0081a7]/70 font-mono">
            No completed study sessions recorded yet. Start a focus session to build your history!
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {completedSessions.map(session => (
              <div
                key={session.id}
                className="bg-[#fed9b7]/15 border border-[#fed9b7] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-[#00afb9] text-[#fdfcdc]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#0081a7]">
                      {session.moduleName}
                    </h3>
                    <p className="font-sans text-xs text-[#f07167] mt-0.5">
                      {session.topic}
                    </p>
                    <p className="font-mono text-[11px] text-[#0081a7]/60 mt-1">
                      {session.endTime ? new Date(session.endTime).toLocaleString() : 'Recently completed'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 sm:justify-end">
                  <div className="text-right">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#0081a7]/70">Duration</div>
                    <div className="font-serif text-base font-bold text-[#0081a7]">
                      {Math.floor(session.elapsedSeconds / 60)}m
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#0081a7]/70">Overtime</div>
                    <div className="font-serif text-base font-bold text-[#f07167]">
                      +{Math.floor(session.overtimeSeconds / 60)}m
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-[#0081a7]/70">Tasks</div>
                    <div className="font-serif text-base font-bold text-[#00afb9]">
                      {session.tasksCompleted}/{session.totalTasks}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
