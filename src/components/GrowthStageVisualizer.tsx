import React from 'react';
import { GrowthStage } from '../types';
import { Check } from 'lucide-react';

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
    description: string;
  }> = [
    {
      id: 'Germination',
      label: 'Germination',
      bengali: 'অঙ্কুরোদগম',
      description: 'বীজ থেকে অঙ্কুর নির্গমন',
    },
    {
      id: 'Seedling',
      label: 'Seedling',
      bengali: 'চারা অবস্থা',
      description: 'প্রাথমিক শিকড় ও পাতার বিকাশ',
    },
    {
      id: 'Vegetative',
      label: 'Vegetative',
      bengali: 'অঙ্গজ বৃদ্ধি',
      description: 'দ্রুত কাণ্ড ও পাতার বিস্তার',
    },
    {
      id: 'Reproductive',
      label: 'Reproductive',
      bengali: 'ফুল ও প্রজনন',
      description: 'ফুল ও দানার প্রাথমিক গঠন',
    },
    {
      id: 'Maturity',
      label: 'Maturity',
      bengali: 'পরিপক্বতা',
      description: 'ফসল পরিপক্ব ও কর্তনের উপযোগী',
    },
  ];

  const currentIdx = stages.findIndex((s) => s.id === currentStage);

  return (
    <div className={`rounded border border-border bg-surface p-4 sm:p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            বৃদ্ধির পর্যায় (Growth Stage)
          </h3>
          <p className="text-xs font-medium text-text-primary mt-0.5">
            বর্তমান পর্যায়: <span className="text-accent">{stages[currentIdx]?.bengali || currentStage}</span>
          </p>
        </div>
        <span className="text-[11px] text-text-secondary">
          ধাপ {currentIdx + 1} / {stages.length}
        </span>
      </div>

      {/* Stage Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {stages.map((stage, idx) => {
          const isPassed = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div
              key={stage.id}
              onClick={() => onSelectStage && onSelectStage(stage.id)}
              className={`rounded border p-3 flex flex-col justify-between transition-colors ${
                isCurrent
                  ? 'border-accent bg-surface-elevated shadow-accent-soft'
                  : isPassed
                  ? 'border-stage-passed bg-surface'
                  : 'border-stage-upcoming bg-surface opacity-70'
              } ${onSelectStage ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-text-secondary">
                  0{idx + 1}
                </span>
                {isPassed && (
                  <Check className="w-3.5 h-3.5 text-stage-passed" />
                )}
                {isCurrent && (
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                )}
              </div>

              <div>
                <h4 className={`text-xs font-semibold ${isCurrent ? 'text-accent' : isPassed ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {stage.label}
                </h4>
                <p className="text-[11px] font-bengali text-text-secondary mt-0.5">
                  {stage.bengali}
                </p>
              </div>

              <p className="text-[10px] text-text-secondary/80 mt-2 font-bengali line-clamp-2">
                {stage.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
