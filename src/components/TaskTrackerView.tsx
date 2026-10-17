import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  Sparkles,
  ArrowUpDown,
  Tag,
  Code,
  Bot,
  GitPullRequest,
  Mail,
  GraduationCap,
  AlertCircle,
  FolderTree,
  Calendar,
} from 'lucide-react';
import { Task, Priority, TaskStatus, AppSource } from '../types';
import { TaskCard } from './TaskCard';
import { soundFX } from '../lib/audio';

interface TaskTrackerViewProps {
  tasks: Task[];
  onToggleStatus: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onOpenNewTaskModal: () => void;
  onOpenHoverWindow: () => void;
  existingProjects: string[];
}

export const TaskTrackerView: React.FC<TaskTrackerViewProps> = ({
  tasks,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  onToggleSubtask,
  onOpenNewTaskModal,
  onOpenHoverWindow,
  existingProjects,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedSource, setSelectedSource] = useState<AppSource | 'all'>('all');
  const [sortBy, setSortBy] = useState<'due' | 'priority' | 'newest'>('due');

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        if (selectedProject !== 'all' && t.project !== selectedProject) return false;
        if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
        if (selectedSource !== 'all' && (t.source || 'manual') !== selectedSource) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = t.title.toLowerCase().includes(q);
          const matchesDesc = t.description.toLowerCase().includes(q);
          const matchesProject = t.project.toLowerCase().includes(q);
          const matchesTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesProject && !matchesTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return b.createdAt - a.createdAt;
        }
        if (sortBy === 'priority') {
          const pOrder: Record<Priority, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
          return pOrder[a.priority] - pOrder[b.priority];
        }
        // By due date
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [tasks, statusFilter, selectedProject, selectedPriority, selectedSource, searchQuery, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const todo = tasks.filter((t) => t.status === 'todo').length;
    const urgent = tasks.filter((t) => t.priority === 'Urgent' && t.status !== 'completed').length;
    return { total, completed, inProgress, todo, urgent };
  }, [tasks]);

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden box-border">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/80 border border-[#fcee0a]/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-zinc-400">
              Total Tasks
            </span>
            <p className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
              {stats.total}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/80 border border-cyan-500/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-zinc-400">
              In Progress
            </span>
            <p className="text-xl sm:text-2xl font-black text-cyan-400 font-mono mt-0.5">
              {stats.inProgress}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/80 border border-rose-500/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-zinc-400">
              Urgent Critical
            </span>
            <p className="text-xl sm:text-2xl font-black text-rose-400 font-mono mt-0.5">
              {stats.urgent}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/80 border border-emerald-500/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs font-mono font-bold uppercase text-zinc-400">
              Completed
            </span>
            <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-0.5">
              {stats.completed}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Action Buttons */}
      <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, tags, projects, or source..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-hidden focus:border-[#fcee0a] font-mono transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundFX.playBlip();
                onOpenHoverWindow();
              }}
              title="Open Draggable AI Hover Window"
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">HUD Window</span>
            </button>

            <button
              onClick={() => {
                soundFX.playBlip();
                onOpenNewTaskModal();
              }}
              className="px-4 py-2 rounded-xl bg-[#fcee0a] hover:bg-[#ffea00] text-black font-black font-mono text-xs flex items-center gap-1.5 shadow-md shadow-[#fcee0a]/20 transition-all cursor-pointer border border-black"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-900 text-xs font-mono">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/80 overflow-x-auto max-w-full">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'todo', label: 'To Do' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'completed', label: 'Completed' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  soundFX.playBlip();
                  setStatusFilter(st.id);
                }}
                className={`px-2.5 py-1 rounded-lg transition-all text-xs cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-[#fcee0a] text-black font-black shadow-xs'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Project Filter */}
            <select
              value={selectedProject}
              onChange={(e) => {
                soundFX.playBlip();
                setSelectedProject(e.target.value);
              }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-hidden focus:border-[#fcee0a] cursor-pointer"
            >
              <option value="all">All Projects</option>
              {existingProjects.map((proj) => (
                <option key={proj} value={proj}>
                  {proj}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => {
                soundFX.playBlip();
                setSelectedPriority(e.target.value as Priority | 'all');
              }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-hidden focus:border-[#fcee0a] cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Source Filter */}
            <select
              value={selectedSource}
              onChange={(e) => {
                soundFX.playBlip();
                setSelectedSource(e.target.value as AppSource | 'all');
              }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-hidden focus:border-[#fcee0a] cursor-pointer"
            >
              <option value="all">All Sources</option>
              <option value="manual">Manual</option>
              <option value="drop_window">HUD Drop Window</option>
              <option value="vscode">VS Code</option>
              <option value="claude">Claude</option>
              <option value="git">Git</option>
              <option value="gmail">Gmail</option>
              <option value="classroom">Google Classroom</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => {
                soundFX.playBlip();
                setSortBy(e.target.value as any);
              }}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-hidden focus:border-[#fcee0a] cursor-pointer"
            >
              <option value="due">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="newest">Sort: Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <CheckCircle2 className="w-6 h-6 text-[#fcee0a]" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white font-mono">
              No matching tasks found
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto font-mono">
              Try adjusting your search queries or filters, drop a task into the Hover Window, or create a new task.
            </p>
            <button
              onClick={() => {
                soundFX.playBlip();
                onOpenNewTaskModal();
              }}
              className="px-4 py-2 rounded-xl bg-[#fcee0a] text-black font-black font-mono text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Create New Task
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleStatus={onToggleStatus}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onToggleSubtask={onToggleSubtask}
            />
          ))
        )}
      </div>
    </div>
  );
};
