import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart2, Award, Settings } from 'lucide-react';

const navItems = [
  { to: '/',          label: 'Dashboard', icon: LayoutDashboard },
  { to: '/insights',  label: 'Insights',  icon: BarChart2 },
  { to: '/badges',    label: 'Badges',    icon: Award },
  { to: '/settings',  label: 'Settings',  icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[var(--bg-surface)] border-r border-[var(--border-sm)] flex flex-col z-20 select-none">

      {/* ── Wordmark ───────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-6">
        <span
          className="font-brand font-semibold tracking-[-0.04em] leading-none text-[19px] transition-opacity duration-200"
          style={{ color: 'var(--brand-wordmark)' }}
        >
          Daymark
        </span>
      </div>

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium
               transition-all duration-200 ease-out ${
                isActive
                  ? 'bg-[var(--accent-subtle)]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[var(--bg-hover-sm)] hover:translate-x-0.5'
              }`
            }
            style={({ isActive }) => (isActive ? { color: 'var(--accent-text)' } : {})}
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={15}
                  className={`flex-shrink-0 transition-all duration-200 ease-out ${
                    isActive
                      ? 'opacity-100 scale-105'
                      : 'opacity-60 group-hover:opacity-100 group-hover:scale-105'
                  }`}
                />
                <span className="transition-colors duration-200">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-t border-[var(--border-xs)] text-[11px] text-zinc-600 font-mono tracking-tight">
        v1.0.0
      </div>
    </aside>
  );
}
