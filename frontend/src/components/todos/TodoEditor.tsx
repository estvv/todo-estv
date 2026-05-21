import { useState, useEffect } from 'react';
import type { Todo, Project, Tag } from '../../types';
import { DatePicker } from '../common/DatePicker';
import { Button } from '../common/Button';

interface TodoEditorProps {
  todo?: Todo;
  projects: Project[];
  tags: Tag[];
  onSave: (todo: Partial<Todo>) => Promise<void>;
  onClose: () => void;
  onAddSubtask?: (title: string) => Promise<void>;
}

export function TodoEditor({ 
  todo, 
  projects, 
  tags, 
  onSave, 
  onClose,
  onAddSubtask 
}: TodoEditorProps) {
  const [title, setTitle] = useState(todo?.title || '');
  const [description, setDescription] = useState(todo?.description || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(todo?.priority || 'medium');
  const [dueDate, setDueDate] = useState<string | undefined>(todo?.due_date?.split('T')[0]);
  const [projectId, setProjectId] = useState<number | undefined>(todo?.project_id);
  const [selectedTags, setSelectedTags] = useState<number[]>(todo?.tags?.map(t => t.id) || []);
  const [saving, setSaving] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      await onSave({
        id: todo?.id,
        title: title.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate ? `${dueDate}T00:00:00Z` : undefined,
        project_id: projectId,
        tags: selectedTags.map(id => ({ id } as Tag)),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim() || !onAddSubtask) return;
    await onAddSubtask(newSubtask.trim());
    setNewSubtask('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">
            {todo ? 'Edit Todo' : 'New Todo'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full text-lg font-medium border-0 border-b border-neutral-200 focus:border-neutral-400 focus:ring-0 pb-2 pl-1 placeholder-neutral-400 text-neutral-900 outline-none"
              autoFocus
            />
          </div>

          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className="w-full text-sm border border-neutral-200 rounded-lg p-3 focus:border-neutral-400 focus:ring-0 resize-none placeholder-neutral-400 text-neutral-900 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-2">
                Project
              </label>
              <select
                value={projectId || ''}
                onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full text-sm border border-neutral-200 rounded-lg p-2 focus:border-neutral-400 focus:ring-0 outline-none text-neutral-900"
              >
                <option value="">No project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-2">
                Due Date
              </label>
              <DatePicker value={dueDate} onChange={setDueDate} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPriority('low')}
                className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors duration-150 capitalize
                  ${priority === 'low' 
                    ? 'border-blue-500 bg-blue-100 text-blue-700' 
                    : 'border-neutral-200 text-neutral-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50'
                  }`}
              >
                Low
              </button>
              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors duration-150 capitalize
                  ${priority === 'medium' 
                    ? 'border-amber-500 bg-amber-100 text-amber-700' 
                    : 'border-neutral-200 text-neutral-500 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50'
                  }`}
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`px-4 py-2 text-sm rounded-lg border-2 transition-colors duration-150 capitalize
                  ${priority === 'high' 
                    ? 'border-red-500 bg-red-100 text-red-700' 
                    : 'border-neutral-200 text-neutral-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                  }`}
              >
                High
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag.id) 
                        ? prev.filter(id => id !== tag.id)
                        : [...prev, tag.id]
                    );
                  }}
                  className={`px-3 py-1 text-sm rounded-full border-2 transition-colors duration-150 ${
                    selectedTags.includes(tag.id)
                      ? 'border-transparent'
                      : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                  }`}
                  style={selectedTags.includes(tag.id) ? {
                    backgroundColor: `${tag.color}15`,
                    borderColor: tag.color,
                    color: tag.color
                  } : {}}
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>

          {todo && todo.subtasks && todo.subtasks.length > 0 && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-2">
                Subtasks ({todo.subtasks.filter(s => s.completed).length}/{todo.subtasks.length})
              </label>
              <div className="space-y-2">
                {todo.subtasks.map(subtask => (
                  <div key={subtask.id} className="flex items-center gap-2 text-sm text-neutral-900">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      className="w-4 h-4 rounded border-neutral-300 text-emerald-500 focus:ring-emerald-500"
                      disabled
                    />
                    <span className={subtask.completed ? 'line-through text-neutral-400' : ''}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {todo && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-2">
                Add Subtask
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Subtask title"
                  className="flex-1 text-sm border border-neutral-200 rounded-lg p-2 focus:border-neutral-400 focus:ring-0 outline-none text-neutral-900"
                />
                <Button type="button" onClick={handleAddSubtask} className="border-emerald-500 text-emerald-700 hover:bg-emerald-50">
                  Add
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <Button type="submit" disabled={!title.trim() || saving} color="#10b981">
              {saving ? 'Saving...' : todo ? 'Save Changes' : 'Create Todo'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="hover:text-emerald-700 hover:bg-emerald-50">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}