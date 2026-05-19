import { useState } from 'react';
import type { Todo } from '../../types';
import { TodoItem } from './TodoItem';
import { TodoEditor } from './TodoEditor';
import type { Project, Tag } from '../../types';

interface TodoListProps {
  todos: Todo[];
  projects: Project[];
  tags: Tag[];
  onUpdate: (id: number, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onCreateTodo: (todo: Partial<Todo>) => Promise<Todo>;
  onAddSubtask?: (parentId: number, title: string) => Promise<void>;
}

export function TodoList({ 
  todos, 
  projects, 
  tags, 
  onUpdate, 
  onDelete,
  onCreateTodo
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

  return (
    <div className="space-y-3">
      <button
        onClick={() => setShowNewTodo(true)}
        className="w-full py-3 border-2 border-dashed border-neutral-200 rounded-lg text-sm text-neutral-400 hover:text-neutral-900 hover:border-neutral-900 transition-colors"
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