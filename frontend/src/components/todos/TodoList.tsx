import { useState } from 'react';
import type { Todo } from '../../types';
import { TodoItem } from './TodoItem';
import { TodoEditor } from './TodoEditor';
import { Spinner } from '../common/Spinner';
import type { Project, Tag } from '../../types';

interface TodoListProps {
  todos: Todo[];
  projects: Project[];
  tags: Tag[];
  onUpdate: (id: number, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onCreateTodo: (todo: Partial<Todo>) => Promise<Todo>;
  onAddSubtask?: (parentId: number, title: string) => Promise<void>;
  isLoading?: boolean;
}

export function TodoList({ 
  todos, 
  projects, 
  tags, 
  onUpdate, 
  onDelete,
  onCreateTodo,
  isLoading
}: TodoListProps) {
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [showNewTodo, setShowNewTodo] = useState(false);

  const handleAddSubtask = async (parentId: number, title: string) => {
    await onCreateTodo({
      title,
      parent_id: parentId,
      priority: 'medium',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-1">No tasks yet</h3>
          <p className="text-sm text-neutral-400 mb-4">Create your first task to get started</p>
        </div>
      ) : null}

      <button
        onClick={() => setShowNewTodo(true)}
        className="w-full py-3 border-2 border-dashed border-neutral-200 rounded-lg text-sm text-neutral-400 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-150"
      >
        + Add task
      </button>

      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClick={() => setEditingTodo(todo)}
        />
      ))}

      {showNewTodo && (
        <TodoEditor
          projects={projects}
          tags={tags}
          onSave={async (todo) => {
            await onCreateTodo(todo);
            setShowNewTodo(false);
          }}
          onClose={() => setShowNewTodo(false)}
        />
      )}

      {editingTodo && (
        <TodoEditor
          todo={editingTodo}
          projects={projects}
          tags={tags}
          onSave={async (todo) => {
            await onUpdate(editingTodo.id, todo);
            setEditingTodo(undefined);
          }}
          onClose={() => setEditingTodo(undefined)}
          onAddSubtask={(title) => handleAddSubtask(editingTodo.id, title)}
        />
      )}
    </div>
  );
}