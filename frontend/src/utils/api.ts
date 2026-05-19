import type { Todo, Project, Tag, Comment } from '../types';
import { getToken, removeToken } from './auth';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers as Record<string, string>,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

export const api = {
  todos: {
    list: (filters?: Record<string, string>) => {
      const params = filters ? new URLSearchParams(filters) : '';
      const query = params ? `?${params}` : '';
      return request<Todo[]>(`/todos${query}`);
    },
    
    get: (id: number) => request<Todo>(`/todos/${id}`),
    
    create: (todo: Partial<Todo>) => request<Todo>('/todos', {
      method: 'POST',
      body: JSON.stringify(todo),
    }),
    
    update: (id: number, todo: Partial<Todo>) => request<Todo>(`/todos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(todo),
    }),
    
    delete: (id: number) => request<{ deleted: boolean }>(`/todos/${id}`, {
      method: 'DELETE',
    }),
    
    getComments: (id: number) => request<Comment[]>(`/todos/${id}/comments`),
    
    addComment: (id: number, content: string) => request<Comment>(`/todos/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
    
    deleteComment: (id: number) => request<{ deleted: boolean }>(`/comments/${id}`, {
      method: 'DELETE',
    }),
  },
  
  projects: {
    list: () => request<Project[]>('/projects'),
    
    get: (id: number) => request<Project>(`/projects/${id}`),
    
    create: (project: Partial<Project>) => request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    }),
    
    update: (id: number, project: Partial<Project>) => request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    }),
    
    delete: (id: number) => request<{ deleted: boolean }>(`/projects/${id}`, {
      method: 'DELETE',
    }),
  },
  
  tags: {
    list: () => request<Tag[]>('/tags'),
    
    create: (tag: Partial<Tag>) => request<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify(tag),
    }),
    
    update: (id: number, tag: Partial<Tag>) => request<Tag>(`/tags/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tag),
    }),
    
    delete: (id: number) => request<{ deleted: boolean }>(`/tags/${id}`, {
      method: 'DELETE',
    }),
  },
};