import React from 'react';
import {
  LayoutDashboard,
  Building2,
  AlertOctagon,
  History,
  Sparkles,
  Wrench,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Database,
  Camera,
} from 'lucide-react';
import { useCivicPulse } from '../../context/CivicPulseContext';
import { NavigationPage } from '../../types';

interface NavItem {
  id: NavigationPage;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: 'primary' | 'alert' | 'memory';
}

export const Sidebar: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    metrics,
    hotspots,
  } = useCivicPulse();

  const primaryNavItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'report',
      label: 'Report Issue (AI)',
      icon: Camera,
      badge: 'Vision',
      badgeVariant: 'primary',
    },
    {
      id: 'city-intelligence',
      label: 'City Intelligence',
      icon: Building2,
      badge: 'Zonal',
    },
    {
      id: 'incidents',
      label: 'Incidents',
      icon: AlertOctagon,
      badge: metrics.activeIncidents.value,
      badgeVariant: 'alert',
    },
    {
      id: 'failure-memory',
      label: 'Failure Memory',
      icon: History,
      badge: hotspots.length,
      badgeVariant: 'memory',
    },
    {
      id: 'ai-insights',
      label: 'AI Insights',
      icon: Sparkles,
      badge: '4 Active',
      badgeVariant: 'primary',
    },
    {
      id: 'operations',
      label: 'Operations',
      icon: Wrench,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
  ];

  const secondaryNavItems: NavItem[] = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
    {
      id: 'help-docs',
      label: 'Help & Docs',
      icon: HelpCircle,
    },
  ];

  return (
    <aside
      id="civicpulse-sidebar"
      aria-label="Application Sidebar"
      className={`relative flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out shrink-0 z-30 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <button
          id="brand-home-button"
          onClick={() => setCurrentPage('overview')}
          className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md p-1 group"
        >
          {/* Logo Mark */}
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 text-white shadow-md shadow-indigo-500/20 shrink-0">
            <span className="font-bold text-sm tracking-tight font-mono-code">CP</span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
            </span>
          </div>

          {!isSidebarCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                  CivicPulse
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                  AI
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-tight truncate">
                The City’s Memory
              </span>
            </div>
          )}
        </button>

        {/* Collapse Toggle Button */}
        <button
          id="toggle-sidebar-button"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setIsSidebarCollapsed((prev) => !prev)}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Philosophy Anchor Badge */}
      {!isSidebarCollapsed && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-indigo-950/40 border border-indigo-900/50">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Infrastructure Memory</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
            “An incident is not isolated. Its history matters.”
          </p>
        </div>
      )}

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className={`px-2 mb-1.5 ${isSidebarCollapsed ? 'text-center' : ''}`}>
          {!isSidebarCollapsed ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Intelligence Suite
            </span>
          ) : (
            <span className="text-[9px] font-bold uppercase text-slate-400">•</span>
          )}
        </div>

        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setCurrentPage(item.id)}
              title={isSidebarCollapsed ? item.label : undefined}
              className={`group relative flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              } ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isSidebarCollapsed && item.badge !== undefined && (
                <span
                  className={`ml-2 px-1.5 py-0.5 text-[11px] font-mono-code font-semibold rounded ${
                    isActive
                      ? 'bg-indigo-700/80 text-white'
                      : item.badgeVariant === 'alert'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : item.badgeVariant === 'memory'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Tooltip for collapsed mode */}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-white text-xs font-medium rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                  {item.badge && ` (${item.badge})`}
                </div>
              )}
            </button>
          );
        })}

        {/* Secondary Navigation */}
        <div className={`pt-4 pb-1 px-2 ${isSidebarCollapsed ? 'text-center' : ''}`}>
          {!isSidebarCollapsed ? (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              System
            </span>
          ) : (
            <div className="w-full h-px bg-slate-800 my-2" />
          )}
        </div>

        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setCurrentPage(item.id)}
              title={isSidebarCollapsed ? item.label : undefined}
              className={`group relative flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              } ${isSidebarCollapsed ? 'justify-center' : 'justify-start gap-3'}`}
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-200" />
              {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}

              {isSidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-800 text-white text-xs font-medium rounded-md shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Recurrence Status Box (Bottom of sidebar) */}
      {!isSidebarCollapsed ? (
        <div className="p-3 m-3 rounded-lg bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Recurrence Rate
            </span>
            <span className="font-mono-code font-bold text-amber-300">38.4%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full w-[38.4%]" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
            <span>6 Chronic Locations</span>
            <span>22d Avg. Cycle</span>
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-800 flex justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-soft-pulse" title="38.4% Recurrence Rate" />
        </div>
      )}
    </aside>
  );
};
