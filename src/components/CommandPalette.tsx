import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Sparkles,
  FolderSync,
  Moon,
  Layers,
  Plus,
  RefreshCw,
  ArrowRight,
  Home as HomeIcon,
  CheckSquare,
  LayoutGrid,
  TrendingUp,
  Palette,
} from 'lucide-react';
import { Task } from '../types';
import type { ActiveFeature } from './Sidebar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  onNavigate: (feature: ActiveFeature) => void;
  onNewTask: () => void;
  onToggleHoverWindow: () => void;
  onOpenThemeModal: () => void;
  onOpenConnectors: () => void;
  onManualSync: () => void;
}

interface PaletteItem {
  id: string;
  group: 'Go to' | 'Actions' | 'Tasks';
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  onSelectTask,
  onNavigate,
  onNewTask,
  onToggleHoverWindow,
  onOpenThemeModal,
  onOpenConnectors,
  onManualSync,
}) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelected(0);
    }
  }, [isOpen]);

  const items = useMemo<PaletteItem[]>(() => {
    const go = (feature: ActiveFeature) => () => onNavigate(feature);
    const icon = 'w-4 h-4 text-[color:var(--accent)]';
    const base: PaletteItem[] = [
      { id: 'go-home', group: 'Go to', label: 'Home', icon: <HomeIcon className={icon} />, run: go('home') },
      { id: 'go-tasks', group: 'Go to', label: 'Tasks Tracker', icon: <CheckSquare className={icon} />, run: go('tasks') },
      { id: 'go-kanban', group: 'Go to', label: 'Kanban Board', icon: <LayoutGrid className={icon} />, run: go('kanban') },
      { id: 'go-analytics', group: 'Go to', label: 'Velocity & Stats', icon: <TrendingUp className={icon} />, run: go('analytics') },
      { id: 'go-organizer', group: 'Go to', label: 'File Organizer', icon: <FolderSync className={icon} />, run: go('organizer') },
      { id: 'go-hud', group: 'Go to', label: 'Hover Sorting Lab', icon: <Sparkles className={icon} />, run: go('hover_window') },
      { id: 'go-apps', group: 'Go to', label: 'Connected Apps', icon: <Layers className={icon} />, run: go('connectors') },
      { id: 'go-themes', group: 'Go to', label: 'Cyber Themes', icon: <Palette className={icon} />, run: go('themes') },
      { id: 'go-dark', group: 'Go to', label: 'Dark Mode Sync', icon: <Moon className={icon} />, run: go('darkmode_sync') },
      { id: 'act-new', group: 'Actions', label: 'Create New Task...', hint: 'N', icon: <Plus className={icon} />, run: onNewTask },
      { id: 'act-hud', group: 'Actions', label: 'Toggle HUD Hover Window', hint: 'H', icon: <Sparkles className={icon} />, run: onToggleHoverWindow },
      { id: 'act-apps', group: 'Actions', label: 'Configure App Integrations', icon: <Layers className={icon} />, run: onOpenConnectors },
      { id: 'act-theme', group: 'Actions', label: 'Open Theme & Dark Mode Exporter', icon: <Moon className={icon} />, run: onOpenThemeModal },
      { id: 'act-sync', group: 'Actions', label: 'Force Cloud Sync', icon: <RefreshCw className={icon} />, run: onManualSync },
    ];

    const q = query.trim().toLowerCase();
    if (!q) return base;

    const matchingCommands = base.filter((c) => c.label.toLowerCase().includes(q));
    const matchingTasks: PaletteItem[] = tasks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.project.toLowerCase().includes(q) ||
          (t.tags ?? []).some((tag) => tag.toLowerCase().includes(q))
      )
      .slice(0, 12)
      .map((t) => ({
        id: `task-${t.id}`,
        group: 'Tasks' as const,
        label: t.title,
        hint: `${t.project} • ${t.priority} • ${String(t.status).replace('_', ' ')}`,
        icon: <CheckSquare className={icon} />,
        run: () => onSelectTask(t),
      }));
    return [...matchingCommands, ...matchingTasks];
  }, [query, tasks, onNavigate, onNewTask, onToggleHoverWindow, onOpenConnectors, onOpenThemeModal, onManualSync, onSelectTask]);

  useEffect(() => {
    setSelected((prev) => Math.min(prev, Math.max(items.length - 1, 0)));
  }, [items.length]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${selected}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  if (!isOpen) return null;

  const runItem = (item: PaletteItem | undefined) => {
    if (!item) return;
    onClose();
    item.run();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => (items.length ? (s + 1) % items.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => (items.length ? (s - 1 + items.length) % items.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runItem(items[selected]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  let lastGroup = '';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center pt-20 p-4 bg-black/70 backdrop-blur-xs"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-zinc-900 border border-[color:var(--accent)]/40 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] font-mono">
        <div className="flex items-center px-4 py-3 border-b border-zinc-800 gap-3">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search tasks or jump to a page / command..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="text-xs px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
          >
            ESC
          </button>
        </div>

        <div ref={listRef} className="p-2 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-xs text-zinc-500 p-6 text-center">Nothing matches "{query}".</p>
          ) : (
            items.map((item, index) => {
              const showHeader = item.group !== lastGroup;
              lastGroup = item.group;
              const isActive = index === selected;
              return (
                <React.Fragment key={item.id}>
                  {showHeader && (
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 pt-2 pb-1">
                      {item.group}
                    </p>
                  )}
                  <button
                    data-index={index}
                    onMouseEnter={() => setSelected(index)}
                    onClick={() => runItem(item)}
                    className={`w-full px-3 py-2 rounded-xl flex items-center justify-between text-xs text-left transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[color:var(--accent)]/15 text-white ring-1 ring-[color:var(--accent)]/40'
                        : 'text-zinc-200 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.icon}
                      <span className="font-medium truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pl-2">
                      {item.hint && <span className="text-[10px] text-zinc-500">{item.hint}</span>}
                      <ArrowRight
                        className={`w-3.5 h-3.5 ${isActive ? 'text-[color:var(--accent)]' : 'text-zinc-600'}`}
                      />
                    </div>
                  </button>
                </React.Fragment>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 border-t border-zinc-800 bg-black/40 flex items-center justify-between text-[11px] text-zinc-500">
          <span>↑ ↓ to move • Enter to run</span>
          <span>Ctrl/Cmd + K</span>
        </div>
      </div>
    </div>
  );
};
