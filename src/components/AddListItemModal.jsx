import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import useHabitStore from '../store/useHabitStore';
import { getCategoryById } from '../utils/listCategories';

export default function AddListItemModal({ onClose, categoryId, editItem = null }) {
  const { addListItem, updateListItem } = useHabitStore();
  const category = getCategoryById(categoryId);

  const [title, setTitle] = useState(editItem?.title || '');
  const [notes, setNotes] = useState(editItem?.notes || '');
  const [link, setLink] = useState(editItem?.link || '');
  const [metadata, setMetadata] = useState(editItem?.metadata || {});
  const [error, setError] = useState('');

  const handleMetadataChange = (key, value) => {
    setMetadata((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError('Please enter a title.');
      return;
    }

    if (editItem) {
      updateListItem(editItem.id, {
        title: trimmedTitle,
        notes: notes.trim(),
        link: link.trim(),
        metadata,
      });
    } else {
      addListItem({
        categoryId,
        title: trimmedTitle,
        notes: notes.trim(),
        link: link.trim(),
        metadata,
      });
    }

    onClose();
  };

  const Icon = category?.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-elevated)] border border-[var(--border-lg)] rounded-2xl p-6 w-full max-w-md shadow-2xl shadow-black/80 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-md)] flex items-center justify-center text-[var(--accent-text)]">
                <Icon size={16} />
              </div>
            )}
            <div>
              <h2 className="text-white font-semibold text-base tracking-tight">
                {editItem ? 'Edit Entry' : `Add to ${category?.name || 'List'}`}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5 font-normal">
                {category?.singular || 'Item'} in your personal collection.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white rounded-md p-1 hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="Close modal"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
              Title <span className="text-rose-400">*</span>
            </label>
            <input
              autoFocus
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder={`e.g. ${category?.singular || 'Title'}`}
              className="w-full bg-[var(--bg-canvas)] border border-[var(--border-lg)] rounded-lg px-3.5 py-2.5 text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-glow)] transition-all"
            />
          </div>

          {/* Category-Specific Fields */}
          {category?.fields?.map((field) => (
            <div key={field.key}>
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                {field.label} <span className="text-zinc-500 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={metadata[field.key] || ''}
                onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-lg)] rounded-lg px-3.5 py-2 text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-glow)] transition-all"
              />
            </div>
          ))}

          {/* Optional External Link */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium flex items-center gap-1.5">
              <span>External Link or Resource</span>
              <span className="text-zinc-500 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[var(--bg-canvas)] border border-[var(--border-lg)] rounded-lg px-3.5 py-2 text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-glow)] transition-all"
              />
              <ExternalLink
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
              />
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
              Notes <span className="text-zinc-500 font-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why this was added, personal impressions, or details..."
              className="w-full bg-[var(--bg-canvas)] border border-[var(--border-lg)] rounded-lg px-3.5 py-2 text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-glow)] transition-all resize-none"
            />
          </div>

          {error && <p className="text-rose-400 text-xs font-medium">{error}</p>}

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-[var(--border-lg)] text-sm text-zinc-400 hover:text-zinc-200 hover:bg-[var(--bg-hover-sm)] font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg btn-primary text-white text-sm font-medium shadow-sm"
            >
              {editItem ? 'Save Changes' : 'Add to List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

