import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import type { Todo, Project, Tag } from '../types';

export function useTodos(initialFilter?: Record<string, string>, enabled: boolean = true) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async (filter?: Record<string, string>) => {
    if (!enabled) return;
    try {
      setLoading(true);
      const data = await api.todos.list(filter || initialFilter);
      setTodos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  }, [initialFilter, enabled]);

  useEffect(() => {
    if (enabled) {
      fetchTodos();
    }
  }, [enabled]);

  const createTodo = async (todo: Partial<Todo>) => {
    const newTodo = await api.todos.create(todo);
    setTodos(prev => [newTodo, ...prev]);
    return newTodo;
  };

  const updateTodo = async (id: number, updates: Partial<Todo>) => {
    const updated = await api.todos.update(id, updates);
    setTodos(prev => prev.map(t => t.id === id ? updated : t));
    return updated;
  };

  const deleteTodo = async (id: number) => {
    await api.todos.delete(id);
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const toggleComplete = async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      return updateTodo(id, { completed: !todo.completed });
    }
  };

  return {
    todos,
    loading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
  };
}

export function useProjects(enabled: boolean = true) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    api.projects.list()
      .then(data => setProjects(data))
      .finally(() => setLoading(false));
  }, [enabled]);

  const createProject = async (project: Partial<Project>) => {
    const newProject = await api.projects.create(project);
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = async (id: number, project: Partial<Project>) => {
    const updated = await api.projects.update(id, project);
    setProjects(prev => prev.map(p => p.id === id ? updated : p));
    return updated;
  };

  const deleteProject = async (id: number) => {
    await api.projects.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
  };
}

export function useTags(enabled: boolean = true) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    api.tags.list()
      .then(data => setTags(data))
      .finally(() => setLoading(false));
  }, [enabled]);

  const createTag = async (tag: Partial<Tag>) => {
    const newTag = await api.tags.create(tag);
    setTags(prev => [...prev, newTag]);
    return newTag;
  };

  const deleteTag = async (id: number) => {
    await api.tags.delete(id);
    setTags(prev => prev.filter(t => t.id !== id));
  };

  return {
    tags,
    loading,
    createTag,
    deleteTag,
  };
}

export function useAutoSave<T>(
  data: T,
  saveFunction: (data: T) => Promise<void>,
  delay: number = 500
) {
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (data) {
        setSaving(true);
        await saveFunction(data);
        setSaving(false);
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [data, saveFunction, delay]);

  return { saving };
}