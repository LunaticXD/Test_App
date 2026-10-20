import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckSquare,
  LayoutGrid,
  TrendingUp,
  FolderSync,
  Sparkles,
  Layers,
  Palette,
  Moon,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import type { ActiveFeature } from './Sidebar';
import type { ThemeMode } from '../types';
import { THEME_LABELS } from '../lib/theme';

interface HomeScreenProps {
  theme: ThemeMode;
  tasksCount: { total: number; todo: number; inProgress: number; completed: number };
  connectedAppsCount: number;
  onNavigate: (feature: ActiveFeature) => void;
  onNewTask: () => void;
  onOpenCommandPalette: () => void;
}

const SLIDES = [
  { src: '/images/night-city-1.jpg', caption: 'NIGHT CITY // DISTRICT 01' },
  { src: '/images/night-city-2.jpg', caption: 'NIGHT CITY // DISTRICT 02' },
  { src: '/images/night-city-3.jpg', caption: 'NIGHT CITY // DISTRICT 03' },
];

const TILES: Array<{
  id: ActiveFeature;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'tasks', title: 'Tasks Tracker', desc: 'Create, filter and complete tasks', icon: CheckSquare },
  { id: 'kanban', title: 'Kanban Board', desc: 'Drag tasks across the flow', icon: LayoutGrid },
  { id: 'analytics', title: 'Velocity & Stats', desc: 'Streaks, burndown and history', icon: TrendingUp },
  { id: 'organizer', title: 'File Organizer', desc: 'Sort files by type and date', icon: FolderSync },
  { id: 'hover_window', title: 'Hover Sorting Lab', desc: 'Drop tasks and files on the HUD', icon: Sparkles },
  { id: 'connectors', title: 'Connected Apps', desc: 'VS Code, Claude, Git, Gmail, Classroom', icon: Layers },
  { id: 'themes', title: 'Cyber Themes', desc: 'Switch the look of every page', icon: Palette },
  { id: 'darkmode_sync', title: 'Dark Mode Sync', desc: 'Export dark mode to your apps', icon: Moon },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  theme,
  tasksCount,
  connectedAppsCount,
  onNavigate,
  onNewTask,
  onOpenCommandPalette,
}) => {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000);
    return () => window.clearInterval(id);
  }, [paused]);

  const go = (delta: number) => setSlide((s) => (s + delta + SLIDES.length) % SLIDES.length);
  const pct = tasksCount.total ? Math.round((tasksCount.completed / tasksCount.total) * 100) : 0;

  const stats = [
    { label: 'Total tasks', value: tasksCount.total },
    { label: 'In progress', value: tasksCount.inProgress },
    { label: 'Completed', value: `${tasksCount.completed} (${pct}%)` },
    { label: 'Apps linked', value: connectedAppsCount },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Hero carousel */}
      <section
        className="relative rounded-3xl overflow-hidden border border-[color:var(--accent)]/30 min-h-[280px] sm:min-h-[380px] bg-black"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={slide}
            src={SLIDES[slide].src}
            alt={SLIDES[slide].caption}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 w-full h-full object-cover hero-drift"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col justify-end h-full min-h-[280px] sm:min-h-[380px] p-5 sm:p-8 gap-3">
          <span className="text-[10px] tracking-[0.3em] text-[color:var(--secondary)] font-bold">
            {SLIDES[slide].caption} • THEME: {THEME_LABELS[theme].toUpperCase()}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            CYBER<span className="text-[color:var(--accent)]">SPACE</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-200 max-w-xl">
            Tasks, files and apps in one neon-lit command deck. Offline-first, synced to the cloud,
            with an AI-powered hover window for sorting what you drop.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={onNewTask}
              className="px-4 py-2 rounded-xl bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)] text-[color:var(--accent-ink)] text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" /> New Task
            </button>
            <button
              onClick={() => onNavigate('tasks')}
              className="px-4 py-2 rounded-xl bg-black/60 border border-[color:var(--accent)]/50 text-[color:var(--accent)] hover:bg-[color:var(--accent)]/15 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              Open Tasks <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenCommandPalette}
              className="px-4 py-2 rounded-xl bg-black/60 border border-zinc-600 text-zinc-200 hover:border-[color:var(--accent)] text-xs font-bold cursor-pointer"
            >
              Search / Jump (Ctrl K)
            </button>
          </div>
        </div>

        {/* Carousel controls */}
        <button
          onClick={() => go(-1)}
          aria-label="Previous image"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 border border-zinc-600 text-white hover:border-[color:var(--accent)] flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => go(1)}
          aria-label="Next image"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 border border-zinc-600 text-white hover:border-[color:var(--accent)] flex items-center justify-center cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <div className="absolute bottom-3 right-4 z-20 flex gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              aria-label={`Show image ${i + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                i === slide ? 'w-6 bg-[color:var(--accent)]' : 'w-2 bg-zinc-500'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800">
            <p className="text-[10px] uppercase tracking-wider text-zinc-400">{s.label}</p>
            <p className="text-xl font-black text-[color:var(--accent)] mt-1">{s.value}</p>
          </div>
        ))}
      </section>

      {/* Navigation tiles */}
      <section>
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Jump to</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TILES.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => onNavigate(t.id)}
                className="group text-left p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 hover:border-[color:var(--accent)]/60 hover:bg-[color:var(--accent)]/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-[color:var(--accent)]" />
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[color:var(--accent)]" />
                </div>
                <p className="text-sm font-bold text-white">{t.title}</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">{t.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
