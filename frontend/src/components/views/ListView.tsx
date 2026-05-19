import type { Todo, Project, Tag } from '../../types';
import { TodoList } from '../todos/TodoList';

interface ListViewProps {
  todos: Todo[];
  projects: Project[];
  tags: Tag[];
  onUpdate: (id: number, updates: Partial<Todo>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onCreateTodo: (todo: Partial<Todo>) => Promise<Todo>;
}

export function ListView({ 
  todos, 
  projects, 
  tags, 
  onUpdate, 
  onDelete, 
  onCreateTodo
}: ListViewProps) {
  return (
    <TodoList
      todos={todos}
      projects={projects}
      tags={tags}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onCreateTodo={onCreateTodo}
    />
  );
}