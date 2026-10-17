import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  FolderSync,
  Moon,
  Sun,
  Layers,
  Plus,
  RefreshCw,
  X,
  ArrowRight,
} from 'lucide-react';
import { Task } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onNewTask: () => void;
  onOpenOrganizer: () => void;
  onToggleHoverWindow: () => void;
  onOpenThemeModal: () => void;
  onOpenConnectors: () => void;
  onManualSync: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  onSelectTask,
  onNewTask,
  onOpenOrganizer,
  onToggleHoverWindow,
  onOpenThemeModal,
  onOpenConnectors,
  onManualSync,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Parent can control opening or trigger
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.project.toLowerCase().includes(query.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
  );

  const quickActions = [
    {
      id: 'hover',
      label: 'Open Desktop Hover Sorting Window',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      action: () => {
        onToggleHoverWindow();
        onClose();
      },
    },
    {
      id: 'organizer',
      label: 'Open Desktop File Organizer',
      icon: <FolderSync className="w-4 h-4 text-indigo-500" />,
      action: () => {
        onOpenOrganizer();
        onClose();
      },
    },
    {
      id: 'connectors',
      label: 'Connect Apps (VS Code, Claude, Git, Gmail, Classroom)',
      icon: <Layers className="w-4 h-4 text-sky-500" />,
      action: () => {
        onOpenConnectors();
        onClose();
      },
    },
    {
      id: 'theme',
      label: 'Toggle System-Wide Dark Mode Engine',
      icon: <Moon className="w-4 h-4 text-purple-500" />,
      action: () => {
        onOpenThemeModal();
        onClose();
      },
    },
    {
      id: 'sync',
      label: 'Force Cloud Storage Synchronization',
      icon: <RefreshCw className="w-4 h-4 text-emerald-500" />,
      action: () => {
        onManualSync();
        onClose();
      },
    },
    {
      id: 'new_task',
      label: 'Create New Task...',
      icon: <Plus className="w-4 h-4 text-indigo-600" />,
      action: () => {
        onNewTask();
        onClose();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-zinc-800 gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a task name, project, or command (e.g. 'Hover', 'Git', 'Organize')..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="text-xs px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            ESC
          </button>
        </div>

        <div className="p-2 overflow-y-auto space-y-3">
          {/* Quick Actions */}
          {!query && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2 py-1">
                Quick Commands
              </p>
              <div className="space-y-1">
                {quickActions.map((qa) => (
                  <button
                    key={qa.id}
                    onClick={qa.action}
                    className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs text-slate-800 dark:text-zinc-200 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      {qa.icon}
                      <span className="font-medium">{qa.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtered Tasks */}
          {query && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2 py-1">
                Matching Tasks ({filteredTasks.length})
              </p>
              {filteredTasks.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">
                  No matching tasks found.
                </p>
              ) : (
                <div className="space-y-1">
                  {filteredTasks.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTask(t);
                        onClose();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-between text-xs text-slate-800 dark:text-zinc-200 transition-colors text-left"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold truncate">{t.title}</p>
                        <span className="text-[10px] text-slate-400">
                          📁 {t.project} • {t.priority}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium shrink-0">
                        {t.status}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigation: ↑ ↓ Enter</span>
          <span>Shortcut: Cmd+K / Ctrl+K</span>
        </div>
      </div>
    </div>
  );
};
