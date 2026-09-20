import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Building,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Compass,
} from 'lucide-react';

export type LocationSource = 'GPS-DERIVED' | 'USER-ENTERED' | 'DEMO-SELECTED';

export interface LocationData {
  address: string;
  zone: string;
  latitude: number;
  longitude: number;
  source: LocationSource;
}

interface LocationIntelligenceStepProps {
  location: LocationData;
  onLocationChange: (loc: LocationData) => void;
  onBack: () => void;
  onProceedToMemoryCheck: () => void;
}

// Popular chronic municipal zones / coordinates in Jaipur
const PRESET_LOCATIONS = [
  {
    name: 'Tonk Road Flyover (Pillar 14)',
    address: 'Pillar 14, Under Tonk Road Elevated Flyover, Jaipur',
    zone: 'Central-South Corridor',
    latitude: 26.8795,
    longitude: 75.8015,
    chronicLabel: 'Chronic Recurrence Hotspot',
  },
  {
    name: 'JLN Marg (Near Commerce College)',
    address: 'Opposite University Commerce College, JLN Marg, Jaipur',
    zone: 'East Zone',
    latitude: 26.8845,
    longitude: 75.8118,
    chronicLabel: 'High Volume Corridor',
  },
  {
    name: 'MI Road / Ajmeri Gate',
    address: 'Near Old Post Office, Ajmeri Gate, MI Road, Jaipur',
    zone: 'Walled City Zone',
    latitude: 26.9180,
    longitude: 75.8185,
    chronicLabel: 'Severe Drainage Catchment',
  },
  {
    name: 'Bapu Nagar (4th Cross)',
    address: 'Near Janta Store Circle, 4th Cross, Bapu Nagar, Jaipur',
    zone: 'Central Zone',
    latitude: 26.8920,
    longitude: 75.8160,
    chronicLabel: 'Commercial Siltation Zone',
  },
  {
    name: 'Sector 3 Malviya Nagar',
    address: 'Near Central Spine Market, Sector 3, Malviya Nagar, Jaipur',
    zone: 'South Zone',
    latitude: 26.8520,
    longitude: 75.8210,
    chronicLabel: 'Residential Baseline Node',
  },
  {
    name: 'Gopalpura Bypass Crossing',
    address: 'Near Mahaveer Nagar Junction, Gopalpura Bypass, Jaipur',
    zone: 'South-West Zone',
    latitude: 26.8660,
    longitude: 75.7890,
    chronicLabel: 'Traffic Hardware Hotspot',
  },
];

const ZONE_OPTIONS = [
  'Central Zone',
  'Walled City Zone',
  'Central-South Corridor',
  'South Zone',
  'South-West Zone',
  'East Zone',
  'North Zone',
  'Civil Lines Zone',
];

export const LocationIntelligenceStep: React.FC<LocationIntelligenceStepProps> = ({
  location,
  onLocationChange,
  onBack,
  onProceedToMemoryCheck,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'search' | 'manual'>('presets');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Filtered preset locations for search
  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return PRESET_LOCATIONS;
    const q = searchQuery.toLowerCase();
    return PRESET_LOCATIONS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.zone.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Use browser Geolocation API
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));
        onLocationChange({
          address: `GPS Pin: ${lat}, ${lng} (Near active user coordinates)`,
          zone: 'Central Zone',
          latitude: lat,
          longitude: lng,
          source: 'GPS-DERIVED',
        });
      },
      (error) => {
        setIsLocating(false);
        setGeoError(
          error.code === 1
            ? 'Location permission denied. Please select from known municipal corridors or enter an address.'
            : 'Could not acquire GPS fix. Please select from popular locations.'
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const selectPreset = (p: (typeof PRESET_LOCATIONS)[0]) => {
    onLocationChange({
      address: p.address,
      zone: p.zone,
      latitude: p.latitude,
      longitude: p.longitude,
      source: 'DEMO-SELECTED',
    });
  };

  return (
    <div className="space-y-6">
      {/* Geolocation Quick Trigger Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Pinpoint Incident Coordinates
            </h4>
            <p className="text-[11px] text-slate-500">
              CivicPulse searches spatial history within a 350-meter radius to correlate recurring failures.
            </p>
          </div>
        </div>

        <button
          type="button"
          id="btn-use-current-location"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="px-3.5 py-2 bg-white hover:bg-slate-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Acquiring GPS...' : 'Use Current Device Location'}</span>
        </button>
      </div>

      {geoError && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Mode Selection Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'presets'
              ? 'bg-indigo-50 text-indigo-700 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Popular Municipal Corridors
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'search'
              ? 'bg-indigo-50 text-indigo-700 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Search Landmarks
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'manual'
              ? 'bg-indigo-50 text-indigo-700 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Enter Custom Coordinates
        </button>
      </div>

      {/* Tab 1: Popular Corridors */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_LOCATIONS.map((preset) => {
            const isSelected =
              location.latitude === preset.latitude && location.longitude === preset.longitude;

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => selectPreset(preset)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {preset.address}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                    {preset.zone}
                  </span>
                  <span className="font-semibold text-indigo-700">
                    {preset.chronicLabel}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Tab 2: Search */}
      {activeTab === 'search' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by street name, landmark, or zone..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white max-h-56 overflow-y-auto">
            {filteredPresets.map((preset) => (
              <div
                key={preset.name}
                onClick={() => selectPreset(preset)}
                className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-900">{preset.name}</p>
                  <p className="text-[11px] text-slate-500">{preset.address}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {preset.zone}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Manual Input */}
      {activeTab === 'manual' && (
        <div className="p-4 border border-slate-200 rounded-xl bg-white space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 mb-1 block">
              Street Address / Landmark
            </label>
            <input
              type="text"
              value={location.address}
              onChange={(e) =>
                onLocationChange({
                  ...location,
                  address: e.target.value,
                  source: 'USER-ENTERED',
                })
              }
              placeholder="e.g. Near Pillar 14, Tonk Road Flyover, Jaipur"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Municipal Zone
              </label>
              <select
                value={location.zone}
                onChange={(e) =>
                  onLocationChange({
                    ...location,
                    zone: e.target.value,
                    source: 'USER-ENTERED',
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900 focus:ring-2 focus:ring-indigo-500"
              >
                {ZONE_OPTIONS.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={location.latitude}
                onChange={(e) =>
                  onLocationChange({
                    ...location,
                    latitude: parseFloat(e.target.value) || 26.9124,
                    source: 'USER-ENTERED',
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={location.longitude}
                onChange={(e) =>
                  onLocationChange({
                    ...location,
                    longitude: parseFloat(e.target.value) || 75.7873,
                    source: 'USER-ENTERED',
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Location Confirmation Card */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>Selected Coordinate Anchor</span>
          </span>
          <span
            className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
              location.source === 'GPS-DERIVED'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : location.source === 'DEMO-SELECTED'
                ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {location.source}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <div>
            <p className="text-sm font-semibold text-slate-900">{location.address}</p>
            <p className="text-xs text-slate-500">{location.zone}</p>
          </div>
          <div className="font-mono text-xs text-slate-600 bg-white px-2.5 py-1 rounded border border-slate-200 shrink-0">
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to AI Vision</span>
        </button>

        <button
          type="button"
          id="proceed-to-memory-button"
          onClick={onProceedToMemoryCheck}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
        >
          <span>Run Memory Check</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
