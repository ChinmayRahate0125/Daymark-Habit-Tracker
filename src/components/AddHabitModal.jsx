import React, { useState } from 'react';
import { X } from 'lucide-react';
import useHabitStore from '../store/useHabitStore';
import { CATEGORIES, categoryIcon } from '../utils/categories';

export default function AddHabitModal({ onClose, editHabit }) {
  const { addHabit, updateHabit } = useHabitStore();
  const [name, setName] = useState(editHabit?.name || '');
  const [category, setCategory] = useState(editHabit?.category || 'Personal');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Habit name is required.');
      return;
    }
    if (editHabit) {
      updateHabit(editHabit.id, { name: name.trim(), category });
    } else {
      addHabit(name.trim(), category);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-elevated)] border border-[var(--border-lg)] rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-black/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-semibold text-base tracking-tight">
            {editHabit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white rounded-md p-1 hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="Close modal"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Habit Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Read for 20 minutes"
              className="w-full bg-[var(--bg-canvas)] border border-[var(--border-lg)] rounded-lg px-3.5 py-2.5 text-zinc-100 text-sm placeholder:text-zinc-500 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-glow)] transition-all"
            />
            {error && <p className="text-rose-400 text-xs mt-1.5">{error}</p>}
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-2 font-medium">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-lg text-sm border transition-all text-left flex items-center gap-2 ${
                    category === cat
                      ? 'border-[var(--accent-subtle-border)] bg-[var(--accent-subtle)] font-medium'
                      : 'border-[var(--border-md)] bg-[var(--bg-canvas)] text-zinc-400 hover:border-[var(--border-xl)] hover:text-zinc-200'
                  }`}
                  style={category === cat ? { color: 'var(--accent-text)' } : {}}
                >
                  <span className="text-sm">{categoryIcon(cat)}</span>
                  <span>{cat}</span>
                </button>
              ))}
            </div>
          </div>

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
              {editHabit ? 'Save Changes' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
