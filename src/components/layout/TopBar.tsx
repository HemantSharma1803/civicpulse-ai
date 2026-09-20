import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Command,
  Bell,
  CheckCheck,
  Plus,
  RotateCcw,
  Sparkles,
  User,
  Shield,
  Sliders,
  ExternalLink,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { useCivicPulse } from '../../context/CivicPulseContext';
import { NavigationPage } from '../../types';

interface TopBarProps {
  onOpenMobileMenu?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const {
    currentPage,
    setCurrentPage,
    unreadNotifsCount,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setIsCommandPaletteOpen,
    setIsReportModalOpen,
    setIsGlobalSearchOpen,
    resetDemoData,
    setSelectedIncidentId,
    user,
  } = useCivicPulse();

  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const notifsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(event.target as Node)) {
        setIsNotifsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = (page: NavigationPage) => {
    switch (page) {
      case 'overview':
        return { title: 'Executive Command Center', subtitle: 'City infrastructure health, active incidents & recurrence memory' };
      case 'report':
        return { title: 'Incident Intake & AI Vision', subtitle: 'Multimodal Gemini vision analysis, spatial lineage & duplicate prevention' };
      case 'city-intelligence':
        return { title: 'City Intelligence', subtitle: 'Zonal failure clustering & systemic municipal vulnerabilities' };
      case 'incidents':
        return { title: 'Incident Directory', subtitle: 'Historical and active complaints connected through failure memory' };
      case 'failure-memory':
        return { title: 'Failure Memory Engine', subtitle: 'Location chronologies, repair durability & recurrence lineage' };
      case 'ai-insights':
        return { title: 'CivicPulse Intelligence', subtitle: 'Data-grounded failure patterns, evidence vectors & recommendations' };
      case 'operations':
        return { title: 'Field Operations & Repairs', subtitle: 'Work orders, contractor durability audits & repeat remediation tracking' };
      case 'analytics':
        return { title: 'Infrastructure Analytics', subtitle: 'Recurrence frequency curves, repair durability & municipal cost burdens' };
      case 'settings':
        return { title: 'Platform Settings', subtitle: 'System preferences, AI transparency guidelines & environment controls' };
      case 'help-docs':
        return { title: 'Help & Documentation', subtitle: 'Core philosophy, incident lineage architecture & judge evaluation notes' };
      default:
        return { title: 'CivicPulse AI', subtitle: 'The City’s Memory' };
    }
  };

  const pageInfo = getPageTitle(currentPage);

  return (
    <header
      id="civicpulse-topbar"
      className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 md:px-6 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs"
    >
      {/* Left: Breadcrumbs & Context Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="mobile-menu-button"
          onClick={onOpenMobileMenu}
          className="md:hidden flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>CivicPulse AI</span>
            <span className="text-slate-300">/</span>
            <span className="capitalize text-indigo-600 font-semibold truncate">
              {currentPage.replace('-', ' ')}
            </span>
          </div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight leading-tight truncate">
            {pageInfo.title}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Global Search Button */}
        <button
          id="global-search-trigger-btn"
          onClick={() => setIsGlobalSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 bg-slate-100 hover:bg-slate-200/80 hover:text-slate-800 rounded-lg border border-slate-200/80 transition-colors"
          title="Search incidents, locations, and categories"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline font-medium">Search incidents, locations...</span>
          <span className="hidden lg:inline text-[10px] font-mono-code px-1.5 py-0.5 bg-white text-slate-500 rounded border border-slate-200">
            /
          </span>
        </button>

        {/* Command Palette Trigger */}
        <button
          id="command-palette-trigger-btn"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 rounded-lg border border-indigo-200/70 transition-colors"
          title="Open Command Palette (Cmd + K)"
        >
          <Command className="w-3.5 h-3.5" />
          <span className="font-mono-code text-[11px] font-semibold">⌘K</span>
        </button>

        {/* Report Incident Action */}
        <button
          id="topbar-report-incident-btn"
          onClick={() => setCurrentPage('report')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs shadow-indigo-600/30 transition-all hover:shadow-sm cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
          <span className="hidden sm:inline">Report Issue (AI)</span>
        </button>

        {/* Demo Environment Indicator */}
        <div
          id="demo-environment-pill"
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-full text-[11px] font-semibold"
          title="Running with realistic seeded Indian city infrastructure data. No real municipal credentials required."
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-soft-pulse" />
          <span>Demo Environment</span>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifsRef}>
          <button
            id="notifications-bell-btn"
            onClick={() => setIsNotifsOpen((prev) => !prev)}
            aria-label="Notifications"
            className="relative flex items-center justify-center w-9 h-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {isNotifsOpen && (
            <div
              id="notifications-popover"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Notifications
                  </span>
                  {unreadNotifsCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-700">
                      {unreadNotifsCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllNotificationsRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.linkIncidentId) {
                          setSelectedIncidentId(n.linkIncidentId);
                          setIsNotifsOpen(false);
                        }
                      }}
                      className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-50 ${
                        !n.read ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900">{n.title}</span>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                        <span>{new Date(n.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        {n.linkIncidentId && (
                          <span className="font-mono-code text-indigo-600 font-semibold">
                            View {n.linkIncidentId} →
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <span className="text-[11px] text-slate-500 font-medium">
                  Seeded Activity & Alerts Stream
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="user-profile-menu-btn"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            aria-label="User menu"
            className="flex items-center gap-2 p-1 pl-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
            />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {user.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">Director</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {isUserMenuOpen && (
            <div
              id="user-profile-dropdown"
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="p-3 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.role}</p>
                <p className="text-[10px] text-indigo-600 font-medium mt-0.5 truncate">{user.department}</p>
              </div>

              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={() => {
                    setCurrentPage('settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-left"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Director Profile</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentPage('settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-left"
                >
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>Preferences & AI Transparency</span>
                </button>
                <button
                  onClick={() => {
                    resetDemoData();
                    setIsUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-2.5 py-1.5 text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors text-left font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Reset Demo Dataset</span>
                </button>
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    CivicPulse Core v1.4
                  </span>
                  <span className="font-mono-code font-bold text-slate-400">HACKATHON BUILD</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
