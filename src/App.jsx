import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Insights from './pages/Insights';
import Badges from './pages/Badges';
import Settings from './pages/Settings';
import useHabitStore from './store/useHabitStore';

export default function App() {
  const theme = useHabitStore((s) => s.settings.theme);
  const accent = useHabitStore((s) => s.settings.accent || 'purple');

  // Keep the <html> class in sync with the persisted theme setting.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  // Keep data-accent in sync with the persisted accent setting.
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent);
  }, [accent]);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[var(--bg-canvas)] text-zinc-100">
        <Sidebar />
        <main className="flex-1 ml-56 min-h-screen overflow-y-auto">
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/insights"  element={<Insights />} />
            <Route path="/badges"    element={<Badges />} />
            <Route path="/settings"  element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
