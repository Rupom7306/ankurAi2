import React from 'react';
import { CropBatch, SensorReading } from '../types';
import { 
  MapPin, 
  Calendar, 
  Cpu, 
  QrCode, 
  AlertCircle, 
  Droplets,
  ArrowRight
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
  // Determine health condition style & glow
  const getConditionStyle = (cond: CropBatch['condition']) => {
    switch (cond) {
      case 'Excellent':
        return {
          textColor: 'text-parrot-400',
          bgColor: 'bg-parrot-500/10 border-parrot-500/30',
          glow: 'shadow-glow-sm',
          strokeColor: '#16E05C',
        };
      case 'Healthy':
        return {
          textColor: 'text-emerald-400',
          bgColor: 'bg-emerald-500/10 border-emerald-500/30',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
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
          glow: 'shadow-glow-warning',
          strokeColor: '#F59E0B',
        };
      case 'Critical':
        return {
          textColor: 'text-rose-400',
          bgColor: 'bg-rose-500/15 border-rose-500/40',
          glow: 'shadow-glow-danger',
          strokeColor: '#EF4444',
        };
    }
  };

  const style = getConditionStyle(batch.condition);

  return (
    <div className={`card-glass relative rounded-2xl p-5 sm:p-6 border border-dark-750 hover:border-parrot-500/40 transition-all duration-300 ${style.glow} group`}>
      {/* Top Header: Batch Name & Priority Badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌾</span>
            <h4 className="text-lg font-bold text-white group-hover:text-parrot-300 transition-colors">
              {batch.batchName}
            </h4>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            Variety: <span className="text-slate-200">{batch.cropType} {batch.variety ? `(${batch.variety})` : ''}</span>
          </p>
        </div>

        {/* Priority Badge */}
        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
              batch.priority === 'Critical'
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : batch.priority === 'High'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-dark-800 text-parrot-400 border-parrot-500/30'
            }`}
          >
            {batch.priority} Priority
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            ID: {batch.id.substring(0, 8)}
          </span>
        </div>
      </div>

      {/* Middle Grid: Circular Health Score & Farm Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-dark-900/70 border border-dark-800/80 mb-5">
        {/* Health Score Gauge */}
        <div className="flex items-center gap-3.5 sm:col-span-1">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="currentColor"
                strokeWidth="5"
                className="text-dark-800"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke={style.strokeColor}
                strokeWidth="5"
                strokeDasharray={163.36}
                strokeDashoffset={163.36 - (163.36 * batch.healthScore) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-base font-extrabold text-white">
                {batch.healthScore}%
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
              Condition
            </span>
            <span className={`text-sm font-bold ${style.textColor}`}>
              {batch.condition}
            </span>
            <div className="text-[10px] text-slate-400">
              Phenology: {batch.growthStage}
            </div>
          </div>
        </div>

        {/* Location & Dates */}
        <div className="flex flex-col justify-center gap-1.5 sm:col-span-2 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-parrot-400 shrink-0" />
            <span className="truncate">{batch.farmLocation.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-parrot-400 shrink-0" />
            <span>Sown: {batch.plantingDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-parrot-400 shrink-0" />
            <span className="font-mono text-[11px] text-slate-400">Sensor: {batch.sensorSetId}</span>
          </div>
        </div>
      </div>

      {/* Sensor Ingestion Snapshot */}
      {sensorData && (
        <div className="mb-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold flex items-center gap-1.5 text-slate-300">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Soil & Mineral Telemetry (10-Min Sync)
            </span>
            <span className="text-[10px] font-mono text-parrot-400/90">LIVE READINGS</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-lg bg-dark-950/70 border border-dark-800">
              <div className="text-[10px] text-slate-400 font-bold">Nitrogen (N)</div>
              <div className="text-sm font-extrabold text-parrot-400">{sensorData.nitrogen} <span className="text-[9px] font-normal text-slate-400">mg/kg</span></div>
            </div>
            <div className="p-2 rounded-lg bg-dark-950/70 border border-dark-800">
              <div className="text-[10px] text-slate-400 font-bold">Phosphorus (P)</div>
              <div className="text-sm font-extrabold text-cyan-400">{sensorData.phosphorus} <span className="text-[9px] font-normal text-slate-400">mg/kg</span></div>
            </div>
            <div className="p-2 rounded-lg bg-dark-950/70 border border-dark-800">
              <div className="text-[10px] text-slate-400 font-bold">Potassium (K)</div>
              <div className="text-sm font-extrabold text-emerald-400">{sensorData.potassium} <span className="text-[9px] font-normal text-slate-400">mg/kg</span></div>
            </div>
            <div className="p-2 rounded-lg bg-dark-950/70 border border-dark-800">
              <div className="text-[10px] text-slate-400 font-bold">Humidity</div>
              <div className="text-sm font-extrabold text-sky-400">{sensorData.soilHumidity}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Critical Issue Red Warning Banner if needed */}
      {batch.activeIssuesCount > 0 && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs mb-4">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
          <span>
            <strong>{batch.activeIssuesCount} Suspected Issue(s)</strong> detected. Urgent scan recommended.
          </span>
        </div>
      )}

      {/* Card Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-dark-800 text-xs">
        <button
          onClick={() => onScanClick && onScanClick(batch)}
          className="flex items-center gap-1.5 text-slate-300 hover:text-parrot-400 font-medium transition-colors"
        >
          <QrCode className="w-4 h-4 text-parrot-400" />
          <span>Batch QR</span>
        </button>

        <button
          onClick={() => onSelectBatch && onSelectBatch(batch.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-parrot-500/10 hover:bg-parrot-500/20 text-parrot-300 border border-parrot-500/30 font-semibold transition-all group-hover:translate-x-0.5"
        >
          <span>View Batch Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
