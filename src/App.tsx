import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { ImageCaptureHero } from './components/ImageCaptureHero';
import { MetricsOverview } from './components/MetricsOverview';
import { GrowthStageVisualizer } from './components/GrowthStageVisualizer';
import { BatchCardPreview } from './components/BatchCardPreview';
import { RoadmapView } from './components/RoadmapView';
import { CropBatch, GrowthStage, SensorReading } from './types';
import { Sprout, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const [selectedGrowthStage, setSelectedGrowthStage] = useState<GrowthStage>('Vegetative');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'batches' | 'roadmap'>('dashboard');

  // User Authentication State
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sample Mock Batches
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
      variety: 'BARI Gom-33',
      plantingDate: '2026-10-28',
      farmLocation: {
        name: 'Rajshahi Plot 7',
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
        name: 'Bogura Fields',
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

  // Live Telemetry snapshot
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
      nitrogen: 88,
      phosphorus: 24,
      potassium: 140,
      soilHumidity: 42,
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
      {/* Top Navbar with Minimalist Branding & Top-Right Login Button */}
      <Navbar
        onOpenNewBatchModal={() => alert("Batch registration will be enabled in Phase 3.")}
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Sleek Tab Navigation */}
        <div className="flex items-center justify-between border-b border-dark-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-parrot-500 text-dark-950 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-dark-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('batches')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'batches'
                  ? 'bg-parrot-500 text-dark-950 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-dark-900'
              }`}
            >
              Batches ({mockBatches.length})
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'roadmap'
                  ? 'bg-parrot-500 text-dark-950 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-dark-900'
              }`}
            >
              Roadmap
            </button>
          </div>
        </div>

        {/* Tab 1: Minimalist Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* DIRECT BUTTONS FOR PIC (In Middle, Ultra Minimalistic) */}
            <ImageCaptureHero />

            {/* Clean Metrics Overview */}
            <MetricsOverview
              totalBatches={mockBatches.length}
              healthyBatches={mockBatches.filter((b) => b.condition === 'Excellent' || b.condition === 'Healthy').length}
              atRiskBatches={mockBatches.filter((b) => b.condition === 'At Risk').length}
              criticalBatches={mockBatches.filter((b) => b.condition === 'Critical').length}
            />

            {/* Growth Stage Visualizer (Glitch-free clean 5 level boxes) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold flex items-center gap-1.5 text-slate-300">
                  <Sprout className="w-3.5 h-3.5 text-parrot-400" />
                  Growth Stage
                </span>
                <div className="flex items-center gap-1">
                  {(['Germination', 'Seedling', 'Vegetative', 'Reproductive', 'Maturity'] as GrowthStage[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => setSelectedGrowthStage(st)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                        selectedGrowthStage === st
                          ? 'bg-parrot-500 text-dark-950 font-bold'
                          : 'bg-dark-900 text-slate-400 hover:text-white'
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

            {/* Monitored Crop Batches */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Crop Batches</h3>
                <button
                  onClick={() => setActiveTab('batches')}
                  className="flex items-center gap-1 text-xs font-semibold text-parrot-400 hover:text-parrot-300"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {mockBatches.slice(0, 2).map((batch) => (
                  <BatchCardPreview
                    key={batch.id}
                    batch={batch}
                    sensorData={mockSensors[batch.id]}
                    onSelectBatch={(id) => alert(`Batch ${id} selected.`)}
                    onScanClick={(b) => alert(`QR for ${b.batchName}`)}
                  />
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Crop Batches View */}
        {activeTab === 'batches' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Monitored Crop Batches</h2>
              <button
                onClick={() => alert("Batch registration modal will be enabled in Phase 3.")}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-parrot-500 hover:bg-parrot-400 text-dark-950 transition-all"
              >
                + New Batch
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {mockBatches.map((batch) => (
                <BatchCardPreview
                  key={batch.id}
                  batch={batch}
                  sensorData={mockSensors[batch.id]}
                  onSelectBatch={(id) => alert(`Batch ${id} selected.`)}
                  onScanClick={(b) => alert(`QR for ${b.batchName}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Roadmap View */}
        {activeTab === 'roadmap' && (
          <RoadmapView />
        )}

      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-dark-900 bg-dark-950 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="font-bengali text-parrot-400 font-bold">অঙ্কুর</span>
            <span className="text-parrot-400 font-bold">AI</span> 🌱
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Phase 1 Foundation • Ready for Phase 2
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
