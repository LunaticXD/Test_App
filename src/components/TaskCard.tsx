import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Tag,
  Code,
  Bot,
  GitPullRequest,
  Mail,
  GraduationCap,
  Sparkles,
  MoreVertical,
  CheckSquare,
  Trash2,
  Edit2,
  ChevronRight,
} from 'lucide-react';
import { Task, Priority } from '../types';

interface TaskCardProps {
  task: Task;
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  onToggleSubtask,
}) => {
  const isDone = task.status === 'completed';

  const getPriorityStyle = (priority: Priority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/60';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60';
      case 'Medium':
        return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-900/60';
      case 'Low':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  const getSourceBadge = () => {
    switch (task.source) {
      case 'vscode':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <Code className="w-3 h-3 text-sky-500" />
            VS Code
          </span>
        );
      case 'claude':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Bot className="w-3 h-3 text-amber-500" />
            Claude
          </span>
        );
      case 'git':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
            <GitPullRequest className="w-3 h-3 text-orange-500" />
            Git PR
          </span>
        );
      case 'gmail':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <Mail className="w-3 h-3 text-rose-500" />
            Gmail
          </span>
        );
      case 'classroom':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <GraduationCap className="w-3 h-3 text-emerald-500" />
            Classroom
          </span>
        );
      case 'drop_window':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3 h-3 text-purple-500" />
            Hover Drop
          </span>
        );
      default:
        return null;
    }
  };

  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // The celebration (confetti + chime) is fired once by the app-level handler
    onToggleStatus(task.id);
  };

  return (
    <div
      onClick={() => onEdit(task)}
      className={`group relative p-4 rounded-xl border transition-all cursor-pointer select-none ${
        isDone
          ? 'bg-slate-50/70 dark:bg-zinc-900/50 border-slate-200/60 dark:border-zinc-800/60 opacity-75'
          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-xs hover:border-[color:var(--accent)]/40 dark:hover:border-[color:var(--accent)]/40 hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Completion Checkbox */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          className="mt-0.5 shrink-0 transition-transform active:scale-90 text-slate-400 hover:text-[color:var(--accent)] dark:text-zinc-500 dark:hover:text-[color:var(--accent)]"
        >
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100 dark:fill-emerald-950/80" />
          ) : (
            <Circle className="w-5 h-5 hover:stroke-[color:var(--accent)]" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4
              className={`text-sm font-semibold text-slate-900 dark:text-zinc-100 transition-colors ${
                isDone ? 'line-through text-slate-400 dark:text-zinc-500' : ''
              }`}
            >
              {task.title}
            </h4>

            {/* Quick Actions (Hover) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
            >
              <button
                onClick={() => onEdit(task)}
                className="p-1 text-slate-400 hover:text-[color:var(--accent)] dark:text-zinc-500 dark:hover:text-[color:var(--accent)] rounded-md"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-1 text-slate-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 rounded-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Subtasks summary */}
          {totalSubtasks > 0 && (
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500">
                <span className="flex items-center gap-1 font-medium">
                  <CheckSquare className="w-3 h-3 text-[color:var(--accent)]" />
                  Subtasks: {completedSubtasks}/{totalSubtasks}
                </span>
                <span>{Math.round((completedSubtasks / totalSubtasks) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[color:var(--accent)] h-full rounded-full transition-all"
                  style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Footer Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-xs">
            {/* Priority */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityStyle(
                task.priority
              )}`}
            >
              {task.priority}
            </span>

            {/* Project */}
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200/80 dark:border-zinc-700/60">
              📁 {task.project}
            </span>

            {/* App Source Badge */}
            {getSourceBadge()}

            {/* Due Date */}
            {task.dueDate && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-zinc-400 ml-auto">
                <Calendar className="w-3 h-3" />
                {task.dueDate}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
