import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { ScanHero } from './components/ScanHero';
import { BatchSelector } from './components/BatchSelector';
import { CreateBatchModal } from './components/CreateBatchModal';
import { SensorDataUploader } from './components/SensorDataUploader';
import { ResultReport } from './components/ResultReport';
import { ProfilePage } from './pages/ProfilePage';
import { CropBatch } from './types';
import { ParsedSensorRow } from './lib/excelParser';
import { WeatherData, CropWeatherEvaluation, fetchWeatherByCoords, evaluateCropWeather, detectUserLocation } from './lib/weather';
import { PestDiagnosisResult, diagnoseCropImage } from './lib/geminiDiagnosis';
import { BatchAnalysisResult, runFullAnalysis } from './lib/scoring';
import { RefreshCw } from 'lucide-react';

export const MainContent: React.FC = () => {
  const { lang, t } = useLanguage();
  const [currentView, setCurrentView] = useState<'scan' | 'profile'>('scan');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);

  // Workflow states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<CropBatch | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Completed analysis state
  const [finalReport, setFinalReport] = useState<{
    analysis: BatchAnalysisResult;
    weather: WeatherData;
    weatherEval: CropWeatherEvaluation;
    pestVerdict: PestDiagnosisResult;
  } | null>(null);

  const handleImageSelected = (dataUrl: string) => {
    setSelectedImage(dataUrl);
    setSelectedBatch(null);
    setFinalReport(null);
  };

  const handleImageCleared = () => {
    setSelectedImage(null);
    setSelectedBatch(null);
    setFinalReport(null);
  };

  const handleBatchSelected = (batch: CropBatch) => {
    setSelectedBatch(batch);
  };

  // Triggered when Excel / CSV sensor data is uploaded
  const handleSensorDataParsed = async (data: {
    allRows: ParsedSensorRow[];
    batchRows: ParsedSensorRow[];
    detectedSections: string[];
  }) => {
    if (!selectedBatch || !selectedImage) return;

    setIsAnalyzing(true);

    try {
      // 1. Location & Weather (Dynamic GPS / IP location with Chattogram fallback)
      let weatherData: WeatherData;
      try {
        const detectedLoc = await detectUserLocation();
        weatherData = await fetchWeatherByCoords(
          detectedLoc.lat,
          detectedLoc.lon,
          detectedLoc.locationName
        );
      } catch (e) {
        console.warn('Weather fetch fallback:', e);
        weatherData = {
          locationName: {
            en: 'Chattogram Agriculture Region',
            bn: 'চট্টগ্রাম কৃষি অঞ্চল',
          },
          latitude: 22.3569,
          longitude: 91.7832,
          current: { temperature: 26.5, humidity: 72, precipitation: 0, weatherCode: 1, windSpeed: 7 },
          dailyForecast: [],
        };
      }

      const weatherEval = evaluateCropWeather(weatherData, selectedBatch.cropType);

      // 2. Pest & Disease Diagnosis via secure Gemini API endpoint (Phase 6.4)
      const pestVerdict = await diagnoseCropImage(selectedImage, selectedBatch.cropType);

      // 3. Scoring & Ranking engine (Phase 6.1, 6.2, 6.3)
      const analysisResult = runFullAnalysis(
        selectedBatch.sectionKey,
        selectedBatch.cropType,
        data.allRows,
        weatherEval.riskLabel,
        pestVerdict.severity
      );

      setFinalReport({
        analysis: analysisResult,
        weather: weatherData,
        weatherEval,
        pestVerdict,
      });
    } catch (err) {
      console.error('Analysis error:', err);
      alert(lang === 'bn' ? 'বিশ্লেষণ সম্পন্ন করতে সমস্যা হয়েছে।' : 'Failed to complete analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetToHome = () => {
    setSelectedImage(null);
    setSelectedBatch(null);
    setFinalReport(null);
    setCurrentView('scan');
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col font-sans selection:bg-accent/20 selection:text-accent">
      {/* Slim Header: logo in green-tinted square, "অঙ্কুর AI", language toggle, green outlined Login */}
      <Navbar
        onLoginClick={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setCurrentView('profile')}
      />

      {/* Auth Modal Triggered by Login button or protected action */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Create / Register Batch Modal */}
      <CreateBatchModal
        isOpen={isCreateBatchModalOpen}
        onClose={() => setIsCreateBatchModalOpen(false)}
        onBatchCreated={(batchId) => {
          console.log('Batch created:', batchId);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-8 pb-16 sm:pt-12 sm:pb-24 flex flex-col items-center justify-center">
        {currentView === 'profile' ? (
          <ProfilePage onBackToHome={() => setCurrentView('scan')} />
        ) : isAnalyzing ? (
          /* Analyzing Loader State */
          <div className="rounded-2xl border border-border-green bg-card p-10 sm:p-14 text-center max-w-md mx-auto space-y-4 shadow-card-soft animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-accent/15 border border-border-green text-accent flex items-center justify-center mx-auto shadow-glow">
              <RefreshCw className="w-8 h-8 animate-spin stroke-[2.2]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold font-bengali text-text-primary">
                {t('analysis_loading_title')}
              </h3>
              <p className="text-base text-text-secondary leading-relaxed">
                {t('analysis_loading_desc')}
              </p>
            </div>
          </div>
        ) : finalReport && selectedBatch && selectedImage ? (
          /* Phase 7: Comprehensive Scannable Result Page */
          <ResultReport
            batch={selectedBatch}
            cropImage={selectedImage}
            analysis={finalReport.analysis}
            weather={finalReport.weather}
            weatherEval={finalReport.weatherEval}
            pestVerdict={finalReport.pestVerdict}
            onResetToHome={handleResetToHome}
          />
        ) : !selectedImage ? (
          /* Step 1: Calm Scan Drop Area */
          <ScanHero onImageSelected={handleImageSelected} />
        ) : !selectedBatch ? (
          /* Step 2: Crop Photo Preview & Batch Selection */
          <BatchSelector
            selectedImage={selectedImage}
            onImageCleared={handleImageCleared}
            onBatchSelected={handleBatchSelected}
            onOpenCreateBatch={() => setIsCreateBatchModalOpen(true)}
            onRequireLogin={() => setIsAuthModalOpen(true)}
          />
        ) : (
          /* Step 3: Excel/CSV Sensor Data Upload */
          <SensorDataUploader
            selectedBatch={selectedBatch}
            onDataParsed={handleSensorDataParsed}
            onBack={() => setSelectedBatch(null)}
          />
        )}
      </main>

      {/* Tiny one-line copyright footer with green-tinted border */}
      <footer className="border-t border-border-header py-4 text-center text-sm text-text-secondary">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-center gap-2">
          <span>&copy; {new Date().getFullYear()}</span>
          <span className="font-bengali font-bold text-text-primary">{t('brand_name')}</span>
          <span className="text-accent font-extrabold">{t('brand_ai')}</span>
          <span className="text-border-green">&bull;</span>
          <span className="font-bengali text-text-secondary">{t('brand_tagline')}</span>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
