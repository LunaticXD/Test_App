import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Tag,
  CheckCircle2,
  RefreshCw,
  FolderTree,
  Flame,
} from 'lucide-react';
import { Task, Priority, TaskStatus, Subtask } from '../types';
import { categorizeTaskWithAI } from '../lib/gemini';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSave: (task: Task) => void;
  existingProjects: string[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  task,
  onSave,
  existingProjects,
}) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [project, setProject] = useState(task?.project || existingProjects[0] || 'Frontend');
  const [customProject, setCustomProject] = useState('');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'Medium');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'todo');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>(task?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isRefiningAI, setIsRefiningAI] = useState(false);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([
      ...subtasks,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    const clean = newTagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleRefineWithAI = async () => {
    if (!title && !description) return;
    setIsRefiningAI(true);
    try {
      const promptText = `${title}\n${description}`;
      const aiResult = await categorizeTaskWithAI(promptText, existingProjects);

      if (aiResult.title) setTitle(aiResult.title);
      if (aiResult.description) setDescription(aiResult.description);
      if (aiResult.project) setProject(aiResult.project);
      if (aiResult.priority) setPriority(aiResult.priority);
      if (aiResult.tags && aiResult.tags.length > 0) setTags(aiResult.tags);
      if (aiResult.suggestedSubtasks && aiResult.suggestedSubtasks.length > 0) {
        setSubtasks(
          aiResult.suggestedSubtasks.map((st, i) => ({
            id: `ai-sub-${Date.now()}-${i}`,
            title: st,
            completed: false,
          }))
        );
      }
    } catch (err) {
      console.error('Refine error:', err);
    } finally {
      setIsRefiningAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalProject = customProject.trim() || project;

    const savedTask: Task = {
      id: task?.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      description: description.trim(),
      project: finalProject,
      priority,
      status,
      dueDate: dueDate || undefined,
      tags,
      subtasks,
      source: task?.source || 'manual',
      sourceDetails: task?.sourceDetails,
      createdAt: task?.createdAt || Date.now(),
      updatedAt: Date.now(),
      completedAt: status === 'completed' ? (task?.completedAt || Date.now()) : undefined,
      estimatedMinutes: task?.estimatedMinutes || 30,
    };

    onSave(savedTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {task ? 'Edit Task' : 'Create New Task'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-4">
          {/* Title with AI Assistant Button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Task Title *
              </label>
              <button
                type="button"
                disabled={isRefiningAI || (!title && !description)}
                onClick={handleRefineWithAI}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 disabled:opacity-50"
              >
                {isRefiningAI ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-amber-500" />
                )}
                {isRefiningAI ? 'Refining with Gemini...' : 'Enhance with AI'}
              </button>
            </div>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Fix WebSocket heartbeat timeout in production"
              className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
              Description & Context
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key context, links, or criteria..."
              className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Priority & Status Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Urgent">🔥 Urgent (Critical)</option>
                <option value="High">⚡ High</option>
                <option value="Medium">🔷 Medium</option>
                <option value="Low">💤 Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="todo">📋 To Do</option>
                <option value="in_progress">⏳ In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          </div>

          {/* Project & Due Date Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                Project Category
              </label>
              <select
                value={project}
                onChange={(e) => {
                  setProject(e.target.value);
                  if (e.target.value !== '__new__') setCustomProject('');
                }}
                className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {existingProjects.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
                <option value="__new__">+ New Project...</option>
              </select>
              {project === '__new__' && (
                <input
                  type="text"
                  placeholder="Type new project name..."
                  value={customProject}
                  onChange={(e) => setCustomProject(e.target.value)}
                  className="mt-1.5 w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
              Subtasks & Checklist ({subtasks.filter((s) => s.completed).length}/{subtasks.length})
            </label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto mb-2">
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60 text-xs"
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={() => handleToggleSubtask(st.id)}
                      className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span
                      className={`truncate ${
                        st.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-zinc-200'
                      }`}
                    >
                      {st.title}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add subtask step..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-800 dark:text-white rounded-lg text-xs font-semibold"
              >
                Add
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-200 dark:border-indigo-800 flex items-center gap-1"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-500"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag (e.g. backend, priority)..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-600 text-slate-800 dark:text-white rounded-lg text-xs font-semibold"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
