import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { ImageCaptureHero } from './components/ImageCaptureHero';
import { MetricsOverview } from './components/MetricsOverview';
import { GrowthStageVisualizer } from './components/GrowthStageVisualizer';
import { BatchCardPreview } from './components/BatchCardPreview';
import { RoadmapView } from './components/RoadmapView';
import { CropBatch, GrowthStage, SensorReading } from './types';
import { 
  Sprout, 
  Sparkles, 
  Database, 
  ArrowRight
} from 'lucide-react';

export const App: React.FC = () => {
  const [selectedGrowthStage, setSelectedGrowthStage] = useState<GrowthStage>('Vegetative');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'batches' | 'roadmap'>('dashboard');

  // User Authentication State
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sample Mock Batches showcasing the design and data model
  const mockBatches: CropBatch[] = [
    {
      id: 'batch-c47a98',
      userId: 'user-001',
      batchName: 'Paddy Block A (BRRI Dhan-28)',
      cropType: 'Boro Rice',
      variety: 'BRRI dhan28',
      plantingDate: '2026-10-15',
      farmLocation: {
        name: 'Mymensingh Ag Farm, Sector 3',
        latitude: 24.7471,
        longitude: 90.4203,
      },
      sensorSetId: 'SEN-SET-901',
      growthStage: selectedGrowthStage,
      healthScore: 92,
      condition: 'Excellent',
      priority: 'Low',
      activeIssuesCount: 0,
      createdAt: '2026-10-15T08:00:00Z',
      updatedAt: '2026-11-13T06:00:00Z',
    },
    {
      id: 'batch-f81b22',
      userId: 'user-001',
      batchName: 'Wheat Field South (BARI Gom-33)',
      cropType: 'Wheat',
      variety: 'BARI Gom-33 (Zinc enriched)',
      plantingDate: '2026-10-28',
      farmLocation: {
        name: 'Rajshahi Agro Research Plot 7',
        latitude: 24.3745,
        longitude: 88.6042,
      },
      sensorSetId: 'SEN-SET-404',
      growthStage: 'Seedling',
      healthScore: 68,
      condition: 'At Risk',
      priority: 'High',
      activeIssuesCount: 2,
      createdAt: '2026-10-28T09:30:00Z',
      updatedAt: '2026-11-13T05:45:00Z',
    },
    {
      id: 'batch-d12e55',
      userId: 'user-001',
      batchName: 'Mustard Plot Alpha (Tori-7)',
      cropType: 'Mustard',
      variety: 'Tori-7 Oilseed',
      plantingDate: '2026-11-01',
      farmLocation: {
        name: 'Bogura Northern Fields',
        latitude: 24.8465,
        longitude: 89.3777,
      },
      sensorSetId: 'SEN-SET-202',
      growthStage: 'Germination',
      healthScore: 84,
      condition: 'Healthy',
      priority: 'Moderate',
      activeIssuesCount: 0,
      createdAt: '2026-11-01T07:15:00Z',
      updatedAt: '2026-11-13T04:20:00Z',
    },
  ];

  // Sample Mock Live Telemetry (representing 10-minute sync data)
  const mockSensors: Record<string, SensorReading> = {
    'batch-c47a98': {
      id: 'read-001',
      sensorSetId: 'SEN-SET-901',
      timestamp: '2026-11-13T05:50:00Z',
      nitrogen: 145,
      phosphorus: 38,
      potassium: 195,
      soilHumidity: 68,
      soilTemperature: 24.8,
    },
    'batch-f81b22': {
      id: 'read-002',
      sensorSetId: 'SEN-SET-404',
      timestamp: '2026-11-13T05:50:00Z',
      nitrogen: 88, // low nitrogen warning
      phosphorus: 24,
      potassium: 140,
      soilHumidity: 42, // low humidity
      soilTemperature: 27.2,
    },
    'batch-d12e55': {
      id: 'read-003',
      sensorSetId: 'SEN-SET-202',
      timestamp: '2026-11-13T05:50:00Z',
      nitrogen: 130,
      phosphorus: 42,
      potassium: 180,
      soilHumidity: 62,
      soilTemperature: 23.5,
    },
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans selection:bg-parrot-500/20 selection:text-parrot-300">
      {/* Top Navbar with TOP-RIGHT LOGIN BUTTON */}
      <Navbar
        onOpenNewBatchModal={() => alert("Batch registration form will be activated in Phase 3 after Firebase setup.")}
        onOpenScanModal={() => alert("QR and Plant scanning camera will be activated in Phases 5 & 6.")}
        onLoginClick={() => setIsAuthModalOpen(true)}
        user={user}
        onLogout={() => setUser(null)}
      />

      {/* Auth Modal Triggered by Login button */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(userData) => setUser(userData)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Hero Section */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 card-glass-glow border border-parrot-500/30">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-parrot-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-parrot-500/10 border border-parrot-500/20 text-parrot-400 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Precision Agriculture Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              স্মার্ট কৃষি অভিভাবক <br />
              <span className="text-gradient-parrot font-bengali">অঙ্কুর AI 🌱</span>
              <span className="text-white text-2xl sm:text-4xl ml-2 font-normal">Crop Guardian</span>
            </h1>

            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Next-generation agricultural intelligence combining <strong>Gemini Vision AI</strong> with continuous 
              <strong> 10-minute IoT sensor telemetry</strong> (NPK & soil humidity), automated 5-stage growth phenology, 
              and precision agro-advisory.
            </p>

            {/* Quick Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-parrot-500 text-dark-950 shadow-glow-sm'
                    : 'bg-dark-850 hover:bg-dark-800 text-slate-300 border border-dark-700'
                }`}
              >
                📊 Dashboard View
              </button>

              <button
                onClick={() => setActiveTab('batches')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'batches'
                    ? 'bg-parrot-500 text-dark-950 shadow-glow-sm'
                    : 'bg-dark-850 hover:bg-dark-800 text-slate-300 border border-dark-700'
                }`}
              >
                🌾 Crop Batches ({mockBatches.length})
              </button>

              <button
                onClick={() => setActiveTab('roadmap')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === 'roadmap'
                    ? 'bg-parrot-500 text-dark-950 shadow-glow-sm'
                    : 'bg-dark-850 hover:bg-dark-800 text-slate-300 border border-dark-700'
                }`}
              >
                🗺️ 12-Phase Roadmap
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Views Based on Active Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* IN MIDDLE: NOTICEABLE BIG BUTTON (CAPTURE CROP IMAGE OR UPLOAD IMAGE) */}
            <ImageCaptureHero />

            {/* KPI Metrics Overview */}
            <MetricsOverview
              totalBatches={mockBatches.length}
              healthyBatches={mockBatches.filter((b) => b.condition === 'Excellent' || b.condition === 'Healthy').length}
              atRiskBatches={mockBatches.filter((b) => b.condition === 'At Risk').length}
              criticalBatches={mockBatches.filter((b) => b.condition === 'Critical').length}
            />

            {/* Growth Stage Visualizer Demo & Interactive Selector (FIXED LINE OVER BOXES) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-parrot-400" />
                  Interactive 5-Stage Phenology Simulation
                </span>
                
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-400 mr-1 hidden sm:inline">Simulate Stage:</span>
                  {(['Germination', 'Seedling', 'Vegetative', 'Reproductive', 'Maturity'] as GrowthStage[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedGrowthStage(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        selectedGrowthStage === st
                          ? 'bg-parrot-500/20 text-parrot-300 border border-parrot-500/40 font-bold'
                          : 'bg-dark-900 text-slate-400 hover:text-slate-200 border border-dark-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <GrowthStageVisualizer 
                currentStage={selectedGrowthStage} 
                onSelectStage={(stage) => setSelectedGrowthStage(stage)}
              />
            </div>

            {/* Active Crop Batches Preview Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Monitored Crop Batches</h3>
                  <p className="text-xs text-slate-400">
                    Ranked by health condition, IoT telemetry and attention priority
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('batches')}
                  className="flex items-center gap-1 text-xs font-semibold text-parrot-400 hover:text-parrot-300 transition-colors"
                >
                  <span>View All Batches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mockBatches.slice(0, 2).map((batch) => (
                  <BatchCardPreview
                    key={batch.id}
                    batch={batch}
                    sensorData={mockSensors[batch.id]}
                    onSelectBatch={(id) => alert(`Batch ${id} detailed analytics modal will open.`)}
                    onScanClick={(b) => alert(`Batch ${b.batchName} QR details.`)}
                  />
                ))}
              </div>
            </div>

            {/* Architecture Card */}
            <div className="card-glass rounded-2xl p-6 sm:p-8 border border-dark-750">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-parrot-400" />
                <h3 className="text-lg font-bold text-white">System Architecture & Database Collections</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-parrot-500/10 text-parrot-400 border border-parrot-500/20 font-semibold">
                  Zero-Bloat Foundation
                </span>
              </div>

              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                As a beginner in programming, here is how your system works in simple words:
                The <strong>Frontend (React + Vite)</strong> is the user interface you see and click on. 
                The <strong>Backend (Firebase)</strong> securely stores user logins, crop records, and telemetry files.
                The <strong>AI Engine (Google Gemini Vision)</strong> analyzes plant photos to spot pests or diseases before they spread.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { name: 'users', desc: 'Farmer accounts & profiles', count: 'Auth + Doc' },
                  { name: 'cropBatches', desc: 'Registered crop plots', count: 'Core Collection' },
                  { name: 'sensorSets', desc: 'IoT hardware sets', count: 'Hardware Registry' },
                  { name: 'sensorReadings', desc: 'NPK & humidity 10-min logs', count: 'Time Series' },
                  { name: 'cropImages', desc: 'High-res plant photos', count: 'Storage Linked' },
                  { name: 'cropAnalyses', desc: 'Gemini AI diagnosis records', count: 'Multi-Modal' },
                  { name: 'recommendations', desc: 'Agro verdict (DO/DON’T)', count: 'Actionable' },
                  { name: 'weatherRecords', desc: 'Open-Meteo forecasts', count: 'Weather Sync' },
                  { name: 'cropReferenceData', desc: 'Optimal NPK benchmarks', count: 'Reference Matrix' },
                  { name: 'Cloud Functions', desc: 'Backend Excel ingestion', count: 'Serverless Worker' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-dark-900 border border-dark-800 text-left">
                    <div className="text-xs font-mono font-bold text-parrot-400 truncate">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                      {item.desc}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 font-mono">
                      {item.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'batches' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-white">All Monitored Crop Batches</h2>
                <p className="text-sm text-slate-400">
                  Comprehensive listing sorted by urgency and health metrics
                </p>
              </div>

              <button
                onClick={() => alert("Batch registration modal will be enabled in Phase 3.")}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-parrot-500 hover:bg-parrot-400 text-dark-950 shadow-glow-sm transition-all"
              >
                + Register New Batch
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockBatches.map((batch) => (
                <BatchCardPreview
                  key={batch.id}
                  batch={batch}
                  sensorData={mockSensors[batch.id]}
                  onSelectBatch={(id) => alert(`Batch ${id} selected.`)}
                  onScanClick={(b) => alert(`QR code for ${b.batchName}`)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'roadmap' && (
          <RoadmapView />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800 bg-dark-950/90 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bengali text-parrot-400 font-bold">অঙ্কুর AI 🌱</span>
            <span>— Precision AI Crop Guardian & Agricultural Telemetry Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-dark-900 border border-dark-800 text-slate-300">React 18</span>
            <span className="px-2 py-0.5 rounded bg-dark-900 border border-dark-800 text-slate-300">Vite</span>
            <span className="px-2 py-0.5 rounded bg-dark-900 border border-dark-800 text-slate-300">TypeScript</span>
            <span className="px-2 py-0.5 rounded bg-dark-900 border border-dark-800 text-parrot-400">Tailwind CSS</span>
            <span className="px-2 py-0.5 rounded bg-dark-900 border border-dark-800 text-cyan-400">Firebase</span>
            <span className="px-2 py-0.5 rounded bg-dark-900 border border-dark-800 text-emerald-400">Gemini Vision</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
