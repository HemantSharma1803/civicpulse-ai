import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Contrast,
  Bell,
  Sliders,
  RotateCcw,
  ShieldCheck,
  Database,
  CheckCircle2,
} from 'lucide-react';
import { useCivicPulse } from '../context/CivicPulseContext';

export const SettingsView: React.FC = () => {
  const { theme, setTheme, resetDemoData, incidents, repairs, hotspots, user } = useCivicPulse();
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifInApp, setNotifInApp] = useState(true);
  const [highRiskAlerts, setHighRiskAlerts] = useState(true);
  const [explainabilityLevel, setExplainabilityLevel] = useState('full');
  const [confidenceThreshold, setConfidenceThreshold] = useState('85');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div id="settings-view-container" className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1 bg-indigo-600 text-white rounded-md">
            <Settings className="w-3.5 h-3.5" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono-code">
            PLATFORM CONFIGURATION
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          System Preferences & Demo Environment Controls
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage visual appearance, alert channels, transparent AI governance, and demo dataset persistence.
        </p>
      </div>

      {/* SECTION 1: Appearance */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Sun className="w-4 h-4 text-slate-600" />
          <span>Interface Appearance & Contrast</span>
        </h3>
        <p className="text-xs text-slate-500">
          Select visual canvas mode. Default is professional civic enterprise light mode.
        </p>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
              theme === 'light'
                ? 'bg-indigo-50 border-indigo-600 text-indigo-900 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span>Civic Light (Default)</span>
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <span>Night Ops (Dark)</span>
          </button>

          <button
            onClick={() => setTheme('contrast')}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
              theme === 'contrast'
                ? 'bg-black border-black text-white shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Contrast className="w-5 h-5 text-emerald-400" />
            <span>High Contrast (WCAG AAA)</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: Notification Preferences */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-600" />
          <span>Notification & Alert Channels</span>
        </h3>

        <div className="space-y-3 pt-1 text-xs">
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <div>
              <span className="font-semibold text-slate-900 block">Critical Recurrence Alerts</span>
              <span className="text-[11px] text-slate-500">
                Receive instant notifications when a 3x or higher recurrent failure is flagged
              </span>
            </div>
            <input
              type="checkbox"
              checked={highRiskAlerts}
              onChange={(e) => setHighRiskAlerts(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <div>
              <span className="font-semibold text-slate-900 block">In-App Activity Feed</span>
              <span className="text-[11px] text-slate-500">
                Broadcast new citizen reports and status changes to topbar notification bell
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifInApp}
              onChange={(e) => setNotifInApp(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
            <div>
              <span className="font-semibold text-slate-900 block">Email Digest & Contractor Audits</span>
              <span className="text-[11px] text-slate-500">
                Weekly summary sent to {user.email}
              </span>
            </div>
            <input
              type="checkbox"
              checked={notifEmail}
              onChange={(e) => setNotifEmail(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* SECTION 3: AI Transparency Settings */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>AI Transparency & Explainability</span>
        </h3>
        <p className="text-xs text-slate-500">
          Configure how derived scores, recurrence linkages, and intelligence insights are presented to municipal officials.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Score Explainability Detail
            </label>
            <select
              value={explainabilityLevel}
              onChange={(e) => setExplainabilityLevel(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            >
              <option value="full">Full Mathematical Derivation Formula</option>
              <option value="summary">Summary Weighting Only</option>
              <option value="simplified">Simplified Status Pill</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Minimum Spatial Clustering Confidence
            </label>
            <select
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            >
              <option value="90">90% (Strict 150m Coordinate Radius)</option>
              <option value="85">85% (Standard 250m Radius • Recommended)</option>
              <option value="75">75% (Broad 500m Zonal Radius)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 4: Demo Environment Controls */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-600" />
            <span>Demo Environment & Data Persistence</span>
          </h3>
          <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded">
            SEEDED DATASET
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          CivicPulse is currently running on a realistic seeded municipal dataset comprising{' '}
          <strong>{incidents.length} incidents</strong>, <strong>{repairs.length} repair events</strong>, and{' '}
          <strong>{hotspots.length} chronic failure hotspots</strong>. Operational updates and reported incidents are persisted locally in your browser session.
        </p>

        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Dataset to Factory State</span>
          </button>

          {resetSuccess && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Demo dataset restored to initial 54 records!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
