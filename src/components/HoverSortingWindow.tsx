import React, { useState } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import {
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  CheckCircle2,
  FolderTree,
  GripHorizontal,
  Folder,
  Send,
  Move,
  CheckSquare,
  Flame,
  Tag,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Task, Priority } from '../types';
import { categorizeTaskWithAI } from '../lib/gemini';
import { soundFX } from '../lib/audio';
import { triggerTaskCompletionEffect } from '../lib/celebrate';
import { pickFolderForFile } from '../lib/routing';

interface HoverSortingWindowProps {
  isOpen: boolean;
  onClose: () => void;
  destinationFolders: string[];
  onFileRouted?: (fileName: string, targetFolder: string) => void;
  onTaskCreated?: (task: Task) => void;
}

export const HoverSortingWindow: React.FC<HoverSortingWindowProps> = ({
  isOpen,
  onClose,
  destinationFolders,
  onFileRouted,
  onTaskCreated,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [activeMode, setActiveMode] = useState<'tasks' | 'files'>('tasks');
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiStepMessage, setAiStepMessage] = useState<string>('');
  const [lastSortedResult, setLastSortedResult] = useState<any | null>(null);
  const [recentSortedList, setRecentSortedList] = useState<any[]>([]);
  // Only the header is a drag handle, so text inside the window can still be selected
  const dragControls = useDragControls();

  if (!isOpen) return null;

  const processDroppedText = async (textToProcess: string, forceMode?: 'tasks' | 'files') => {
    if (!textToProcess.trim()) return;

    soundFX.playSweep();
    setIsAnalyzing(true);

    // Auto-detect mode if text contains file extension
    const hasFileExt = /\.(pdf|png|jpg|jpeg|docx|xlsx|csv|zip|tar|ts|tsx|js|jsx|py|go|rs|md|json)$/i.test(
      textToProcess.trim()
    );
    const mode = forceMode ?? (hasFileExt ? 'files' : activeMode);

    if (mode === 'tasks') {
      setAiStepMessage('AI INFERRING PROJECT & PRIORITY FROM TASK DESCRIPTION...');
      try {
        const result = await categorizeTaskWithAI(textToProcess);

        const newTask: Task = {
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: result.title || textToProcess,
          description: result.description || textToProcess,
          project: result.project || 'Frontend',
          priority: result.priority || 'Medium',
          status: 'todo',
          tags: result.tags && result.tags.length > 0 ? result.tags : ['ai-sorted', 'hover-window'],
          subtasks: result.suggestedSubtasks && result.suggestedSubtasks.length > 0
            ? result.suggestedSubtasks.map((st: string, i: number) => ({
                id: `st-drop-${Date.now()}-${i}`,
                title: st,
                completed: false,
              }))
            : [],
          source: 'drop_window',
          sourceDetails: 'Categorized via Desktop Hovering Sorting Window',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          estimatedMinutes: result.estimatedMinutes || 30,
          aiReasoning: result.reasoning || 'Categorized automatically by CyberSpace',
        };

        const resultItem = {
          id: newTask.id,
          type: 'task',
          title: newTask.title,
          project: newTask.project,
          priority: newTask.priority,
          estimatedMinutes: newTask.estimatedMinutes,
          reason: newTask.aiReasoning,
          timestamp: Date.now(),
        };

        setLastSortedResult(resultItem);
        setRecentSortedList((prev) => [resultItem, ...prev.slice(0, 4)]);
        setInputText('');
        soundFX.playSuccess();
        triggerTaskCompletionEffect();

        if (onTaskCreated) {
          onTaskCreated(newTask);
        }
      } catch (err) {
        console.error('Task categorization error:', err);
      } finally {
        setIsAnalyzing(false);
        setAiStepMessage('');
      }
    } else {
      // File destination routing
      setAiStepMessage('SCANNING FILE DESTINATION MATRIX...');
      try {
        // Shared heuristic: matches on file kind (contract, screenshot, code...) not loose substrings
        const targetFolder = pickFolderForFile(textToProcess, destinationFolders) ?? 'Unsorted';

        const resultItem = {
          id: `routed-${Date.now()}`,
          type: 'file',
          name: textToProcess,
          destinationFolder: targetFolder,
          timestamp: Date.now(),
          reason: `Auto-routed to "${targetFolder}" based on semantic context analysis.`,
        };

        setLastSortedResult(resultItem);
        setRecentSortedList((prev) => [resultItem, ...prev.slice(0, 4)]);
        setInputText('');
        soundFX.playSuccess();
        triggerTaskCompletionEffect();
        if (onFileRouted) {
          onFileRouted(textToProcess, targetFolder);
        }
      } catch (err) {
        console.error('File routing error:', err);
      } finally {
        setIsAnalyzing(false);
        setAiStepMessage('');
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      // Route every dropped file individually
      (async () => {
        for (const f of droppedFiles) {
          await processDroppedText(f.name, 'files');
        }
      })();
      return;
    }

    const text = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
    if (text) {
      processDroppedText(text);
    }
  };

  const quickTaskPresets = [
    'Fix memory leak in socket pool and unsubscribe listeners',
    'Submit Distributed Systems Raft consensus report',
    'Update API security rate limiting with Redis tokens',
    'Review PR #142 offline IndexedDB caching sync',
  ];

  const quickFilePresets = [
    'Q3_Cyber_Contract.pdf',
    'HUD_Interface_Overlay.png',
    'neural_network_core.ts',
    'crypto_revenue_metrics.csv',
  ];

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'Urgent':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Medium':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Low':
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div style={{ position: 'fixed', top: 90, right: 30, zIndex: 60, pointerEvents: 'none' }}>
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="minimized"
            drag
            dragMomentum={false}
            dragElastic={0.1}
            whileHover={{ scale: 1.05 }}
            whileDrag={{ scale: 1.08, cursor: 'grabbing' }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            onClick={() => {
              soundFX.playBlip();
              setIsMinimized(false);
            }}
            style={{ pointerEvents: 'auto' }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full backdrop-blur-2xl border shadow-2xl cursor-grab active:cursor-grabbing transition-colors ${
              isDraggingOver
                ? 'bg-[color:var(--accent)] text-black border-[color:var(--accent)] scale-105 shadow-[color:var(--accent)]/50 ring-4 ring-[color:var(--accent)]/40'
                : 'bg-zinc-950/90 text-[color:var(--accent)] border-[color:var(--accent)]/40 hover:border-[color:var(--accent)] shadow-black/80'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[color:var(--accent)] to-cyan-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-black" />
            </div>
            <span className="text-xs font-black tracking-wider uppercase font-mono">
              HUD Hover Hub
            </span>
            <span className="w-2 h-2 rounded-full bg-[color:var(--accent)] animate-pulse"></span>
            <Move className="w-3.5 h-3.5 text-[color:var(--accent)]/80" />
            <Maximize2 className="w-3.5 h-3.5 text-zinc-400 hover:text-white" />
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0.1}
            whileDrag={{ scale: 1.01, cursor: 'grabbing', boxShadow: '0 0 35px color-mix(in srgb, var(--accent) 40%, transparent)' }}
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ pointerEvents: 'auto' }}
            className="w-[360px] sm:w-[420px] rounded-3xl bg-zinc-950/95 backdrop-blur-2xl border border-[color:var(--accent)]/40 shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[85vh] relative"
          >
            {/* Top Yellow Cyber Accent Strip */}
            <div className="h-1 w-full bg-gradient-to-r from-[color:var(--accent)] via-cyan-400 to-[color:var(--tertiary)] animate-pulse"></div>

            {/* Draggable Header */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              style={{ touchAction: 'none' }}
              className="px-4 py-3 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border-b border-[color:var(--accent)]/20 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
              title="Click and drag to move this window anywhere"
            >
              <div className="flex items-center gap-2">
                <GripHorizontal className="w-4 h-4 text-[color:var(--accent)] animate-pulse" />
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[color:var(--accent)] to-cyan-400 flex items-center justify-center text-black shadow-xs font-black">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[color:var(--accent)] flex items-center gap-1.5 tracking-wider uppercase font-mono">
                    HUD Sorting Window
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[color:var(--accent)]/20 text-[color:var(--accent)] border border-[color:var(--accent)]/30">
                      DRAGGABLE
                    </span>
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    soundFX.playBlip();
                    setIsMinimized(true);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  title="Minimize window"
                  className="p-1 rounded-lg text-zinc-400 hover:text-[color:var(--accent)] hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    soundFX.playBlip();
                    onClose();
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  title="Close window"
                  className="p-1 rounded-lg text-zinc-400 hover:text-pink-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Mode Selector Tabs (Tasks vs Files) */}
            <div className="px-4 pt-2.5 pb-1 flex items-center gap-2 border-b border-zinc-800 bg-black/40 font-mono text-xs">
              <button
                onClick={() => {
                  soundFX.playBlip();
                  setActiveMode('tasks');
                }}
                className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold ${
                  activeMode === 'tasks'
                    ? 'bg-[color:var(--accent)] text-black shadow-xs font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <CheckSquare className="w-3 h-3" />
                <span>Task AI Categorizer</span>
              </button>
              <button
                onClick={() => {
                  soundFX.playBlip();
                  setActiveMode('files');
                }}
                className={`flex-1 py-1 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer font-bold ${
                  activeMode === 'files'
                    ? 'bg-cyan-400 text-black shadow-xs font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <FolderTree className="w-3 h-3" />
                <span>File Destination</span>
              </button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto">
              {/* Droppable Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center transition-all ${
                  isDraggingOver
                    ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/10 scale-[1.02] shadow-lg shadow-[color:var(--accent)]/20'
                    : 'border-zinc-800 hover:border-[color:var(--accent)]/50 bg-zinc-900/40'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                      isDraggingOver
                        ? 'bg-[color:var(--accent)] text-black animate-bounce shadow-lg shadow-[color:var(--accent)]/40'
                        : activeMode === 'tasks'
                        ? 'bg-[color:var(--accent)]/10 border border-[color:var(--accent)]/30 text-[color:var(--accent)]'
                        : 'bg-cyan-950/60 border border-cyan-500/30 text-cyan-400'
                    }`}
                  >
                    {activeMode === 'tasks' ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <FolderTree className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white tracking-wide">
                      {isDraggingOver
                        ? 'DROP TO AUTO-CATEGORIZE WITH AI!'
                        : activeMode === 'tasks'
                        ? 'Drop task snippet or type task description'
                        : 'Drop desktop files or type file name'}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {activeMode === 'tasks'
                        ? 'AI infers project, priority, subtasks and adds to board'
                        : 'AI scans content and categorizes target destination folder'}
                    </p>
                  </div>
                </div>

                {/* Quick Input Bar */}
                <div className="mt-3 pt-3 border-t border-zinc-800 flex gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        processDroppedText(inputText);
                      }
                    }}
                    placeholder={
                      activeMode === 'tasks'
                        ? 'e.g., Fix broken auth token in backend server...'
                        : 'e.g., Q3_Report_2026.pdf...'
                    }
                    className="flex-1 bg-zinc-900/90 border border-zinc-700/80 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-hidden focus:border-[color:var(--accent)] font-mono"
                  />
                  <button
                    disabled={isAnalyzing || !inputText.trim()}
                    onClick={() => processDroppedText(inputText)}
                    className="px-3 py-1.5 bg-[color:var(--accent)] hover:bg-[color:var(--accent-hover)] text-black font-black rounded-xl text-xs flex items-center gap-1 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mb-1.5 font-mono">
                  {activeMode === 'tasks' ? 'Quick Task Samples:' : 'Quick File Samples:'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(activeMode === 'tasks' ? quickTaskPresets : quickFilePresets).map((preset, idx) => (
                    <button
                      key={idx}
                      disabled={isAnalyzing}
                      onClick={() => {
                        soundFX.playBlip();
                        processDroppedText(preset);
                      }}
                      className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-[color:var(--accent)]/20 text-zinc-300 hover:text-[color:var(--accent)] border border-zinc-800 hover:border-[color:var(--accent)]/40 transition-colors font-mono cursor-pointer truncate max-w-full text-left"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Processing Spinner */}
              {isAnalyzing && (
                <div className="p-3 rounded-xl bg-black/60 border border-[color:var(--accent)]/50 flex items-center gap-2.5 animate-pulse shadow-md">
                  <div className="w-5 h-5 rounded-full border-2 border-[color:var(--accent)] border-t-transparent animate-spin shrink-0"></div>
                  <p className="text-xs font-bold text-[color:var(--accent)] truncate font-mono">
                    {aiStepMessage}
                  </p>
                </div>
              )}

              {/* Last Categorized Result Card */}
              {lastSortedResult && !isAnalyzing && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-3 rounded-2xl bg-zinc-900/90 border border-[color:var(--accent)]/40 space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-[color:var(--accent)]">
                    <span className="flex items-center gap-1.5 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {lastSortedResult.type === 'task' ? 'TASK INFERRED & ADDED!' : 'FILE ROUTED TO FOLDER!'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">Just now</span>
                  </div>

                  {lastSortedResult.type === 'task' ? (
                    <div className="p-2.5 rounded-xl bg-black/80 border border-zinc-800 space-y-1.5">
                      <p className="text-xs font-bold text-white">
                        {lastSortedResult.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                        <span className={`px-2 py-0.5 rounded-md border font-bold ${getPriorityBadge(lastSortedResult.priority)}`}>
                          {lastSortedResult.priority}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-cyan-300">
                          📁 {lastSortedResult.project}
                        </span>
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Clock className="w-3 h-3" />
                          {lastSortedResult.estimatedMinutes}m
                        </span>
                      </div>
                      {lastSortedResult.reason && (
                        <p className="text-[10px] text-zinc-400 italic">
                          "{lastSortedResult.reason}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-black/80 border border-zinc-800">
                      <p className="text-xs font-bold text-white truncate">
                        {lastSortedResult.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-pink-400 font-mono">
                        <Folder className="w-3.5 h-3.5" />
                        <span>{lastSortedResult.destinationFolder}/</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Recent History */}
              {recentSortedList.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase mb-1 font-mono">
                    Recent AI Sort History ({recentSortedList.length})
                  </p>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {recentSortedList.map((item) => (
                      <div
                        key={item.id}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-zinc-300 truncate max-w-[170px]">
                          {item.title || item.name}
                        </span>
                        <span className="text-[10px] font-mono text-[color:var(--accent)]">
                          {item.type === 'task' ? `[${item.priority}] ${item.project}` : `📁 ${item.destinationFolder}/`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Move Hint Footer */}
            <div className="px-4 py-2 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1 text-[color:var(--accent)] font-mono text-[10px]">
                <Move className="w-3 h-3" /> Drag anywhere on desktop
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">CYBER HUD</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
