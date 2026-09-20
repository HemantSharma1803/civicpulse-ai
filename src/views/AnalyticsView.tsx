import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
  AlertOctagon,
  PieChart,
  ShieldAlert,
} from 'lucide-react';
import { useCivicPulse } from '../context/CivicPulseContext';

export const AnalyticsView: React.FC = () => {
  const { categoryHealth, metrics } = useCivicPulse();

  const mtbfData = [
    { category: 'Pothole', mtbf: '21 Days', repeatCost: '₹3,40,000', repeatShare: '42%' },
    { category: 'Water Leakage', mtbf: '18 Days', repeatCost: '₹1,80,000', repeatShare: '38%' },
    { category: 'Drainage Issue', mtbf: '19 Days', repeatCost: '₹2,60,000', repeatShare: '44%' },
    { category: 'Broken Streetlight', mtbf: '24 Days', repeatCost: '₹95,000', repeatShare: '25%' },
    { category: 'Traffic Signal Issue', mtbf: '28 Days', repeatCost: '₹1,15,000', repeatShare: '29%' },
    { category: 'Damaged Footpath', mtbf: '36 Days', repeatCost: '₹85,000', repeatShare: '20%' },
    { category: 'Garbage Overflow', mtbf: '12 Days', repeatCost: '₹60,000', repeatShare: '50%' },
  ];

  return (
    <div id="analytics-view-container" className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 bg-indigo-600 text-white rounded-md">
                <BarChart3 className="w-3.5 h-3.5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 font-mono-code">
                MUNICIPAL INFRASTRUCTURE ANALYTICS
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Recurrence Frequency & Financial Waste Metrics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
              Evaluating the structural cost of repeat failures. When remediation is treated as an isolated event rather than a recurring cycle, municipal expenditure escalates by an estimated 3.2x.
            </p>
          </div>
        </div>
      </div>

      {/* High-level Analytics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>OVERALL RECURRENCE RATIO</span>
            <ShieldAlert className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black font-mono-code text-purple-700 mt-2">
            38.4%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Percentage of complaints logged within 250m of prior failure
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>MEAN RE-EMERGENCE CYCLE</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black font-mono-code text-indigo-700 mt-2">
            22.4 Days
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Average days between contractor patch sign-off and citizen re-report
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>REACTIVE REPAIR BURDEN</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-mono-code text-amber-700 mt-2">
            ₹11,35,000
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Cumulative expenditure on repeat repairs in tracked zones (90d)
          </p>
        </div>
      </div>

      {/* MTBF (Mean Time Between Failures) Table */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Mean Re-emergence Interval & Financial Waste by Category
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Empirical measurements based on seeded repair and incident records.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Mean Re-emergence Cycle</th>
                <th className="py-3 px-4">Repeat Failure Share</th>
                <th className="py-3 px-4">Estimated Repeat Expenditure</th>
                <th className="py-3 px-4">Durability Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mtbfData.map((row) => (
                <tr key={row.category} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{row.category}</td>
                  <td className="py-3 px-4 font-mono-code font-bold text-indigo-700">{row.mtbf}</td>
                  <td className="py-3 px-4 font-mono-code text-purple-700">{row.repeatShare}</td>
                  <td className="py-3 px-4 font-mono-code text-slate-800">{row.repeatCost}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        parseInt(row.repeatShare) > 40
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {parseInt(row.repeatShare) > 40 ? 'High Recurrence Risk' : 'Acceptable Durability'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
