import React from 'react';
import { GrowthStage } from '../types';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface GrowthStageVisualizerProps {
  currentStage: GrowthStage;
  className?: string;
  onSelectStage?: (stage: GrowthStage) => void;
}

export const GrowthStageVisualizer: React.FC<GrowthStageVisualizerProps> = ({
  currentStage,
  className = '',
  onSelectStage,
}) => {
  const stages: Array<{
    id: GrowthStage;
    label: string;
    bengali: string;
    icon: string;
    description: string;
  }> = [
    {
      id: 'Germination',
      label: 'Germination',
      bengali: 'অঙ্কুরোদগম',
      icon: '🌱',
      description: 'Radicle & coleoptile emergence',
    },
    {
      id: 'Seedling',
      label: 'Seedling',
      bengali: 'চারা অবস্থা',
      icon: '🌿',
      description: 'First true leaves & root establishment',
    },
    {
      id: 'Vegetative',
      label: 'Vegetative Growth',
      bengali: 'অঙ্গজ বৃদ্ধি',
      icon: '🌾',
      description: 'Canopy expansion & high NPK uptake',
    },
    {
      id: 'Reproductive',
      label: 'Reproductive',
      bengali: 'ফুল ও প্রজনন',
      icon: '🌸',
      description: 'Flowering, pollination & fruit/grain set',
    },
    {
      id: 'Maturity',
      label: 'Maturity / Harvest',
      bengali: 'পরিপক্বতা ও ফসল',
      icon: '🧺',
      description: 'Grain ripening & optimum harvest window',
    },
  ];

  const currentIdx = stages.findIndex((s) => s.id === currentStage);
  const progressPercent = Math.round(((currentIdx + 1) / stages.length) * 100);

  return (
    <div className={`card-glass rounded-2xl p-5 sm:p-6 border border-dark-700/80 ${className}`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Growth Stage Phenology
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-parrot-500/15 text-parrot-400 font-semibold border border-parrot-500/30">
              5-Stage Biometric Tracker
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time biometric monitoring correlated with planting dates and visual signatures
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-parrot-300 bg-dark-900/90 px-3 py-1.5 rounded-xl border border-parrot-500/30">
          <Sparkles className="w-3.5 h-3.5 text-parrot-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Active Phenology: <strong className="text-white">{currentStage}</strong></span>
        </div>
      </div>

      {/* Clean Dedicated Progress Track (Eliminates glitchy overlapping line) */}
      <div className="mb-6 bg-dark-900/80 p-3 rounded-xl border border-dark-800">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400 font-medium">Growth Journey Progress</span>
          <span className="text-parrot-400 font-mono font-bold">
            Stage {currentIdx + 1} of {stages.length} ({progressPercent}% Complete)
          </span>
        </div>
        <div className="h-2.5 w-full bg-dark-950 rounded-full overflow-hidden border border-dark-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-parrot-600 via-parrot-400 to-parrot-300 rounded-full transition-all duration-500 shadow-glow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 5 Stage Level Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {stages.map((stage, idx) => {
          const isCompleted = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div
              key={stage.id}
              onClick={() => onSelectStage && onSelectStage(stage.id)}
              className={`relative flex flex-col justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                isCurrent
                  ? 'bg-dark-850 border-2 border-parrot-400 shadow-glow-sm ring-1 ring-parrot-400/40 scale-[1.02]'
                  : isCompleted
                  ? 'bg-dark-900 border border-parrot-600/40 hover:border-parrot-500/60'
                  : 'bg-dark-950/80 border border-dark-800 hover:border-dark-700 opacity-70 hover:opacity-90'
              }`}
            >
              {/* Step indicator header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-dark-800 text-slate-400 border border-dark-700">
                  Step {idx + 1}
                </span>

                {isCompleted && (
                  <span className="flex items-center gap-1 text-[10px] text-parrot-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-parrot-400" />
                    <span>Done</span>
                  </span>
                )}

                {isCurrent && (
                  <span className="flex items-center gap-1 text-[10px] text-parrot-300 font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-parrot-400"></span>
                    <span>Current</span>
                  </span>
                )}
              </div>

              {/* Icon & Label */}
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`flex items-center justify-center w-11 h-11 rounded-xl text-xl shrink-0 transition-transform ${
                    isCurrent
                      ? 'bg-dark-800 border border-parrot-400 text-parrot-300 shadow-glow-sm scale-105'
                      : isCompleted
                      ? 'bg-parrot-950/80 border border-parrot-700 text-parrot-400'
                      : 'bg-dark-900 border border-dark-800 text-slate-500'
                  }`}
                >
                  {stage.icon}
                </div>

                <div>
                  <h4
                    className={`text-sm font-bold leading-tight ${
                      isCurrent ? 'text-parrot-300' : isCompleted ? 'text-white' : 'text-slate-300'
                    }`}
                  >
                    {stage.label}
                  </h4>
                  <p className="text-xs font-bengali text-slate-400 font-medium">
                    {stage.bengali}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-[11px] text-slate-400 mt-2 leading-tight">
                {stage.description}
              </p>

              {/* Subtle active underline glow */}
              {isCurrent && (
                <div className="mt-3 h-1 w-full bg-parrot-500 rounded-full shadow-glow-sm" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
