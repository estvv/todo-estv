import { useState } from 'react';
import type { Todo, Project, Tag } from '../../types';
import { TodoItem } from '../todos/TodoItem';
import { TodoEditor } from '../todos/TodoEditor';

interface BoardViewProps {
  todos: Todo[];
  projects: Project[];
  tags: Tag[];
  onUpdate: (id: number, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onCreateTodo: (todo: Partial<Todo>) => Promise<Todo>;
}

export function BoardView({ 
  todos, 
  projects, 
  tags, 
  onUpdate, 
  onDelete, 
  onCreateTodo 
}: BoardViewProps) {
  const [editingTodo, setEditingTodo] = useState<Todo | undefined>();
  const [showNewTodo, setShowNewTodo] = useState<'todo' | 'inprogress' | 'done' | null>(null);

  const columns = [
    { id: 'todo', title: 'To Do', filter: (t: Todo) => !t.completed && t.priority !== 'high' },
    { id: 'inprogress', title: 'In Progress', filter: (t: Todo) => !t.completed && t.priority === 'high' },
    { id: 'done', title: 'Done', filter: (t: Todo) => t.completed },
  ];

  const getTodosForColumn = (filter: (t: Todo) => boolean) => {
    return todos.filter(filter);
  };

  return (
    <>
      <div className="flex gap-6 h-full">
        {columns.map(column => (
          <div key={column.id} className="flex-1 flex flex-col min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                {column.title}
              </h3>
              <span className="text-xs text-neutral-400">
                {getTodosForColumn(column.filter).length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {getTodosForColumn(column.filter).map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onClick={() => setEditingTodo(todo)}
                />
              ))}

              {column.id !== 'done' && (
                <button
                  onClick={() => setShowNewTodo(column.id as 'todo' | 'inprogress')}
                  className="w-full py-2 border-2 border-dashed border-neutral-200 rounded-lg text-sm text-neutral-400 hover:text-neutral-900 hover:border-neutral-300 transition-colors"
                >
                  + Add task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showNewTodo && (
        <TodoEditor
          projects={projects}
          tags={tags}
          onSave={async (todo) => {
            await onCreateTodo({ ...todo });
            setShowNewTodo(null);
          }}
          onClose={() => setShowNewTodo(null)}
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
        />
      )}
    </>
  );
}