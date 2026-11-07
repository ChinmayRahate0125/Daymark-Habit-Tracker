import React from 'react';
import {
  Check,
  Pencil,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import useHabitStore from '../store/useHabitStore';

export default function ListItemCard({ item, onEdit }) {
  const { toggleListItem, deleteListItem } = useHabitStore();

  const handleDelete = () => {
    if (window.confirm(`Delete "${item.title}" from this list?`)) {
      deleteListItem(item.id);
    }
  };

  const isCompleted = item.completed;
  const metadataEntries = Object.entries(item.metadata || {}).filter(
    ([, val]) => val && String(val).trim().length > 0
  );

  return (
    <div
      className={`group flex items-start justify-between gap-3 p-3.5 sm:p-4 rounded-xl border transition-all duration-200 card-hover ${
        isCompleted
          ? 'bg-[var(--bg-surface)]/60 border-[var(--border-xs)] opacity-75'
          : 'bg-[var(--bg-card)] border-[var(--border-md)] shadow-xs'
      }`}
    >
      {/* ── Left: Checkbox Toggle ─────────────────────────────────── */}
      <button
        onClick={() => toggleListItem(item.id)}
        title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
        aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all duration-150 flex-shrink-0 cursor-pointer ${
          isCompleted
            ? 'bg-[var(--accent-primary)] text-white shadow-xs'
            : 'border border-[var(--border-xl)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-subtle)]'
        }`}
      >
        {isCompleted && <Check size={12} strokeWidth={3} className="text-white" />}
      </button>

      {/* ── Center: Content ───────────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h4
            className={`text-sm font-medium tracking-tight transition-colors truncate ${
              isCompleted ? 'line-through text-zinc-400' : 'text-zinc-100 font-semibold'
            }`}
          >
            {item.title}
          </h4>

          {/* External Link */}
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              title="Open external link"
              className="inline-flex items-center gap-1 text-[11px] text-[var(--accent-text)] hover:underline opacity-80 hover:opacity-100"
            >
              <ExternalLink size={11} />
              <span>Link</span>
            </a>
          )}
        </div>

        {/* Metadata Badges */}
        {metadataEntries.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap my-1.5">
            {metadataEntries.map(([key, val]) => (
              <span
                key={key}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-zinc-300 border border-[var(--border-xs)]"
              >
                <span className="text-zinc-500 capitalize">{key}: </span>
                <span>{val}</span>
              </span>
            ))}
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
            {item.notes}
          </p>
        )}

        {/* Timestamps */}
        <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-zinc-500">
          <span>Added {item.createdAt}</span>
          {isCompleted && item.completedAt && (
            <span className="text-emerald-400/90 font-medium">
              Completed {item.completedAt}
            </span>
          )}
        </div>
      </div>

      {/* ── Right: Action Buttons ─────────────────────────────────── */}
      <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onEdit(item)}
          title="Edit entry"
          className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-[var(--bg-hover)] transition-colors"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={handleDelete}
          title="Delete entry"
          className="p-1.5 rounded-md text-zinc-400 hover:text-rose-400 hover:bg-[var(--bg-hover)] transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
