import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  ArrowLeft,
  Search,
  X,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import useHabitStore from '../store/useHabitStore';
import { LIST_CATEGORIES, getCategoryById } from '../utils/listCategories';
import ListItemCard from '../components/ListItemCard';
import AddListItemModal from '../components/AddListItemModal';

export default function MyLists() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { lists } = useHabitStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const activeCategory = useMemo(() => {
    return categoryId ? getCategoryById(categoryId) : null;
  }, [categoryId]);

  // Overall counts for landing view
  const overallStats = useMemo(() => {
    const all = lists || [];
    const pending = all.filter((item) => !item.completed).length;
    const completed = all.filter((item) => item.completed).length;
    return { total: all.length, pending, completed };
  }, [lists]);

  // Category counts map { categoryId: { pending, completed, total } }
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const cat of LIST_CATEGORIES) {
      counts[cat.id] = { pending: 0, completed: 0, total: 0 };
    }
    for (const item of lists || []) {
      if (counts[item.categoryId]) {
        counts[item.categoryId].total += 1;
        if (item.completed) {
          counts[item.categoryId].completed += 1;
        } else {
          counts[item.categoryId].pending += 1;
        }
      }
    }
    return counts;
  }, [lists]);

  // Filter items for current category view
  const { pendingItems, completedItems } = useMemo(() => {
    if (!activeCategory) return { pendingItems: [], completedItems: [] };

    const catItems = (lists || []).filter(
      (item) => item.categoryId === activeCategory.id
    );

    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? catItems.filter((item) => {
          const matchTitle = item.title.toLowerCase().includes(query);
          const matchNotes = item.notes?.toLowerCase().includes(query);
          const matchMeta = Object.values(item.metadata || {}).some((v) =>
            String(v).toLowerCase().includes(query)
          );
          return matchTitle || matchNotes || matchMeta;
        })
      : catItems;

    return {
      pendingItems: filtered.filter((item) => !item.completed),
      completedItems: filtered.filter((item) => item.completed),
    };
  }, [activeCategory, lists, searchQuery]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. INDIVIDUAL CATEGORY COLLECTION VIEW
  // ─────────────────────────────────────────────────────────────────────────────
  if (activeCategory) {
    const Icon = activeCategory.icon;
    const totalCount =
      categoryCounts[activeCategory.id]?.total || 0;
    const pendingCount =
      categoryCounts[activeCategory.id]?.pending || 0;
    const completedCount =
      categoryCounts[activeCategory.id]?.completed || 0;

    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] text-zinc-100">
        <div className="max-w-4xl mx-auto px-8 py-8">

          {/* Back Navigation */}
          <button
            onClick={() => {
              setSearchQuery('');
              navigate('/lists');
            }}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-5 font-medium"
          >
            <ArrowLeft size={14} />
            <span>Back to My Lists</span>
          </button>

          {/* Category Header */}
          <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[var(--bg-card)] border border-[var(--border-md)] flex items-center justify-center text-[var(--accent-text)] shadow-xs">
                <Icon size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-white">
                    {activeCategory.name}
                  </h1>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-zinc-400 border border-[var(--border-xs)]">
                    {totalCount} {totalCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 font-normal">
                  {activeCategory.subtitle}
                </p>
              </div>
            </div>

            <button
              onClick={handleOpenAdd}
              className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium shadow-sm transition-all"
            >
              <Plus size={14} />
              <span>Add {activeCategory.singular}</span>
            </button>
          </div>

          {/* Quick Metrics & Search Bar Row */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            {/* Status Summary */}
            <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
              <span>
                <strong className="text-zinc-200 font-medium">{pendingCount}</strong> pending
              </span>
              <span className="text-zinc-600 select-none">·</span>
              <span>
                <strong className="text-zinc-200 font-medium">{completedCount}</strong> completed
              </span>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeCategory.name.toLowerCase()}...`}
                className="w-full bg-[var(--bg-card)] border border-[var(--border-md)] rounded-lg pl-9 pr-8 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-glow)] transition-all font-ui"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* ── Pending Items Section ──────────────────────────────── */}
          <section className="mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Clock size={12} />
              <span>Pending ({pendingItems.length})</span>
            </h2>

            {pendingItems.length === 0 ? (
              <div className="bg-[var(--bg-card)] border border-[var(--border-md)] rounded-xl p-8 text-center">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-sm)] flex items-center justify-center mx-auto mb-3 text-zinc-400">
                  <Icon size={18} style={{ color: 'var(--accent-text)' }} />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  {searchQuery ? 'No matching entries found' : 'No pending entries'}
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
                  {searchQuery
                    ? `No entries in ${activeCategory.name} match "${searchQuery}".`
                    : `Add something you want to experience or explore in ${activeCategory.name.toLowerCase()}.`}
                </p>
                {!searchQuery && (
                  <button
                    onClick={handleOpenAdd}
                    className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium shadow-sm"
                  >
                    <Plus size={13} />
                    <span>Add {activeCategory.singular}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingItems.map((item) => (
                  <ListItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleOpenEdit}
                  />
                ))}
              </div>
            )}
          </section>

          {/* ── Completed Items Section ────────────────────────────── */}
          {completedItems.length > 0 && (
            <section className="mb-10 pt-6 border-t border-[var(--border-xs)]">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90 mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={13} />
                <span>Completed ({completedItems.length})</span>
              </h2>

              <div className="space-y-2.5">
                {completedItems.map((item) => (
                  <ListItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleOpenEdit}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Modal */}
          {modalOpen && (
            <AddListItemModal
              onClose={() => setModalOpen(false)}
              categoryId={activeCategory.id}
              editItem={editingItem}
            />
          )}

        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. MY LISTS LANDING PAGE (CATEGORY CARDS GRID)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-zinc-100">
      <div className="max-w-5xl mx-auto px-8 py-8">

        {/* Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white">My Lists</h1>
          <p className="text-xs text-zinc-400 mt-0.5 font-normal">
            Things I want to experience and explore.
          </p>
        </div>

        {/* Compact Summary Row */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono mb-8 pt-0.5">
          <span>
            <strong className="text-zinc-200 font-medium">{overallStats.total}</strong> total items
          </span>
          <span className="text-zinc-600 select-none">·</span>
          <span>
            <strong className="text-zinc-200 font-medium">{overallStats.pending}</strong> pending
          </span>
          <span className="text-zinc-600 select-none">·</span>
          <span>
            <strong className="text-zinc-200 font-medium">{overallStats.completed}</strong> completed
          </span>
        </div>

        {/* 6 Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LIST_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const stats = categoryCounts[cat.id] || { pending: 0, completed: 0, total: 0 };

            return (
              <div
                key={cat.id}
                onClick={() => navigate(`/lists/${cat.id}`)}
                className="bg-[var(--bg-card)] border border-[var(--border-md)] rounded-xl p-5 card-hover shadow-xs cursor-pointer flex flex-col justify-between group transition-all duration-200"
              >
                <div>
                  {/* Icon & Category Header */}
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-md)] flex items-center justify-center text-[var(--accent-text)] group-hover:scale-105 transition-transform duration-200 shadow-xs">
                      <Icon size={19} />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-zinc-400 border border-[var(--border-xs)]">
                      {stats.total} {stats.total === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Name & Subtitle */}
                  <h3 className="text-base font-semibold text-white tracking-tight group-hover:text-[var(--accent-text)] transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.subtitle}
                  </p>
                </div>

                {/* Footer Counts */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--border-xs)] text-[11px] font-mono text-zinc-500">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-300 font-medium">{stats.pending} pending</span>
                    {stats.completed > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-emerald-400/90">{stats.completed} done</span>
                      </>
                    )}
                  </div>
                  <span className="text-[var(--accent-text)] opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    Open →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
