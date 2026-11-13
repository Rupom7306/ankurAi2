import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Layers, 
  Key, 
  Database, 
  FileSpreadsheet, 
  QrCode, 
  Camera, 
  Cpu, 
  Activity, 
  CloudSun, 
  ShieldAlert, 
  ListOrdered, 
  Rocket 
} from 'lucide-react';

export const RoadmapView: React.FC = () => {
  const phases = [
    {
      phase: 1,
      title: 'Project Initialization & Design Foundation',
      bengali: 'প্রজেক্ট সূচনা ও ডিজাইন পরিকাঠামো',
      status: 'completed',
      icon: Layers,
      summary: 'Vite + React + TypeScript + Tailwind dark charcoal & parrot-green glowing UI foundation.',
    },
    {
      phase: 2,
      title: 'Firebase Setup & Authentication',
      bengali: 'ফায়ারবেস ও ইউজার লগইন',
      status: 'completed',
      icon: Key,
      summary: 'Firebase Auth connected: Live registration, login, logout, and user session state.',
    },
    {
      phase: 3,
      title: 'Firestore Database & Crop Batch Registration',
      bengali: 'ফসল ব্যাচ নিবন্ধন ও ডাটাবেস',
      status: 'next',
      icon: Database,
      summary: '9 Firestore collections, batch registration form with crop type, date, sensor sets, location.',
    },
    {
      phase: 4,
      title: 'Excel Sensor Ingestion (10-Min Sync)',
      bengali: 'এক্সেল সেন্সর ডাটা প্রসেসিং',
      status: 'pending',
      icon: FileSpreadsheet,
      summary: 'Storage-based Excel ingestion, NPK & soil humidity metrics, duplicate prevention.',
    },
    {
      phase: 5,
      title: 'QR Code Generation & Camera Scanning',
      bengali: 'কিউআর কোড জেনারেশন ও স্ক্যানিং',
      status: 'pending',
      icon: QrCode,
      summary: 'Generate unique QR per batch, printable format, instant batch retrieval via scanner.',
    },
    {
      phase: 6,
      title: 'Plant Camera & High-Res Image Upload',
      bengali: 'উদ্ভিদের ছবি ধারণ ও আপলোড',
      status: 'pending',
      icon: Camera,
      summary: 'Direct camera capture or image selection, Firebase Storage upload with metadata.',
    },
    {
      phase: 7,
      title: 'Gemini Vision AI Diagnostic Engine',
      bengali: 'জেমিনাই ভিশন এআই রোগ নির্ণয়',
      status: 'pending',
      icon: Cpu,
      summary: 'Multi-modal diagnosis of leaf symptoms, pest detection, nutrient deficiencies & severity.',
    },
    {
      phase: 8,
      title: '5-Stage Growth Phenology & Health Scoring',
      bengali: 'বৃদ্ধির ধাপ ও স্বাস্থ্য স্কোর',
      status: 'pending',
      icon: Activity,
      summary: 'Transparent 0-100% scoring methodology, glowing 5-stage progress visualization.',
    },
    {
      phase: 9,
      title: 'Sensor Analytics & Open-Meteo Weather',
      bengali: 'সেন্সর গ্রাফ ও আবহাওয়া পূর্বাভাস',
      status: 'pending',
      icon: CloudSun,
      summary: 'Interactive Recharts for NPK trends, soil humidity, weather forecast and rain alerts.',
    },
    {
      phase: 10,
      title: 'AI Verdict (DO / DON’T / MONITOR)',
      bengali: 'এআই সিদ্ধান্ত ও পরামর্শ',
      status: 'pending',
      icon: ShieldAlert,
      summary: 'Actionable agro-advisory breakdown, next checkup scheduler, preventive measures.',
    },
    {
      phase: 11,
      title: 'Batch Priority Ranking & Analysis History',
      bengali: 'অগ্রাধিকার র ্যাংকিং ও পূর্ব ইতিহাস',
      status: 'pending',
      icon: ListOrdered,
      summary: 'Critical/High/Moderate/Low ranking, historical comparison between inspection runs.',
    },
    {
      phase: 12,
      title: 'End-to-End Testing & Production Deployment',
      bengali: 'পূর্ণাঙ্গ টেস্টিং ও ডিপ্লয়মেন্ট',
      status: 'pending',
      icon: Rocket,
      summary: 'Firebase App Hosting/Vercel deployment, security rules validation, and delivery.',
    },
  ];

  return (
    <div className="card-glass rounded-2xl p-6 sm:p-8 border border-dark-750">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">Project Roadmap & Execution Plan</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-parrot-500/20 text-parrot-400 font-semibold border border-parrot-500/30">
              12 Structured Phases
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Track implementation status step-by-step. Each phase is thoroughly tested before advancing.
          </p>
        </div>

        <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-dark-900 border border-dark-750 text-slate-300">
          Current: <strong className="text-parrot-400">Phase 2 Complete • Phase 3 Next</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {phases.map((item) => {
          const Icon = item.icon;
          const isDone = item.status === 'completed';
          const isNext = item.status === 'next';

          return (
            <div
              key={item.phase}
              className={`p-4 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                isDone
                  ? 'bg-parrot-950/20 border-parrot-500/40 shadow-glow-sm'
                  : isNext
                  ? 'bg-dark-850 border-parrot-400/50 shadow-[0_0_15px_rgba(22,224,92,0.15)] ring-1 ring-parrot-400/30'
                  : 'bg-dark-900/50 border-dark-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg ${
                      isDone
                        ? 'bg-parrot-500/20 text-parrot-400'
                        : isNext
                        ? 'bg-parrot-400/20 text-parrot-300'
                        : 'bg-dark-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
                      Phase {item.phase}
                    </span>
                    <h5 className="text-sm font-semibold text-white leading-tight">
                      {item.title}
                    </h5>
                  </div>
                </div>

                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-parrot-400 shrink-0" />
                ) : isNext ? (
                  <span className="flex h-2.5 w-2.5 relative shrink-0 mt-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-parrot-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-parrot-500"></span>
                  </span>
                ) : (
                  <Clock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                )}
              </div>

              <div className="text-xs font-bengali text-parrot-400/90 font-medium mb-1.5">
                {item.bengali}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {item.summary}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
