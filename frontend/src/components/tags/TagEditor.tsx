import { useState } from 'react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import type { Tag } from '../../types';

interface TagEditorProps {
  tag?: Tag;
  onSave: (tag: Partial<Tag>) => Promise<void>;
  onClose: () => void;
}

export function TagEditor({ tag, onSave, onClose }: TagEditorProps) {
  const [name, setName] = useState(tag?.name || '');
  const [color, setColor] = useState(tag?.color || '#3b82f6');
  const [saving, setSaving] = useState(false);

  const colors = [
    '#3b82f6', '#22c55e', '#8b5cf6', '#ec4899', 
    '#f59e0b', '#14b8a6', '#6366f1', '#ef4444',
    '#10b981', '#f97316', '#84cc16', '#06b6d4'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSave({
        id: tag?.id,
        name: name.trim(),
        color,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={tag ? 'Edit Tag' : 'New Tag'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-2">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim() && !saving) {
                handleSubmit(e);
              }
            }}
            className="w-full text-sm border border-neutral-200 rounded-lg p-2 focus:border-neutral-400 focus:ring-0 outline-none text-neutral-900"
            placeholder="Tag name (without #)"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-neutral-400 mb-2">
            Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {colors.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all duration-150 ${color === c ? 'scale-110' : 'hover:scale-105'}`}
                style={{ 
                  backgroundColor: c,
                  ...(color === c ? { boxShadow: `0 0 0 2px white, 0 0 0 4px ${c}` } : {})
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={!name.trim() || saving} color="#10b981">
            {saving ? 'Saving...' : tag ? 'Save Changes' : 'Create Tag'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose} className="hover:text-emerald-700 hover:bg-emerald-50">
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}