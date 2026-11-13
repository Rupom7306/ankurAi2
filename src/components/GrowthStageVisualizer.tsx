import React from 'react';
import { GrowthStage } from '../types';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface GrowthStageVisualizerProps {
  currentStage: GrowthStage;
  className?: string;
}

export const GrowthStageVisualizer: React.FC<GrowthStageVisualizerProps> = ({
  currentStage,
  className = '',
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

  return (
    <div className={`card-glass rounded-2xl p-5 sm:p-6 border border-dark-700/80 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
              Growth Stage Phenology
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-parrot-500/15 text-parrot-400 font-semibold border border-parrot-500/30">
              5-Stage Tracker
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time biometric monitoring correlated with planting dates and visual signatures
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-parrot-300 bg-dark-900/80 px-3 py-1.5 rounded-xl border border-parrot-500/20">
          <Sparkles className="w-3.5 h-3.5 text-parrot-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Active: <strong className="text-white">{currentStage}</strong></span>
        </div>
      </div>

      {/* Progress Flow */}
      <div className="relative">
        {/* Connecting Progress Line */}
        <div className="hidden md:block absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-dark-800 rounded-full z-0">
          <div
            className="h-full bg-gradient-to-r from-parrot-600 via-parrot-400 to-parrot-300 rounded-full transition-all duration-700 shadow-glow-sm"
            style={{
              width: `${(Math.max(0, currentIdx) / (stages.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
          {stages.map((stage, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;

            return (
              <div
                key={stage.id}
                className={`relative flex md:flex-col items-center md:items-center gap-3 md:gap-2 p-3 rounded-xl transition-all duration-300 ${
                  isCurrent
                    ? 'bg-dark-850/90 border border-parrot-500 shadow-glow-sm'
                    : isCompleted
                    ? 'bg-dark-900/60 border border-dark-750'
                    : 'bg-dark-950/40 border border-dark-800/60 opacity-60'
                }`}
              >
                {/* Node icon / indicator */}
                <div
                  className={`relative flex items-center justify-center w-12 h-12 rounded-2xl text-xl transition-all ${
                    isCurrent
                      ? 'bg-dark-800 border-2 border-parrot-400 shadow-glow-md text-parrot-300 scale-105'
                      : isCompleted
                      ? 'bg-parrot-950/80 border border-parrot-600 text-parrot-400'
                      : 'bg-dark-900 border border-dark-700 text-slate-500'
                  }`}
                >
                  <span>{stage.icon}</span>

                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 bg-parrot-500 text-dark-950 rounded-full p-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}

                  {isCurrent && (
                    <span className="absolute -inset-1 rounded-2xl bg-parrot-400/20 animate-pulse -z-10" />
                  )}
                </div>

                {/* Text details */}
                <div className="flex-1 md:text-center">
                  <div className="flex md:justify-center items-center gap-1.5">
                    <span
                      className={`text-sm font-bold ${
                        isCurrent ? 'text-parrot-300' : isCompleted ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                  <div className="text-xs font-bengali text-slate-400 font-medium">
                    {stage.bengali}
                  </div>
                  <div className="hidden lg:block text-[11px] text-slate-400 mt-1 leading-tight">
                    {stage.description}
                  </div>
                </div>

                {/* Stage number badge */}
                <div className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-800 text-slate-400 border border-dark-700">
                  Step {idx + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
