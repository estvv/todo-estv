import { useState } from 'react';
import type { Todo } from '../../types';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: number, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onClick: () => void;
}

export function TodoItem({ todo, onUpdate, onDelete, onClick }: TodoItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    await onUpdate(todo.id, { completed: e.target.checked });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    await onDelete(todo.id);
    setIsDeleting(false);
  };

  const priorityColors = {
    low: '#a3a3a3',
    medium: '#3b82f6',
    high: '#ef4444',
  };

  const getDueDateBadge = () => {
    if (!todo.due_date) return null;

    const dueDate = new Date(todo.due_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded">
          Overdue
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">
          Today
        </span>
      );
    }
    if (diffDays === 1) {
      return (
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
          Tomorrow
        </span>
      );
    }
    if (diffDays <= 7) {
      return (
        <span className="text-xs bg-neutral-50 text-neutral-600 px-2 py-0.5 rounded">
          {diffDays} days
        </span>
      );
    }

    return (
      <span className="text-xs text-neutral-400">
        {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </span>
    );
  };

  return (
    <div
      className="border border-neutral-200 rounded-lg p-4 hover:bg-neutral-50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="mt-1 w-4 h-4 rounded border-neutral-300 text-green-500 focus:ring-green-500"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-medium ${todo.completed ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
              {todo.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <div 
              className="w-1 h-4 rounded-full"
              style={{ backgroundColor: priorityColors[todo.priority] }}
            />
            
            {todo.project && (
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: `${todo.project.color}15`,
                  color: todo.project.color 
                }}
              >
                {todo.project.name}
              </span>
            )}

            {getDueDateBadge()}

            {todo.tags && todo.tags.length > 0 && (
              <div className="flex gap-1">
                {todo.tags.map(tag => (
                  <span 
                    key={tag.id}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ 
                      backgroundColor: `${tag.color}15`,
                      color: tag.color 
                    }}
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {todo.subtasks && todo.subtasks.length > 0 && (
              <span className="text-xs text-neutral-400">
                {todo.subtasks.filter(s => s.completed).length}/{todo.subtasks.length} subtasks
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClick}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}