import React from 'react';
import { Layers, CheckCircle2, AlertTriangle, AlertOctagon, TrendingUp } from 'lucide-react';

interface MetricsProps {
  totalBatches: number;
  healthyBatches: number;
  atRiskBatches: number;
  criticalBatches: number;
}

export const MetricsOverview: React.FC<MetricsProps> = ({
  totalBatches,
  healthyBatches,
  atRiskBatches,
  criticalBatches,
}) => {
  const cards = [
    {
      title: 'Total Crop Batches',
      bengaliTitle: 'মোট ফসল ব্যাচ',
      count: totalBatches,
      subtext: 'Active monitoring active',
      icon: Layers,
      color: 'parrot',
      accentBorder: 'border-dark-700 hover:border-parrot-500/50',
      badgeBg: 'bg-parrot-500/10 text-parrot-400 border border-parrot-500/20',
      glow: 'hover:shadow-glow-sm',
    },
    {
      title: 'Healthy Batches',
      bengaliTitle: 'সুস্থ ও স্বাভাবিক',
      count: healthyBatches,
      subtext: 'Score ≥ 80% • Vigorous growth',
      icon: CheckCircle2,
      color: 'emerald',
      accentBorder: 'border-dark-700 hover:border-emerald-500/50',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]',
    },
    {
      title: 'At-Risk Batches',
      bengaliTitle: 'ঝুঁকিপূর্ণ ব্যাচ',
      count: atRiskBatches,
      subtext: 'Score 50-79% • Needs attention',
      icon: AlertTriangle,
      color: 'amber',
      accentBorder: 'border-dark-700 hover:border-amber-500/50',
      badgeBg: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      glow: 'hover:shadow-glow-warning',
    },
    {
      title: 'Critical Batches',
      bengaliTitle: 'জরুরি সতর্কতা',
      count: criticalBatches,
      subtext: 'Score < 50% • Immediate action',
      icon: AlertOctagon,
      color: 'crimson',
      accentBorder: 'border-dark-700 hover:border-rose-500/50',
      badgeBg: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      glow: 'hover:shadow-glow-danger',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((item, idx) => {
        const IconComponent = item.icon;
        return (
          <div
            key={idx}
            className={`card-glass relative rounded-2xl p-5 sm:p-6 transition-all duration-300 ${item.accentBorder} ${item.glow} group overflow-hidden`}
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {item.title}
              </span>
              <div className={`p-2.5 rounded-xl ${item.badgeBg}`}>
                <IconComponent className="w-5 h-5" />
              </div>
            </div>

            {/* Numeric Stat */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {item.count}
              </span>
              <span className="text-xs font-medium font-bengali text-slate-400">
                ({item.bengaliTitle})
              </span>
            </div>

            {/* Subtext */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-parrot-400/80" />
              <span>{item.subtext}</span>
            </div>

            {/* Subtle corner glow accent */}
            <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-parrot-500/5 rounded-full blur-xl group-hover:bg-parrot-500/15 transition-all"></div>
          </div>
        );
      })}
    </div>
  );
};
