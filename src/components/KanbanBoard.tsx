import React from 'react';
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Task, TaskStatus, Priority } from '../types';
import { TaskCard } from './TaskCard';
import { triggerTaskCompletionEffect } from '../lib/celebrate';

interface KanbanBoardProps {
  tasks: Task[];
  onToggleStatus: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onNewTaskInColumn: (status: TaskStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onToggleStatus,
  onEdit,
  onDelete,
  onMoveTask,
  onNewTaskInColumn,
}) => {
  const columns: { id: TaskStatus; title: string; color: string; desc: string }[] = [
    {
      id: 'todo',
      title: 'To Do',
      color: 'bg-slate-500',
      desc: 'Pending backlog & imported tasks',
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      color: 'bg-indigo-500',
      desc: 'Currently executing items',
    },
    {
      id: 'completed',
      title: 'Completed',
      color: 'bg-emerald-500',
      desc: 'Verified & done',
    },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      if (targetStatus === 'completed') {
        triggerTaskCompletionEffect();
      }
      onMoveTask(taskId, targetStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className="flex flex-col bg-slate-50/70 dark:bg-zinc-900/60 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 min-h-[550px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/70 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.color}`}></span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {col.title}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-semibold font-mono">
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => onNewTaskInColumn(col.id)}
                title={`Add task to ${col.title}`}
                className="p-1 rounded-md text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Tasks list */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="h-40 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600 text-xs text-center p-4">
                  <span>No tasks in this column</span>
                  <span className="text-[11px] mt-1 text-slate-400/80">
                    Drag tasks here or click + above
                  </span>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', task.id);
                    }}
                    className="relative group"
                  >
                    <TaskCard
                      task={task}
                      onToggleStatus={onToggleStatus}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />

                    {/* Quick Move Arrows */}
                    <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity z-10 bg-white/90 dark:bg-zinc-800/90 rounded-md p-0.5 border border-slate-200 dark:border-zinc-700 shadow-xs">
                      {col.id !== 'todo' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const prevStatus: TaskStatus =
                              col.id === 'completed' ? 'in_progress' : 'todo';
                            onMoveTask(task.id, prevStatus);
                          }}
                          title="Move Left"
                          className="p-1 text-slate-500 hover:text-indigo-600 rounded-sm"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      )}

                      {col.id !== 'completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextStatus: TaskStatus =
                              col.id === 'todo' ? 'in_progress' : 'completed';
                            if (nextStatus === 'completed') {
                              triggerTaskCompletionEffect();
                            }
                            onMoveTask(task.id, nextStatus);
                          }}
                          title="Move Right"
                          className="p-1 text-slate-500 hover:text-indigo-600 rounded-sm"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
