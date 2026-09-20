import React, { useState } from 'react';
import { CivicPulseProvider, useCivicPulse } from './context/CivicPulseContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { CommandPalette } from './components/CommandPalette';
import { GlobalSearchDialog } from './components/GlobalSearchDialog';
import { IncidentDetailDrawer } from './components/IncidentDetailDrawer';
import { ReportIncidentModal } from './components/ReportIncidentModal';
import { ScoreMethodologyModal } from './components/ScoreMethodologyModal';

// Views
import { OverviewView } from './views/OverviewView';
import { ReportIncidentView } from './views/ReportIncidentView';
import { CityIntelligenceView } from './views/CityIntelligenceView';
import { IncidentsView } from './views/IncidentsView';
import { FailureMemoryView } from './views/FailureMemoryView';
import { AiInsightsView } from './views/AiInsightsView';
import { OperationsView } from './views/OperationsView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { HelpDocsView } from './views/HelpDocsView';
import { X, AlertTriangle, RotateCcw } from 'lucide-react';


class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[CivicPulse] UI recovery boundary:', error);
  }

  handleReload = () => window.location.reload();

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-7 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-amber-300">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="text-lg font-bold">CivicPulse needs a quick refresh</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">The current view hit an unexpected UI error. Your demo data is preserved by the application state layer.</p>
            <button onClick={this.handleReload} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Refresh CivicPulse
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { currentPage, theme } = useCivicPulse();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActiveView = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewView />;
      case 'report':
        return <ReportIncidentView />;
      case 'city-intelligence':
        return <CityIntelligenceView />;
      case 'incidents':
        return <IncidentsView />;
      case 'failure-memory':
        return <FailureMemoryView />;
      case 'ai-insights':
        return <AiInsightsView />;
      case 'operations':
        return <OperationsView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      case 'help-docs':
        return <HelpDocsView />;
      default:
        return <OverviewView />;
    }
  };

  const themeClass =
    theme === 'dark'
      ? 'dark bg-slate-950 text-slate-100'
      : theme === 'contrast'
      ? 'contrast-mode bg-black text-white'
      : 'bg-slate-100/70 text-slate-900';

  return (
    <div id="civicpulse-app-root" className={`min-h-screen flex ${themeClass}`}>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-sidebar-backdrop"
          className="fixed inset-0 z-50 flex md:hidden bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            id="mobile-sidebar-drawer"
            onClick={(e) => e.stopPropagation()}
            className="relative w-72 max-w-[85vw] h-full bg-slate-900 flex flex-col shadow-2xl animate-in slide-in-from-left duration-250"
          >
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main App Work Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Sticky Top Bar */}
        <TopBar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Scrollable Page Body */}
        <main
          id="civicpulse-main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 focus:outline-none"
        >
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <CommandPalette />
      <GlobalSearchDialog />
      <IncidentDetailDrawer />
      <ReportIncidentModal />
      <ScoreMethodologyModal />
    </div>
  );
};

export default function App() {
  return (
    <CivicPulseProvider>
      <AppErrorBoundary>
        <AppContent />
      </AppErrorBoundary>
    </CivicPulseProvider>
  );
}
