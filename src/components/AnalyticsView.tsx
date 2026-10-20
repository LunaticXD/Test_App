import React from 'react';
import {
  Flame,
  CheckCircle2,
  TrendingUp,
  Clock,
  Layers,
  Award,
  Calendar,
  AlertTriangle,
  FolderTree,
} from 'lucide-react';
import { Task } from '../types';

interface AnalyticsViewProps {
  tasks: Task[];
}

// Consecutive-day streaks from the days on which at least one task was completed
function computeStreaks(completedAts: number[]): { current: number; best: number } {
  const toDayNumber = (ts: number) => {
    const d = new Date(ts);
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  };
  const days = Array.from(new Set(completedAts.map(toDayNumber))).sort((a, b) => a - b);
  if (days.length === 0) return { current: 0, best: 0 };

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i] === days[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  // The current streak is still alive if the last completion was today or yesterday
  const today = toDayNumber(Date.now());
  const last = days[days.length - 1];
  let current = 0;
  if (last === today || last === today - 1) {
    current = 1;
    for (let i = days.length - 1; i > 0 && days[i] === days[i - 1] + 1; i--) current++;
  }
  return { current, best };
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'completed');
  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const todo = tasks.filter((t) => t.status === 'todo');
  const completionRate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
  const streaks = computeStreaks(
    completed.filter((t) => t.completedAt).map((t) => t.completedAt as number)
  );
  const recentlyCompleted = [...completed].sort(
    (a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)
  );

  // Urgent pending count
  const urgentCount = tasks.filter((t) => t.priority === 'Urgent' && t.status !== 'completed').length;

  // Project breakdown
  const projectMap: Record<string, { total: number; completed: number }> = {};
  tasks.forEach((t) => {
    if (!projectMap[t.project]) {
      projectMap[t.project] = { total: 0, completed: 0 };
    }
    projectMap[t.project].total++;
    if (t.status === 'completed') {
      projectMap[t.project].completed++;
    }
  });

  // Source breakdown
  const sourceMap: Record<string, number> = {};
  tasks.forEach((t) => {
    const src = t.source || 'manual';
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });

  // Total estimated hours
  const totalMinutes = tasks.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
  const completedMinutes = completed.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);

  return (
    <div className="space-y-6">
      {/* Velocity & Streak Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completion Rate */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Completion Rate
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {completionRate}%
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              {completed.length} of {total} tasks done
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Current Active Streak */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Completion Streak
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
              {streaks.current} {streaks.current === 1 ? 'Day' : 'Days'}{' '}
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
              Personal best: {streaks.best} {streaks.best === 1 ? 'day' : 'days'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Velocity Time */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Work Velocity
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {(completedMinutes / 60).toFixed(1)}h
            </div>
            <p className="text-[11px] text-[color:var(--accent)] dark:text-[color:var(--accent)] font-medium mt-0.5">
              of {(totalMinutes / 60).toFixed(1)}h estimated
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[color:var(--accent)]/10 dark:bg-[color:var(--accent)]/10 border border-[color:var(--accent)]/40 dark:border-[color:var(--accent)]/40 flex items-center justify-center text-[color:var(--accent)] dark:text-[color:var(--accent)]">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Urgent Action Needed */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Urgent Attention
            </span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {urgentCount}
            </div>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-0.5">
              Critical priority pending
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Project Progress Bars & Source Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Burndown & Completion */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-[color:var(--accent)]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Completion by Project
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              {Object.keys(projectMap).length} Active Projects
            </span>
          </div>

          <div className="space-y-4">
            {Object.entries(projectMap).map(([proj, stat]) => {
              const pct = stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
              return (
                <div key={proj} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      {proj}
                    </span>
                    <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
                      {stat.completed} / {stat.total} done ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[color:var(--accent)] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Connected Apps Breakdown */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[color:var(--accent)]" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tasks Ingested by App Source
              </h3>
            </div>
            <span className="text-xs text-slate-400">Connected Hub</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(sourceMap).map(([src, count]) => (
              <div
                key={src}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-800/40 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white capitalize">
                    {src === 'drop_window' ? 'Hover Window' : src}
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {((count / total) * 100).toFixed(0)}% of total
                  </p>
                </div>
                <span className="text-base font-black text-[color:var(--accent)] dark:text-[color:var(--accent)]">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Completion History Log */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Recent Task Completion Log
        </h3>

        {completed.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No tasks completed yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {recentlyCompleted.slice(0, 5).map((t) => (
              <div
                key={t.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-zinc-200 line-through text-slate-500 dark:text-zinc-400">
                      {t.title}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      📁 {t.project} • {t.source || 'manual'}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                  {t.completedAt
                    ? new Date(t.completedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Done'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
