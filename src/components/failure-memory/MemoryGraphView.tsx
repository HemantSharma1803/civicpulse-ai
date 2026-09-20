import React, { useState, useMemo } from 'react';
import {
  AlertCircle,
  Clock,
  Info,
  Layers,
  Network,
  Maximize2,
  Minimize2,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { MemoryGraphData, MemoryGraphNode } from '../../services/failure-memory';

interface MemoryGraphViewProps {
  graph: MemoryGraphData;
  onSelectIncident?: (id: string) => void;
  className?: string;
}

export const MemoryGraphView: React.FC<MemoryGraphViewProps> = ({
  graph,
  onSelectIncident,
  className = '',
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Compute 2D node positions in a neat radial layout around the center
  const layout = useMemo(() => {
    const width = 640;
    const height = 340;
    const centerX = width / 2;
    const centerY = height / 2;

    const nodePositions: Record<string, { x: number; y: number }> = {};
    const primary = graph.nodes.find((n) => n.isCurrent) || graph.nodes[0];

    if (primary) {
      nodePositions[primary.id] = { x: centerX, y: centerY };
    }

    const otherNodes = graph.nodes.filter((n) => n.id !== primary?.id);
    const count = otherNodes.length;

    if (count > 0) {
      const radius = count <= 3 ? 120 : count <= 6 ? 140 : 155;
      const angleStep = (2 * Math.PI) / count;

      otherNodes.forEach((node, idx) => {
        const angle = idx * angleStep - Math.PI / 2;
        nodePositions[node.id] = {
          x: Math.round(centerX + radius * Math.cos(angle)),
          y: Math.round(centerY + radius * Math.sin(angle)),
        };
      });
    }

    return { width, height, nodePositions };
  }, [graph]);

  const activeNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return graph.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, graph]);

  return (
    <div
      id="memory-graph-view"
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Network className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Interactive Failure Memory Graph
            </h3>
            <p className="text-xs text-slate-500">
              Topological relationship network of reports, work orders, and temporal linkages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
            Current Focus
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Historical Incidents
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Repairs
          </span>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="relative mt-4 flex flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 p-2">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="h-[320px] w-full max-w-[640px] select-none"
        >
          {/* Edge lines */}
          <g>
            {graph.edges.map((edge) => {
              const src = layout.nodePositions[edge.source];
              const tgt = layout.nodePositions[edge.target];
              if (!src || !tgt) return null;

              const isRepair = edge.isRepairLink;
              const strokeColor = isRepair
                ? '#10b981'
                : edge.relationType === 'LIKELY_DUPLICATE'
                ? '#f59e0b'
                : '#6366f1';

              const midX = (src.x + tgt.x) / 2;
              const midY = (src.y + tgt.y) / 2;

              return (
                <g key={edge.id}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={strokeColor}
                    strokeWidth={isRepair ? 2 : 2.5}
                    strokeDasharray={isRepair ? '4 3' : undefined}
                    strokeOpacity={0.7}
                  />
                  {/* Edge label pill */}
                  <rect
                    x={midX - 38}
                    y={midY - 9}
                    width="76"
                    height="18"
                    rx="9"
                    fill="#ffffff"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                  <text
                    x={midX}
                    y={midY + 3.5}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="600"
                    fill="#475569"
                  >
                    {edge.label.length > 14 ? edge.label.slice(0, 13) + '…' : edge.label}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Node circles */}
          <g>
            {graph.nodes.map((node) => {
              const pos = layout.nodePositions[node.id];
              if (!pos) return null;

              const isPrimary = node.isCurrent;
              const isRepair = node.type === 'REPAIR';
              const isSelected = selectedNodeId === node.id;

              const fillColor = isPrimary
                ? '#4f46e5'
                : isRepair
                ? '#10b981'
                : '#f59e0b';

              const radius = isPrimary ? 24 : isRepair ? 19 : 21;

              return (
                <g
                  key={node.id}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => {
                    setSelectedNodeId(node.id);
                    if (node.type !== 'REPAIR' && onSelectIncident) {
                      onSelectIncident(node.id);
                    }
                  }}
                >
                  {/* Halo highlight */}
                  {(isPrimary || isSelected) && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius + 6}
                      fill={fillColor}
                      fillOpacity={0.18}
                      className="animate-pulse"
                    />
                  )}

                  {/* Base Circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill={fillColor}
                    stroke="#ffffff"
                    strokeWidth="3"
                  />

                  {/* Icon or ID Label */}
                  <text
                    x={pos.x}
                    y={pos.y + 3.5}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="700"
                  >
                    {isRepair ? 'REP' : node.id.replace('INC-', '')}
                  </text>

                  {/* Subtext underneath */}
                  <text
                    x={pos.x}
                    y={pos.y + radius + 13}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="#1e293b"
                  >
                    {node.id}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Selected Node Details Floating Overlay */}
        {activeNode && (
          <div className="absolute bottom-3 left-3 right-3 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-md backdrop-blur-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-slate-900">
                  {activeNode.id}: {activeNode.sublabel}
                </span>
                {activeNode.isCurrent && (
                  <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                    PRIMARY INCIDENT
                  </span>
                )}
                {activeNode.type === 'REPAIR' && (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    WORK ORDER REPAIR
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
              {activeNode.category && <span>Category: {activeNode.category}</span>}
              {activeNode.status && <span>Status: {activeNode.status}</span>}
              {activeNode.severity && <span>Severity: {activeNode.severity}</span>}
              {activeNode.date && <span>Date: {activeNode.date.split('T')[0]}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
