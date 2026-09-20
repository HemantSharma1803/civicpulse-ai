import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, MapPin, AlertOctagon, Tag, ArrowRight, X, Sparkles } from 'lucide-react';
import { useCivicPulse } from '../context/CivicPulseContext';
import { dataService } from '../services/dataService';

export const GlobalSearchDialog: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    setSelectedIncidentId,
    setCurrentPage,
    setFilterCategory,
  } = useCivicPulse();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isGlobalSearchOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isGlobalSearchOpen]);

  const searchResults = useMemo(() => {
    return dataService.globalSearch(query);
  }, [query]);

  const totalResults =
    searchResults.incidents.length +
    searchResults.locations.length +
    searchResults.categories.length;

  if (!isGlobalSearchOpen) return null;

  return (
    <div
      id="global-search-modal-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={() => setIsGlobalSearchOpen(false)}
    >
      <div
        id="global-search-dialog-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by ID (e.g. INC-1048), location, category, address, or tags..."
            className="w-full text-sm font-medium text-slate-900 bg-transparent placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono-code font-bold bg-white text-slate-500 rounded border border-slate-200 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Semantic Search Future Architecture Banner */}
        <div className="px-4 py-2 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between text-[11px] text-indigo-900">
          <div className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Keyword & Structured Field Search Active</span>
          </div>
          <span className="text-[10px] text-indigo-600/80 font-mono-code">
            Semantic Vector Search interface prepared for Layer 2
          </span>
        </div>

        {/* Grouped Results */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {!query.trim() ? (
            <div className="py-10 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Try searching for <span className="font-mono-code text-indigo-600 font-bold">INC-1048</span>,{' '}
                <span className="font-mono-code text-indigo-600 font-bold">Tonk Road</span>,{' '}
                <span className="font-mono-code text-indigo-600 font-bold">Pothole</span>, or{' '}
                <span className="font-mono-code text-indigo-600 font-bold">Water Leakage</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Searches all 54 seeded historical incidents, recurring hotspots, and infrastructure categories.
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching records found for "{query}" in the demo dataset.
            </div>
          ) : (
            <>
              {/* Incidents Group */}
              {searchResults.incidents.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Incidents ({searchResults.incidents.length})</span>
                    <span>Click to open detail drawer</span>
                  </div>
                  <div className="space-y-1">
                    {searchResults.incidents.map((inc) => (
                      <div
                        key={inc.id}
                        onClick={() => {
                          setSelectedIncidentId(inc.id);
                          setIsGlobalSearchOpen(false);
                        }}
                        className="group flex items-start justify-between p-2.5 rounded-xl hover:bg-indigo-50/60 border border-transparent hover:border-indigo-100 cursor-pointer transition-all"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="p-1.5 bg-slate-100 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white rounded-lg shrink-0 transition-colors">
                            <AlertOctagon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono-code text-xs font-bold text-indigo-600">
                                {inc.id}
                              </span>
                              <span className="text-xs font-semibold text-slate-900 truncate">
                                {inc.title}
                              </span>
                              {inc.recurrenceCount > 0 && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase bg-purple-100 text-purple-800 rounded">
                                  {inc.recurrenceCount}x Recurrent
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {inc.address}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                              inc.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inc.status === 'in_progress'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {inc.status.replace('_', ' ')}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Locations Group */}
              {searchResults.locations.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Locations & Hotspots ({searchResults.locations.length})
                  </div>
                  <div className="space-y-1">
                    {searchResults.locations.map((loc) => (
                      <div
                        key={loc.id}
                        onClick={() => {
                          setCurrentPage('failure-memory');
                          setIsGlobalSearchOpen(false);
                        }}
                        className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-50/60 border border-transparent hover:border-purple-100 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-1.5 bg-slate-100 text-slate-600 group-hover:bg-purple-600 group-hover:text-white rounded-lg shrink-0 transition-colors">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-slate-900">
                              {loc.locationName}
                            </span>
                            <p className="text-[11px] text-slate-500 truncate">{loc.address}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                            {loc.incidentCount} incidents ({loc.recurrenceState})
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-purple-600 transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories Group */}
              {searchResults.categories.length > 0 && (
                <div>
                  <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Infrastructure Categories ({searchResults.categories.length})
                  </div>
                  <div className="space-y-1">
                    {searchResults.categories.map((cat) => (
                      <div
                        key={cat}
                        onClick={() => {
                          setFilterCategory(cat);
                          setCurrentPage('incidents');
                          setIsGlobalSearchOpen(false);
                        }}
                        className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <Tag className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
                          <span className="text-xs font-semibold text-slate-800">{cat}</span>
                        </div>
                        <span className="text-[11px] text-indigo-600 font-medium flex items-center gap-1">
                          Filter in Incidents →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500">
          <span>Search spans 54 incidents across 6 metropolitan zones</span>
          <span className="font-mono-code text-[10px] text-indigo-600 font-semibold">
            CivicPulse Index
          </span>
        </div>
      </div>
    </div>
  );
};
