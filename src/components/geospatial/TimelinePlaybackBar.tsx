import React, { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  Wrench,
} from 'lucide-react';
import { TimelinePlaybackState } from '../../services/geospatial/types';

interface TimelinePlaybackBarProps {
  playback: TimelinePlaybackState;
  onPlaybackChange: (state: TimelinePlaybackState) => void;
  totalIncidentsCount: number;
  visibleIncidentsCount: number;
}

// Major chronological milestone events in Mayura Metro City
const TIMELINE_MILESTONES = [
  { date: '2026-07-14', label: 'REP-201 Tonk Cold Patch', type: 'repair' },
  { date: '2026-08-02', label: 'REP-202 Culvert Desiltation', type: 'repair' },
  { date: '2026-08-16', label: 'INC-1018 Crater Re-emergence', type: 'recurrence' },
  { date: '2026-09-02', label: 'REP-207 Controller Recalibration', type: 'repair' },
  { date: '2026-09-14', label: 'INC-1048 Chronic Re-emergence', type: 'recurrence' },
];

export const TimelinePlaybackBar: React.FC<TimelinePlaybackBarProps> = ({
  playback,
  onPlaybackChange,
  totalIncidentsCount,
  visibleIncidentsCount,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const minTime = new Date(playback.minDate).getTime();
  const maxTime = new Date(playback.maxDate).getTime();
  const currentTime = new Date(playback.currentDate).getTime();

  // Handle Playback Interval Loop
  useEffect(() => {
    if (playback.isPlaying) {
      const intervalMs = 600 / playback.speed;
      timerRef.current = setInterval(() => {
        const cur = new Date(playback.currentDate).getTime();
        // Advance by 1.5 days per tick
        const nextTime = cur + 1.5 * 24 * 3600 * 1000;

        if (nextTime >= maxTime) {
          onPlaybackChange({
            ...playback,
            currentDate: playback.maxDate,
            isPlaying: false,
            progressPercent: 100,
          });
        } else {
          const progress = Math.min(
            100,
            Math.round(((nextTime - minTime) / (maxTime - minTime)) * 100)
          );
          onPlaybackChange({
            ...playback,
            currentDate: new Date(nextTime).toISOString(),
            progressPercent: progress,
          });
        }
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playback, minTime, maxTime, onPlaybackChange]);

  const togglePlay = () => {
    if (!playback.isPlaying && currentTime >= maxTime) {
      // Restart from beginning if reached end
      onPlaybackChange({
        ...playback,
        currentDate: playback.minDate,
        isPlaying: true,
        progressPercent: 0,
      });
    } else {
      onPlaybackChange({
        ...playback,
        isPlaying: !playback.isPlaying,
      });
    }
  };

  const cycleSpeed = () => {
    const nextSpeed: 1 | 2 | 4 =
      playback.speed === 1 ? 2 : playback.speed === 2 ? 4 : 1;
    onPlaybackChange({
      ...playback,
      speed: nextSpeed,
    });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percent = parseFloat(e.target.value);
    const newTime = minTime + (percent / 100) * (maxTime - minTime);
    onPlaybackChange({
      ...playback,
      currentDate: new Date(newTime).toISOString(),
      progressPercent: percent,
      isPlaying: false,
    });
  };

  const stepDays = (days: number) => {
    const newTime = Math.min(
      maxTime,
      Math.max(minTime, currentTime + days * 24 * 3600 * 1000)
    );
    const percent = Math.round(((newTime - minTime) / (maxTime - minTime)) * 100);
    onPlaybackChange({
      ...playback,
      currentDate: new Date(newTime).toISOString(),
      progressPercent: percent,
      isPlaying: false,
    });
  };

  const resetToLatest = () => {
    onPlaybackChange({
      ...playback,
      currentDate: playback.maxDate,
      progressPercent: 100,
      isPlaying: false,
    });
  };

  const formattedCurrentDate = new Date(playback.currentDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      id="timeline-playback-bar"
      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-slate-800 space-y-3"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        {/* Left: Play/Pause and step controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="w-9 h-9 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
            title={playback.isPlaying ? 'Pause Simulation' : 'Play Spatial History Simulation'}
          >
            {playback.isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => stepDays(-7)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Step Back 7 Days"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => stepDays(7)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Step Forward 7 Days"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={cycleSpeed}
            className="px-2 py-1 text-xs font-mono-code font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            title="Toggle Playback Speed"
          >
            {playback.speed}x Speed
          </button>
        </div>

        {/* Center: Current Timeline Date */}
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50/80 rounded-xl border border-indigo-100 text-xs font-semibold text-indigo-950">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          <span>{formattedCurrentDate}</span>
        </div>

        {/* Right: Visible status & Reset to Latest */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">TEMPORAL SLICE</span>
            <span className="text-xs font-mono-code font-bold text-slate-800">
              {visibleIncidentsCount} of {totalIncidentsCount} Incidents Logged
            </span>
          </div>

          <button
            onClick={resetToLatest}
            className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Latest Data
          </button>
        </div>
      </div>

      {/* Scrubber Slider */}
      <div className="relative pt-1">
        <input
          type="range"
          min="0"
          max="100"
          step="0.5"
          value={playback.progressPercent}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />

        {/* Timeline Milestones Markers along track */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono-code">
          <span>July 8, 2026 (Monsoon Start)</span>
          <span className="hidden md:inline text-purple-700 font-semibold">
            Aug 16 (Tonk Crater Re-emergence)
          </span>
          <span className="hidden sm:inline text-indigo-700 font-semibold">
            Sept 14 (Chronic Re-emergence)
          </span>
          <span>Sept 20, 2026 (Present)</span>
        </div>
      </div>
    </div>
  );
};
