import React, { useState } from 'react';
import { CropBatch, SensorReading } from '../types';
import { 
  MapPin, 
  Calendar, 
  Cpu, 
  QrCode, 
  AlertCircle, 
  Droplets,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Activity
} from 'lucide-react';

interface BatchCardPreviewProps {
  batch: CropBatch;
  sensorData?: SensorReading;
  onSelectBatch?: (batchId: string) => void;
  onScanClick?: (batch: CropBatch) => void;
}

export const BatchCardPreview: React.FC<BatchCardPreviewProps> = ({
  batch,
  sensorData,
  onSelectBatch,
  onScanClick,
}) => {
  // State to toggle hidden crop conditions & sensor info
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine health condition style & glow
  const getConditionStyle = (cond: CropBatch['condition']) => {
    switch (cond) {
      case 'Excellent':
        return {
          textColor: 'text-parrot-400',
          bgColor: 'bg-parrot-500/10 border-parrot-500/30',
          glow: 'hover:shadow-glow-sm',
          strokeColor: '#16E05C',
        };
      case 'Healthy':
        return {
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10 border-emerald-500/30',
          glow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]',
          strokeColor: '#10B981',
        };
      case 'Moderate':
        return {
          textColor: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10 border-yellow-500/30',
          glow: '',
          strokeColor: '#EAB308',
        };
      case 'At Risk':
        return {
          textColor: 'text-amber-400',
          bgColor: 'bg-amber-500/10 border-amber-500/30',
          glow: 'hover:shadow-glow-warning',
          strokeColor: '#F59E0B',
        };
      case 'Critical':
        return {
          textColor: 'text-rose-400',
          bgColor: 'bg-rose-500/15 border-rose-500/40',
          glow: 'hover:shadow-glow-danger',
          strokeColor: '#EF4444',
        };
    }
  };

  const style = getConditionStyle(batch.condition);

  return (
    <div className={`card-glass rounded-2xl p-5 border border-dark-750 hover:border-parrot-500/40 transition-all duration-300 ${style.glow}`}>
      
      {/* Top Header: Batch Name, Priority & Quick Health Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🌾</span>
            <h4 className="text-base sm:text-lg font-bold text-white">
              {batch.batchName}
            </h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {batch.cropType} {batch.variety ? `• ${batch.variety}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Health Score pill */}
          <span className={`text-xs px-2.5 py-1 rounded-lg font-bold border ${style.bgColor} ${style.textColor}`}>
            {batch.healthScore}% • {batch.condition}
          </span>
          
          <span
            className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
              batch.priority === 'Critical'
                ? 'bg-rose-500/20 text-rose-400'
                : batch.priority === 'High'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-dark-800 text-parrot-400'
            }`}
          >
            {batch.priority}
          </span>
        </div>
      </div>

      {/* BUTTON TO EXPAND / HIDE CROP CONDITIONS & SENSOR DETAILS */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3.5 py-2 my-2 rounded-xl bg-dark-900/90 hover:bg-dark-850 border border-dark-800 hover:border-parrot-500/30 text-xs text-slate-300 hover:text-parrot-300 transition-all group"
      >
        <span className="flex items-center gap-2 font-medium">
          <Activity className="w-3.5 h-3.5 text-parrot-400" />
          <span>{isExpanded ? 'Hide Crop Conditions & Sensors' : 'View Crop Conditions & Sensors'}</span>
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-parrot-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-parrot-400" />
        )}
      </button>

      {/* HIDDEN DETAILS (Only visible when button is clicked to expand) */}
      {isExpanded && (
        <div className="space-y-4 pt-2 animate-fadeIn">
          {/* Health Gauge & Location details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-dark-950/80 border border-dark-800">
            {/* Health Score Gauge */}
            <div className="flex items-center gap-3 sm:col-span-1">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="19"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-dark-800"
                    fill="transparent"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="19"
                    stroke={style.strokeColor}
                    strokeWidth="4"
                    strokeDasharray={119.38}
                    strokeDashoffset={119.38 - (119.38 * batch.healthScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute text-xs font-extrabold text-white">
                  {batch.healthScore}%
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Status</span>
                <span className={`text-xs font-bold ${style.textColor}`}>{batch.condition}</span>
                <div className="text-[10px] text-slate-400">Stage: {batch.growthStage}</div>
              </div>
            </div>

            {/* Location & Metadata */}
            <div className="flex flex-col justify-center gap-1 sm:col-span-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-parrot-400 shrink-0" />
                <span className="truncate">{batch.farmLocation.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-parrot-400 shrink-0" />
                <span>Planted: {batch.plantingDate}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-parrot-400 shrink-0" />
                <span>Sensor ID: {batch.sensorSetId}</span>
              </div>
            </div>
          </div>

          {/* Sensor Readings Grid (NPK + Humidity) */}
          {sensorData && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span className="font-semibold flex items-center gap-1 text-slate-300">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  Live Soil Conditions
                </span>
                <span className="text-[10px] font-mono text-parrot-400">10-Min Telemetry</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-lg bg-dark-950 border border-dark-800">
                  <div className="text-[10px] text-slate-400">N</div>
                  <div className="text-xs font-extrabold text-parrot-400">{sensorData.nitrogen}</div>
                </div>
                <div className="p-2 rounded-lg bg-dark-950 border border-dark-800">
                  <div className="text-[10px] text-slate-400">P</div>
                  <div className="text-xs font-extrabold text-cyan-400">{sensorData.phosphorus}</div>
                </div>
                <div className="p-2 rounded-lg bg-dark-950 border border-dark-800">
                  <div className="text-[10px] text-slate-400">K</div>
                  <div className="text-xs font-extrabold text-emerald-400">{sensorData.potassium}</div>
                </div>
                <div className="p-2 rounded-lg bg-dark-950 border border-dark-800">
                  <div className="text-[10px] text-slate-400">Humidity</div>
                  <div className="text-xs font-extrabold text-sky-400">{sensorData.soilHumidity}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Warning banner if active issues */}
          {batch.activeIssuesCount > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{batch.activeIssuesCount} issue(s) flagged for attention.</span>
            </div>
          )}
        </div>
      )}

      {/* Card Action Footer */}
      <div className="flex items-center justify-between pt-3 mt-1 border-t border-dark-800 text-xs">
        <button
          onClick={() => onScanClick && onScanClick(batch)}
          className="flex items-center gap-1.5 text-slate-300 hover:text-parrot-400 transition-colors"
        >
          <QrCode className="w-3.5 h-3.5 text-parrot-400" />
          <span>Batch QR</span>
        </button>

        <button
          onClick={() => onSelectBatch && onSelectBatch(batch.id)}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-parrot-500/10 hover:bg-parrot-500/20 text-parrot-300 border border-parrot-500/30 font-semibold transition-all"
        >
          <span>Batch Details</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
};
