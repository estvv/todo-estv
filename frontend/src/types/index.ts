export interface Project {
  id: number;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  created_at: string;
}

export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  project_id?: number;
  parent_id?: number;
  project?: Project;
  tags: Tag[];
  subtasks: Todo[];
  comments: Comment[];
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  todo_id: number;
  content: string;
  created_at: string;
}

export type Priority = 'low' | 'medium' | 'high';

export type ViewMode = 'list' | 'board' | 'calendar';