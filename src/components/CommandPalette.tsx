import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  Building2,
  AlertOctagon,
  History,
  Sparkles,
  Wrench,
  BarChart3,
  Settings,
  Plus,
  RotateCcw,
  SunMoon,
  HelpCircle,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import { useCivicPulse } from '../context/CivicPulseContext';
import { NavigationPage } from '../types';

interface CommandAction {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'System';
  shortcut?: string;
  icon: React.ElementType;
  perform: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setCurrentPage,
    setIsReportModalOpen,
    setIsGlobalSearchOpen,
    setIsMethodologyModalOpen,
    resetDemoData,
    refreshData,
    theme,
    setTheme,
  } = useCivicPulse();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const actions: CommandAction[] = useMemo(
    () => [
      {
        id: 'nav-overview',
        title: 'Go to Overview (Executive Command Center)',
        category: 'Navigation',
        shortcut: 'G O',
        icon: LayoutDashboard,
        perform: () => setCurrentPage('overview'),
      },
      {
        id: 'nav-city-intelligence',
        title: 'Open City Intelligence',
        category: 'Navigation',
        shortcut: 'G C',
        icon: Building2,
        perform: () => setCurrentPage('city-intelligence'),
      },
      {
        id: 'nav-incidents',
        title: 'View Incidents Directory',
        category: 'Navigation',
        shortcut: 'G I',
        icon: AlertOctagon,
        perform: () => setCurrentPage('incidents'),
      },
      {
        id: 'nav-failure-memory',
        title: 'Open Failure Memory Engine',
        category: 'Navigation',
        shortcut: 'G M',
        icon: History,
        perform: () => setCurrentPage('failure-memory'),
      },
      {
        id: 'nav-ai-insights',
        title: 'Open CivicPulse AI Insights',
        category: 'Navigation',
        shortcut: 'G A',
        icon: Sparkles,
        perform: () => setCurrentPage('ai-insights'),
      },
      {
        id: 'nav-operations',
        title: 'Open Field Operations & Repairs',
        category: 'Navigation',
        shortcut: 'G P',
        icon: Wrench,
        perform: () => setCurrentPage('operations'),
      },
      {
        id: 'nav-analytics',
        title: 'Open Infrastructure Analytics',
        category: 'Navigation',
        shortcut: 'G N',
        icon: BarChart3,
        perform: () => setCurrentPage('analytics'),
      },
      {
        id: 'action-report',
        title: 'Report New Incident',
        category: 'Actions',
        shortcut: 'N',
        icon: Plus,
        perform: () => setIsReportModalOpen(true),
      },
      {
        id: 'action-search',
        title: 'Search Incidents & Locations',
        category: 'Actions',
        shortcut: '/',
        icon: Search,
        perform: () => setIsGlobalSearchOpen(true),
      },
      {
        id: 'action-methodology',
        title: 'View City Health Score Methodology',
        category: 'Actions',
        icon: Calculator,
        perform: () => setIsMethodologyModalOpen(true),
      },
      {
        id: 'sys-refresh',
        title: 'Refresh Dashboard Calculations',
        category: 'System',
        icon: RotateCcw,
        perform: () => refreshData(),
      },
      {
        id: 'sys-reset-demo',
        title: 'Reset Demo Dataset (Restore initial 54 records)',
        category: 'System',
        icon: RotateCcw,
        perform: () => resetDemoData(),
      },
      {
        id: 'sys-toggle-theme',
        title: `Toggle Theme (Current: ${theme})`,
        category: 'System',
        icon: SunMoon,
        perform: () => setTheme(theme === 'light' ? 'dark' : 'light'),
      },
      {
        id: 'sys-settings',
        title: 'Open Settings',
        category: 'System',
        icon: Settings,
        perform: () => setCurrentPage('settings'),
      },
      {
        id: 'sys-help',
        title: 'Open Help & Documentation',
        category: 'System',
        icon: HelpCircle,
        perform: () => setCurrentPage('help-docs'),
      },
    ],
    [
      setCurrentPage,
      setIsReportModalOpen,
      setIsGlobalSearchOpen,
      setIsMethodologyModalOpen,
      refreshData,
      resetDemoData,
      theme,
      setTheme,
    ]
  );

  const filteredActions = useMemo(() => {
    if (!query.trim()) return actions;
    const q = query.toLowerCase();
    return actions.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [actions, query]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].perform();
        setIsCommandPaletteOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsCommandPaletteOpen(false);
    }
  };

  if (!isCommandPaletteOpen) return null;

  return (
    <div
      id="command-palette-modal-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        id="command-palette-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or jump to screen..."
            className="w-full text-sm font-medium text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono-code font-bold bg-white text-slate-500 rounded border border-slate-200 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-100">
          {filteredActions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching commands found for "{query}"
            </div>
          ) : (
            filteredActions.map((action, idx) => {
              const Icon = action.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    action.perform();
                    setIsCommandPaletteOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-md ${
                        isSelected ? 'bg-indigo-700/80 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <span className="font-medium truncate">{action.title}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {action.category}
                    </span>
                    {action.shortcut && (
                      <kbd
                        className={`text-[10px] font-mono-code px-1.5 py-0.5 rounded border ${
                          isSelected
                            ? 'bg-indigo-800 text-indigo-100 border-indigo-700'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        {action.shortcut}
                      </kbd>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Use ↑ ↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span className="font-mono-code text-[10px] text-indigo-600 font-semibold">
            CivicPulse Palette
          </span>
        </div>
      </div>
    </div>
  );
};
