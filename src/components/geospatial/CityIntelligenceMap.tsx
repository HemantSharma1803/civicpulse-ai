import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Incident,
  IncidentCategory,
  IncidentSeverity,
  Hotspot,
} from '../../types';
import {
  GeoPoint,
  GeoBounds,
  PixelPoint,
  MapLayerToggles,
  ClusterNode,
  HeatmapPoint,
  AreaSelectionState,
} from '../../services/geospatial/types';
import {
  MAYURA_CITY_BOUNDS,
  SVG_VIEWBOX_WIDTH,
  SVG_VIEWBOX_HEIGHT,
  MAYURA_ADMIN_ZONES,
  MAYURA_ROAD_NETWORK,
  MAYURA_STORMWATER_CANALS,
  geoToPixel,
  pixelToGeo,
  clusterIncidents,
  generateHeatmapPoints,
  filterIncidentsByArea,
} from '../../services/geospatial/geoService';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Flame,
  AlertTriangle,
  Droplet,
  Lightbulb,
  Trash2,
  Car,
  Footprints,
  Radio,
  Eye,
  Crosshair,
  Sparkles,
  MapPin,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface CityIntelligenceMapProps {
  incidents: Incident[];
  hotspots: Hotspot[];
  selectedIncidentId: string | null;
  onSelectIncident: (id: string | null) => void;
  selectedHotspotId: string | null;
  onSelectHotspot: (id: string | null) => void;
  layers: MapLayerToggles;
  onToggleLayer: (layer: keyof MapLayerToggles) => void;
  areaSelection: AreaSelectionState;
  onAreaSelectionChange: (selection: AreaSelectionState) => void;
  targetDateIso?: string;
}

export const CityIntelligenceMap: React.FC<CityIntelligenceMapProps> = ({
  incidents,
  hotspots,
  selectedIncidentId,
  onSelectIncident,
  selectedHotspotId,
  onSelectHotspot,
  layers,
  onToggleLayer,
  areaSelection,
  onAreaSelectionChange,
  targetDateIso,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Pan and Zoom State
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Area Selection Drag State
  const [isSelectingArea, setIsSelectingArea] = useState<boolean>(false);
  const [selectionStart, setSelectionStart] = useState<PixelPoint | null>(null);
  const [selectionCurrent, setSelectionCurrent] = useState<PixelPoint | null>(null);

  // Hovered item for tooltip
  const [hoveredIncident, setHoveredIncident] = useState<{
    incident: Incident;
    pixel: PixelPoint;
  } | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<{
    hotspot: Hotspot;
    pixel: PixelPoint;
  } | null>(null);

  // Map Layer drawer on canvas
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState<boolean>(false);

  // Clustering calculation based on current zoom
  const { clusters, singles } = useMemo(() => {
    if (!layers.showClusters) {
      return { clusters: [], singles: incidents };
    }
    return clusterIncidents(incidents, zoom);
  }, [incidents, zoom, layers.showClusters]);

  // Heatmap density points
  const heatmapPoints = useMemo(() => {
    if (!layers.showHeatmap) return [];
    return generateHeatmapPoints(incidents, hotspots);
  }, [incidents, hotspots, layers.showHeatmap]);

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.35, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.35, 0.8));
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onAreaSelectionChange({
      isActive: false,
      mode: null,
      bounds: null,
      center: null,
      radiusMeters: null,
      selectedIncidentIds: [],
      stats: null,
    });
  };

  // Convert client mouse event coordinates to SVG viewBox coordinate space
  const getSvgCoordinates = useCallback(
    (e: React.MouseEvent | MouseEvent): PixelPoint => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Transform according to current zoom & pan
      const viewBoxX = (clientX / rect.width) * SVG_VIEWBOX_WIDTH;
      const viewBoxY = (clientY / rect.height) * SVG_VIEWBOX_HEIGHT;

      // Invert pan and zoom
      const transformedX = (viewBoxX - pan.x) / zoom;
      const transformedY = (viewBoxY - pan.y) / zoom;

      return { x: transformedX, y: transformedY };
    },
    [zoom, pan]
  );

  // Pan / Area Selection drag handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return; // Only primary mouse button

    if (areaSelection.mode) {
      // Area selection mode active
      const point = getSvgCoordinates(e);
      setIsSelectingArea(true);
      setSelectionStart(point);
      setSelectionCurrent(point);
    } else {
      // Standard panning mode
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isSelectingArea && selectionStart) {
      const current = getSvgCoordinates(e);
      setSelectionCurrent(current);
    } else if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (isSelectingArea && selectionStart && selectionCurrent) {
      setIsSelectingArea(false);

      if (areaSelection.mode === 'box') {
        const geoStart = pixelToGeo(selectionStart.x, selectionStart.y);
        const geoCurrent = pixelToGeo(selectionCurrent.x, selectionCurrent.y);

        const bounds: GeoBounds = {
          minLat: Math.min(geoStart.latitude, geoCurrent.latitude),
          maxLat: Math.max(geoStart.latitude, geoCurrent.latitude),
          minLng: Math.min(geoStart.longitude, geoCurrent.longitude),
          maxLng: Math.max(geoStart.longitude, geoCurrent.longitude),
        };

        const result = filterIncidentsByArea(incidents, {
          mode: 'box',
          bounds,
        });

        onAreaSelectionChange({
          isActive: true,
          mode: 'box',
          bounds,
          center: null,
          radiusMeters: null,
          selectedIncidentIds: result.selected.map((i) => i.id),
          stats: result.stats,
        });
      } else if (areaSelection.mode === 'radius') {
        const geoCenter = pixelToGeo(selectionStart.x, selectionStart.y);
        const geoCurrent = pixelToGeo(selectionCurrent.x, selectionCurrent.y);

        // Calculate radius in meters between center and current
        const dx = selectionCurrent.x - selectionStart.x;
        const dy = selectionCurrent.y - selectionStart.y;
        const pixelRadius = Math.sqrt(dx * dx + dy * dy);

        // Approximate 1 SVG unit ~ 15 meters in Mayura metro projection
        const radiusMeters = Math.round(pixelRadius * 14.5);

        const result = filterIncidentsByArea(incidents, {
          mode: 'radius',
          center: geoCenter,
          radiusMeters,
        });

        onAreaSelectionChange({
          isActive: true,
          mode: 'radius',
          bounds: null,
          center: geoCenter,
          radiusMeters,
          selectedIncidentIds: result.selected.map((i) => i.id),
          stats: result.stats,
        });
      }

      setSelectionStart(null);
      setSelectionCurrent(null);
    }

    setIsPanning(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((prev) => {
      const next = prev * zoomFactor;
      return Math.min(Math.max(next, 0.75), 5);
    });
  };

  // Get icon for incident category
  const renderCategoryIcon = (category: IncidentCategory) => {
    switch (category) {
      case 'Pothole':
        return <Car className="w-2.5 h-2.5" />;
      case 'Water Leakage':
        return <Droplet className="w-2.5 h-2.5" />;
      case 'Broken Streetlight':
        return <Lightbulb className="w-2.5 h-2.5" />;
      case 'Garbage Overflow':
        return <Trash2 className="w-2.5 h-2.5" />;
      case 'Traffic Signal Issue':
        return <Radio className="w-2.5 h-2.5" />;
      case 'Damaged Footpath':
        return <Footprints className="w-2.5 h-2.5" />;
      case 'Drainage Issue':
        return <AlertTriangle className="w-2.5 h-2.5" />;
      default:
        return <MapPin className="w-2.5 h-2.5" />;
    }
  };

  // Severity color mapping
  const getSeverityPinColor = (severity: IncidentSeverity, status: string) => {
    if (status === 'resolved') return '#10b981'; // emerald
    switch (severity) {
      case 'critical':
        return '#e11d48'; // rose-600
      case 'high':
        return '#f97316'; // orange-500
      case 'medium':
        return '#f59e0b'; // amber-500
      case 'low':
        return '#0284c7'; // sky-600
    }
  };

  return (
    <div
      ref={containerRef}
      id="city-intelligence-map-stage"
      className="relative w-full h-[620px] lg:h-[700px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none"
    >
      {/* Top Banner: Transparency & Coordinates */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl text-slate-200 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono-code font-semibold tracking-wide">
            MAYURA METROPOLITAN INFRASTRUCTURE GRID
          </span>
          <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700 rounded font-mono-code">
            DEMO DATA
          </span>
        </div>

        {targetDateIso && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-950/80 backdrop-blur-md border border-indigo-700/60 rounded-xl text-indigo-200 text-[11px] font-mono-code">
            <span className="text-indigo-400 font-bold">TIMELINE:</span>
            <span>{new Date(targetDateIso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        )}
      </div>

      {/* Floating Controls: Zoom & Layers */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Layer Toggle Quick Button */}
        <div className="relative">
          <button
            onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-lg transition-colors ${
              isLayerMenuOpen
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800'
            }`}
            title="Toggle Map Layers"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layers</span>
          </button>

          {/* Layers Popover Menu */}
          {isLayerMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 p-3 bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl z-30 space-y-2 text-slate-200 text-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pb-1 border-b border-slate-800">
                Display Layers
              </div>

              <label className="flex items-center justify-between cursor-pointer py-1 px-1.5 rounded hover:bg-slate-800/60">
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Incident Markers</span>
                </span>
                <input
                  type="checkbox"
                  checked={layers.showMarkers}
                  onChange={() => onToggleLayer('showMarkers')}
                  className="rounded border-slate-600 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 px-1.5 rounded hover:bg-slate-800/60">
                <span className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-purple-400" />
                  <span>Proximity Clusters</span>
                </span>
                <input
                  type="checkbox"
                  checked={layers.showClusters}
                  onChange={() => onToggleLayer('showClusters')}
                  className="rounded border-slate-600 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 px-1.5 rounded hover:bg-slate-800/60">
                <span className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  <span>Chronic Hotspots</span>
                </span>
                <input
                  type="checkbox"
                  checked={layers.showHotspots}
                  onChange={() => onToggleLayer('showHotspots')}
                  className="rounded border-slate-600 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 px-1.5 rounded hover:bg-slate-800/60">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Failure Heatmap</span>
                </span>
                <input
                  type="checkbox"
                  checked={layers.showHeatmap}
                  onChange={() => onToggleLayer('showHeatmap')}
                  className="rounded border-slate-600 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 px-1.5 rounded hover:bg-slate-800/60">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Stormwater Canal</span>
                </span>
                <input
                  type="checkbox"
                  checked={layers.showCanalsAndInfrastructure}
                  onChange={() => onToggleLayer('showCanalsAndInfrastructure')}
                  className="rounded border-slate-600 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer py-1 px-1.5 rounded hover:bg-slate-800/60">
                <span className="flex items-center gap-2">
                  <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Administrative Zones</span>
                </span>
                <input
                  type="checkbox"
                  checked={layers.showZoneBorders}
                  onChange={() => onToggleLayer('showZoneBorders')}
                  className="rounded border-slate-600 text-indigo-600 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          )}
        </div>

        {/* Zoom In, Out, Reset */}
        <div className="flex items-center bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-xl p-1 shadow-lg">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-700 mx-1" />
          <button
            onClick={handleResetView}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Area Selection Indicator Banner */}
      {areaSelection.mode && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <Crosshair className="w-4 h-4 animate-spin text-indigo-200" />
          <span className="text-xs font-semibold">
            {areaSelection.mode === 'box'
              ? 'Click & drag a rectangle across the map to analyze sub-area'
              : 'Click & drag a radius circle across the map to inspect corridor'}
          </span>
          <button
            onClick={() =>
              onAreaSelectionChange({
                isActive: false,
                mode: null,
                bounds: null,
                center: null,
                radiusMeters: null,
                selectedIncidentIds: [],
                stats: null,
              })
            }
            className="text-xs underline text-indigo-100 hover:text-white ml-2"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Interactive SVG GIS Map Canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_VIEWBOX_WIDTH} ${SVG_VIEWBOX_HEIGHT}`}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          {/* Heatmap blur filter */}
          <filter id="heatmap-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="28" result="blur" />
            <feColorMatrix
              type="matrix"
              values="
                1 0 0 0 0
                0 0.8 0 0 0
                0 0 0.2 0 0
                0 0 0 0.7 0"
            />
          </filter>

          {/* Hotspot Radar Glow */}
          <radialGradient id="hotspot-radar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#f43f5e" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
          </radialGradient>

          {/* Grid pattern */}
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(51, 65, 85, 0.25)"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>

        {/* Dynamic Zoom & Pan Group Container */}
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{ transition: isPanning ? 'none' : 'transform 0.15s ease-out' }}
        >
          {/* Background Grid */}
          <rect width={SVG_VIEWBOX_WIDTH} height={SVG_VIEWBOX_HEIGHT} fill="#020617" />
          <rect width={SVG_VIEWBOX_WIDTH} height={SVG_VIEWBOX_HEIGHT} fill="url(#grid-pattern)" />

          {/* 1. Administrative Zones Layer */}
          {layers.showZoneBorders &&
            MAYURA_ADMIN_ZONES.map((zone) => {
              const pointsStr = zone.pathCoordinates
                .map((coord) => {
                  const p = geoToPixel(coord.latitude, coord.longitude);
                  return `${p.x},${p.y}`;
                })
                .join(' ');
              const centerP = geoToPixel(zone.center.latitude, zone.center.longitude);

              return (
                <g key={zone.code} className="zone-polygon">
                  <polygon
                    points={pointsStr}
                    fill={zone.color}
                    fillOpacity="0.04"
                    stroke={zone.color}
                    strokeOpacity="0.35"
                    strokeWidth="1.2"
                    strokeDasharray="4 4"
                  />
                  {/* Zone Label */}
                  <text
                    x={centerP.x}
                    y={centerP.y - 25}
                    textAnchor="middle"
                    fill={zone.color}
                    fillOpacity="0.6"
                    fontSize="11"
                    fontWeight="700"
                    fontFamily="monospace"
                    letterSpacing="1.5"
                  >
                    {zone.name.toUpperCase()}
                  </text>
                  <text
                    x={centerP.x}
                    y={centerP.y - 12}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    Vulnerability: {zone.vulnerabilityScore}/100
                  </text>
                </g>
              );
            })}

          {/* 2. Stormwater Culvert & Canal Network (Subbase Erosion Catalyst) */}
          {layers.showCanalsAndInfrastructure &&
            MAYURA_STORMWATER_CANALS.map((canal) => {
              const pathD = canal.points
                .map((pt, idx) => {
                  const p = geoToPixel(pt.latitude, pt.longitude);
                  return `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
                })
                .join(' ');

              return (
                <g key={canal.name} className="canal-layer">
                  {/* Outer glow channel */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#0284c7"
                    strokeWidth="8"
                    strokeOpacity="0.15"
                    strokeLinecap="round"
                  />
                  {/* Animated flowing canal dash */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeOpacity="0.8"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                  />
                  <text
                    x={geoToPixel(canal.points[2].latitude, canal.points[2].longitude).x + 10}
                    y={geoToPixel(canal.points[2].latitude, canal.points[2].longitude).y}
                    fill="#38bdf8"
                    fillOpacity="0.75"
                    fontSize="8.5"
                    fontWeight="600"
                    fontFamily="monospace"
                  >
                    {canal.name}
                  </text>
                </g>
              );
            })}

          {/* 3. Arterial Road Network Vectors */}
          {MAYURA_ROAD_NETWORK.map((road) => {
            const pathD = road.points
              .map((pt, idx) => {
                const p = geoToPixel(pt.latitude, pt.longitude);
                return `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
              })
              .join(' ');

            const isMetro = road.type === 'metro';
            const isHighway = road.type === 'highway';

            return (
              <g key={road.name} className="road-vector">
                {/* Road Casing */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isMetro ? '#6366f1' : isHighway ? '#334155' : '#1e293b'}
                  strokeWidth={isMetro ? '2.5' : isHighway ? '6' : '4.5'}
                  strokeDasharray={isMetro ? '4 3' : 'none'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Road Centerline */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isMetro ? '#a5b4fc' : isHighway ? '#475569' : '#334155'}
                  strokeWidth={isMetro ? '1' : '1.8'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* 4. Heatmap Layer */}
          {layers.showHeatmap && (
            <g id="heatmap-layer" filter="url(#heatmap-blur)" opacity="0.65">
              {heatmapPoints.map((pt, idx) => {
                const p = geoToPixel(pt.latitude, pt.longitude);
                return (
                  <circle
                    key={`heat-${idx}`}
                    cx={p.x}
                    cy={p.y}
                    r={pt.radius}
                    fill={pt.weight > 0.8 ? '#f43f5e' : pt.weight > 0.5 ? '#f59e0b' : '#3b82f6'}
                    opacity={pt.weight}
                  />
                );
              })}
            </g>
          )}

          {/* 5. Chronic Hotspots Layer (Radar Auras) */}
          {layers.showHotspots &&
            hotspots.map((hotspot) => {
              const p = geoToPixel(hotspot.latitude, hotspot.longitude);
              const isSelected = selectedHotspotId === hotspot.id;

              return (
                <g
                  key={hotspot.id}
                  className="hotspot-node cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectHotspot(hotspot.id);
                  }}
                  onMouseEnter={() => setHoveredHotspot({ hotspot, pixel: p })}
                  onMouseLeave={() => setHoveredHotspot(null)}
                >
                  {/* Radar Pulse Ring 1 */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="40"
                    fill="url(#hotspot-radar-glow)"
                    className="animate-ping origin-center"
                    style={{ animationDuration: '3s' }}
                  />

                  {/* Outer Radar Boundary Ring */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? 32 : 26}
                    fill="#be123c"
                    fillOpacity="0.25"
                    stroke="#f43f5e"
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    strokeDasharray="4 2"
                  />

                  {/* Hotspot Center Core */}
                  <circle cx={p.x} cy={p.y} r="10" fill="#e11d48" stroke="#ffffff" strokeWidth="2" />

                  <Flame className="w-3 h-3 text-white pointer-events-none" x={p.x - 6} y={p.y - 6} />

                  {/* Risk Score Pill on map */}
                  <g transform={`translate(${p.x}, ${p.y + 18})`}>
                    <rect
                      x="-38"
                      y="0"
                      width="76"
                      height="15"
                      rx="7.5"
                      fill="#881337"
                      stroke="#f43f5e"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="11"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8.5"
                      fontWeight="700"
                      fontFamily="monospace"
                    >
                      RISK {hotspot.riskScore}/100
                    </text>
                  </g>
                </g>
              );
            })}

          {/* 6. Proximity Cluster Nodes */}
          {layers.showClusters &&
            clusters.map((cluster) => {
              if (!cluster.pixelPoint) return null;
              const p = cluster.pixelPoint;
              const clusterRadius = Math.min(30, 16 + cluster.count * 3);

              return (
                <g
                  key={cluster.id}
                  className="cluster-node cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Zoom into cluster center
                    setPan({
                      x: SVG_VIEWBOX_WIDTH / 2 - p.x * (zoom * 1.5),
                      y: SVG_VIEWBOX_HEIGHT / 2 - p.y * (zoom * 1.5),
                    });
                    setZoom((prev) => Math.min(prev * 1.5, 4.5));
                  }}
                >
                  {/* Cluster Outer Pulse */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={clusterRadius + 6}
                    fill={cluster.hasCritical ? '#f43f5e' : '#6366f1'}
                    fillOpacity="0.2"
                    className="group-hover:scale-110 transition-transform"
                  />

                  {/* Cluster Circle Body */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={clusterRadius}
                    fill={cluster.hasCritical ? '#be123c' : '#4f46e5'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="shadow-lg"
                  />

                  {/* Cluster Item Count */}
                  <text
                    x={p.x}
                    y={p.y + 4.5}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={cluster.count > 9 ? '11' : '12'}
                    fontWeight="800"
                    fontFamily="monospace"
                  >
                    {cluster.count}
                  </text>
                </g>
              );
            })}

          {/* 7. Individual Incident Pins */}
          {layers.showMarkers &&
            singles.map((inc) => {
              const p = geoToPixel(inc.latitude, inc.longitude);
              const isSelected = selectedIncidentId === inc.id;
              const isRecurrent = inc.recurrenceCount > 0;
              const isCritical = inc.severity === 'critical';
              const pinColor = getSeverityPinColor(inc.severity, inc.status);

              return (
                <g
                  key={inc.id}
                  className="incident-marker cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIncident(inc.id);
                  }}
                  onMouseEnter={() => setHoveredIncident({ incident: inc, pixel: p })}
                  onMouseLeave={() => setHoveredIncident(null)}
                >
                  {/* Active selection halo */}
                  {isSelected && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="20"
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="3"
                      strokeDasharray="4 2"
                      className="animate-spin origin-center"
                      style={{ animationDuration: '8s' }}
                    />
                  )}

                  {/* Recurrence Ping Aura */}
                  {isRecurrent && inc.status !== 'resolved' && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="16"
                      fill={pinColor}
                      fillOpacity="0.2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Pin Body */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? 10 : 8}
                    fill={pinColor}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    className="transition-all hover:scale-125 origin-center shadow-md"
                  />

                  {/* Recurrence Ring Indicator */}
                  {isRecurrent && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 13 : 11}
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="1.5"
                    />
                  )}
                </g>
              );
            })}

          {/* 8. Interactive Area Selection Drag Overlays */}
          {isSelectingArea && selectionStart && selectionCurrent && (
            <g className="area-drag-overlay">
              {areaSelection.mode === 'box' ? (
                <rect
                  x={Math.min(selectionStart.x, selectionCurrent.x)}
                  y={Math.min(selectionStart.y, selectionCurrent.y)}
                  width={Math.abs(selectionCurrent.x - selectionStart.x)}
                  height={Math.abs(selectionCurrent.y - selectionStart.y)}
                  fill="#6366f1"
                  fillOpacity="0.25"
                  stroke="#818cf8"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />
              ) : (
                <circle
                  cx={selectionStart.x}
                  cy={selectionStart.y}
                  r={Math.sqrt(
                    Math.pow(selectionCurrent.x - selectionStart.x, 2) +
                      Math.pow(selectionCurrent.y - selectionStart.y, 2)
                  )}
                  fill="#6366f1"
                  fillOpacity="0.25"
                  stroke="#818cf8"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />
              )}
            </g>
          )}

          {/* Active Area Selection Outline (when persistent) */}
          {areaSelection.isActive && !isSelectingArea && (
            <g className="active-area-selection">
              {areaSelection.mode === 'box' && areaSelection.bounds && (
                (() => {
                  const p1 = geoToPixel(areaSelection.bounds.maxLat, areaSelection.bounds.minLng);
                  const p2 = geoToPixel(areaSelection.bounds.minLat, areaSelection.bounds.maxLng);
                  return (
                    <rect
                      x={p1.x}
                      y={p1.y}
                      width={Math.abs(p2.x - p1.x)}
                      height={Math.abs(p2.y - p1.y)}
                      fill="#6366f1"
                      fillOpacity="0.12"
                      stroke="#818cf8"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />
                  );
                })()
              )}
              {areaSelection.mode === 'radius' && areaSelection.center && areaSelection.radiusMeters && (
                (() => {
                  const cp = geoToPixel(areaSelection.center.latitude, areaSelection.center.longitude);
                  const pixelR = areaSelection.radiusMeters / 14.5;
                  return (
                    <circle
                      cx={cp.x}
                      cy={cp.y}
                      r={pixelR}
                      fill="#6366f1"
                      fillOpacity="0.12"
                      stroke="#818cf8"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    />
                  );
                })()
              )}
            </g>
          )}
        </g>
      </svg>

      {/* Hover Tooltip Overlay */}
      {hoveredIncident && (
        <div
          className="absolute z-30 pointer-events-none p-3 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl text-white text-xs max-w-xs transition-opacity duration-150"
          style={{
            left: `${Math.min(Math.max(hoveredIncident.pixel.x * (zoom) + pan.x, 20), 550)}px`,
            top: `${Math.max(hoveredIncident.pixel.y * (zoom) + pan.y - 110, 20)}px`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono-code font-bold text-indigo-400 text-[10px]">
              {hoveredIncident.incident.id}
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                hoveredIncident.incident.severity === 'critical'
                  ? 'bg-rose-900/80 text-rose-300 border border-rose-700'
                  : 'bg-amber-900/80 text-amber-300 border border-amber-700'
              }`}
            >
              {hoveredIncident.incident.severity}
            </span>
            {hoveredIncident.incident.recurrenceCount > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-purple-900/80 text-purple-300 border border-purple-700">
                {hoveredIncident.incident.recurrenceCount}x Recurrent
              </span>
            )}
          </div>
          <div className="font-bold text-slate-100 text-[12px] truncate">
            {hoveredIncident.incident.title}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate">
            {hoveredIncident.incident.address}
          </div>
        </div>
      )}

      {/* Hotspot Hover Tooltip */}
      {hoveredHotspot && (
        <div
          className="absolute z-30 pointer-events-none p-3 bg-slate-900/95 backdrop-blur-md border border-rose-700/80 rounded-xl shadow-2xl text-white text-xs max-w-xs"
          style={{
            left: `${Math.min(Math.max(hoveredHotspot.pixel.x * zoom + pan.x, 20), 550)}px`,
            top: `${Math.max(hoveredHotspot.pixel.y * zoom + pan.y - 120, 20)}px`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-bold text-rose-300 text-xs">CHRONIC HOTSPOT</span>
            <span className="font-mono-code text-[10px] text-rose-400 font-bold ml-auto">
              Risk: {hoveredHotspot.hotspot.riskScore}/100
            </span>
          </div>
          <div className="font-bold text-slate-100 text-xs">{hoveredHotspot.hotspot.locationName}</div>
          <div className="text-[10px] text-slate-400 mt-1">
            {hoveredHotspot.hotspot.incidentCount} failures logged ({hoveredHotspot.hotspot.repairCount} repairs recorded)
          </div>
        </div>
      )}

      {/* Bottom Map Legend & Scale Bar */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-3 px-3 py-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl text-slate-300 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Resolved</span>
        </div>
        <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
          <span className="w-3 h-3 rounded-full border-2 border-purple-400" />
          <span>Recurring (≥ 2x)</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-700 font-mono-code text-[10px] text-slate-400">
          <span>SCALE: 1km</span>
          <div className="w-12 h-1 bg-slate-400 rounded-full" />
        </div>
      </div>
    </div>
  );
};
