import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Cell,
  Legend,
  LabelList
} from 'recharts';
import { 
  CloudSun, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingDown, 
  ArrowLeft, 
  Bookmark, 
  Check, 
  RefreshCw, 
  Award,
  Calendar,
  Activity,
  AlertTriangle,
  Camera,
  Info
} from 'lucide-react';
import { CropBatch } from '../types';
import { BatchAnalysisResult } from '../lib/scoring';
import { WeatherData, CropWeatherEvaluation } from '../lib/weather';
import { PestDiagnosisResult } from '../lib/geminiDiagnosis';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { saveBatchAnalysis } from '../services/cropBatchService';
import { TranslationKey } from '../i18n';

interface ResultReportProps {
  batch: CropBatch;
  cropImage: string;
  analysis: BatchAnalysisResult;
  weather: WeatherData;
  weatherEval: CropWeatherEvaluation;
  pestVerdict: PestDiagnosisResult;
  onResetToHome: () => void;
  onChangeImage?: () => void;
}

const getCropTranslationKey = (crop: string): TranslationKey => {
  const norm = (crop || '').toLowerCase();
  if (norm.includes('boro')) return 'crop_boro_rice';
  if (norm.includes('aman')) return 'crop_aman_rice';
  if (norm.includes('aus')) return 'crop_aus_rice';
  if (norm.includes('wheat') || norm.includes('gom')) return 'crop_wheat';
  if (norm.includes('maize') || norm.includes('corn')) return 'crop_maize';
  if (norm.includes('potato') || norm.includes('alu')) return 'crop_potato';
  if (norm.includes('tomato')) return 'crop_tomato';
  if (norm.includes('jute') || norm.includes('pat')) return 'crop_jute';
  if (norm.includes('mustard') || norm.includes('sorisha')) return 'crop_mustard';
  if (norm.includes('lentil') || norm.includes('dal')) return 'crop_lentil';
  if (norm.includes('chili') || norm.includes('morich')) return 'crop_chili';
  if (norm.includes('onion') || norm.includes('peyaj')) return 'crop_onion';
  return 'crop_default';
};

export const ResultReport: React.FC<ResultReportProps> = ({
  batch,
  cropImage,
  analysis,
  weather,
  weatherEval,
  pestVerdict,
  onResetToHome,
  onChangeImage,
}) => {
  const { t, lang, formatNumber } = useLanguage();
  const { currentUser } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<'npk' | 'humidity'>('npk');

  const handleSaveAnalysis = async () => {
    if (!currentUser) {
      alert(t('login_prompt_title'));
      return;
    }
    setIsSaving(true);
    try {
      await saveBatchAnalysis(currentUser.uid, batch.id, {
        batchId: batch.id,
        batchName: batch.name,
        sectionKey: batch.sectionKey,
        healthLevel: analysis.level,
        healthScore: analysis.scoreBreakdown.totalScore,
        pestVerdict: {
          isCropOrPlant: pestVerdict.isCropOrPlant,
          detected: pestVerdict.pestDetected,
          disease: pestVerdict.pestOrDisease.en,
          confidence: pestVerdict.diagnosisConfidence,
          severity: pestVerdict.severity,
        },
        location: typeof weather.locationName === 'object' ? weather.locationName[lang] || weather.locationName.en : weather.locationName,
        temperature: weather.current.temperature,
      });
      setSaveSuccess(true);
    } catch (err) {
      console.error('Failed to save analysis:', err);
      alert(t('auth_submitting'));
    } finally {
      setIsSaving(false);
    }
  };

  // Prepare consumption rate bar data with localized names
  const consumptionBarData = [
    {
      mineral: t('chart_nitrogen'),
      rate: analysis.consumptionRates.nWeeklyChange,
      color: analysis.consumptionRates.nWeeklyChange < -5 ? '#EF4444' : '#38BDF8',
      displayRate: `${formatNumber(analysis.consumptionRates.nWeeklyChange)} ${t('unit_mg_kg')}`,
    },
    {
      mineral: t('chart_phosphorus'),
      rate: analysis.consumptionRates.pWeeklyChange,
      color: analysis.consumptionRates.pWeeklyChange < -3 ? '#EF4444' : '#F59E0B',
      displayRate: `${formatNumber(analysis.consumptionRates.pWeeklyChange)} ${t('unit_mg_kg')}`,
    },
    {
      mineral: t('chart_potassium'),
      rate: analysis.consumptionRates.kWeeklyChange,
      color: analysis.consumptionRates.kWeeklyChange < -5 ? '#EF4444' : '#A855F7',
      displayRate: `${formatNumber(analysis.consumptionRates.kWeeklyChange)} ${t('unit_mg_kg')}`,
    },
  ];

  const penaltyScore = analysis.scoreBreakdown.weatherPenalty + analysis.scoreBreakdown.pestPenalty;
  const cropKey = getCropTranslationKey(batch.cropType);

  // Status pill styling helper with WCAG AA compliance (18% bg + bright readable text)
  const getStatusPillClasses = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-red-500/20 text-[#FCA5A5] border border-red-500/40 font-bold';
      case 'Poor':
        return 'bg-amber-500/20 text-[#FCD34D] border border-amber-500/40 font-bold';
      case 'Fair':
        return 'bg-yellow-500/20 text-[#FDE047] border border-yellow-500/40 font-bold';
      case 'Good':
      case 'Excellent':
      default:
        return 'bg-emerald-500/20 text-[#86EFAC] border border-emerald-500/40 font-bold';
    }
  };

  const getTriggerSourceBadgeText = (trigger: string) => {
    switch (trigger) {
      case 'soil_depletion':
        return t('vitality_trigger_soil');
      case 'foliar_disease':
        return t('vitality_trigger_foliar');
      case 'both':
        return t('vitality_trigger_both');
      case 'sensor_only':
        return t('vitality_trigger_sensor_only');
      case 'insufficient_data':
        return t('vitality_trigger_insufficient');
      default:
        return t('vitality_trigger_balanced');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-7 animate-fadeIn pb-24">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-border-header">
        <button
          onClick={onResetToHome}
          className="interactive btn-secondary h-11 sm:h-12 px-4 sm:px-5 text-sm sm:text-base font-semibold"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{t('result_btn_new_scan')}</span>
        </button>

        <button
          onClick={handleSaveAnalysis}
          disabled={isSaving || saveSuccess}
          className={`interactive h-11 sm:h-12 px-5 sm:px-6 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center gap-2 cursor-pointer ${
            saveSuccess
              ? 'bg-accent/20 border border-accent text-accent'
              : 'btn-primary'
          }`}
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              <span>{t('result_saving')}</span>
            </>
          ) : saveSuccess ? (
            <>
              <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
              <span>{t('result_saved')}</span>
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{t('result_btn_save')}</span>
            </>
          )}
        </button>
      </div>

      {/* NON-AGRICULTURAL IMAGE WARNING BANNER (Shows only if uploaded image is not a plant) */}
      {!pestVerdict.isCropOrPlant && (
        <div className="rounded-2xl border-2 border-alert-warning/50 bg-alert-warning/10 p-5 sm:p-6 shadow-card-soft animate-fadeIn flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-alert-warning/20 text-alert-warning flex items-center justify-center shrink-0 border border-alert-warning/40">
              <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-text-primary">
                  {t('non_crop_alert_title')}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-alert-warning/20 text-alert-warning border border-alert-warning/35">
                  {pestVerdict.detectedSubject}
                </span>
              </div>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                {pestVerdict.rejectionReason?.[lang] ||
                  pestVerdict.rejectionReason?.en ||
                  t('non_crop_alert_desc', { subject: pestVerdict.detectedSubject })}
              </p>
            </div>
          </div>

          {onChangeImage && (
            <button
              onClick={onChangeImage}
              className="btn-primary h-11 px-5 text-sm shrink-0 whitespace-nowrap self-end sm:self-auto"
            >
              <Camera className="w-4 h-4" />
              <span>{t('btn_reupload_crop_image')}</span>
            </button>
          )}
        </div>
      )}

      {/* 1. Header: Batch Meta & Location / Weather Snapshot */}
      <div className="rounded-2xl border border-border-green bg-card p-5 sm:p-7 shadow-card-soft flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="font-mono text-xs sm:text-sm px-2.5 py-1 rounded-md bg-bg text-accent border border-border-green font-bold">
              {batch.sectionKey}
            </span>
            <span className="text-xs sm:text-sm text-text-secondary flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-accent" />
              <span>{t('result_planted_on')} {batch.plantingDate}</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-bengali text-text-primary">
            {batch.name}
          </h2>
          <p className="text-sm sm:text-base text-accent font-semibold mt-0.5">
            {t(cropKey)} {batch.variety ? `• ${batch.variety}` : ''}
          </p>
        </div>

        {/* Weather capsule */}
        <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl bg-card-elevated border border-border-green self-start md:self-auto">
          <CloudSun className="w-8 h-8 text-accent shrink-0" />
          <div className="text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <strong className="text-text-primary font-semibold">
                {typeof weather.locationName === 'object'
                  ? weather.locationName[lang] || weather.locationName.en
                  : weather.locationName}
              </strong>
              <span className="text-accent font-bold font-mono text-sm sm:text-base">
                {formatNumber(weather.current.temperature)}°C
              </span>
            </div>
            <div className="text-text-secondary flex gap-3 mt-0.5">
              <span>{t('weather_humidity')}: {formatNumber(weather.current.humidity)}%</span>
              <span>{t('weather_precipitation')}: {formatNumber(weather.current.precipitation)}mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Overall Crop Vitality Index (Clearly Distinguishes Soil Telemetry vs Leaf Visuals) */}
      <div className="rounded-2xl border border-border-green bg-card p-6 sm:p-8 shadow-card-soft space-y-5">
        <div>
          {/* Card Top Row: Vitality Header & Score */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-green">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-text-secondary">
                  {t('vitality_title')}
                </span>
                {/* Clear source trigger badge so user knows WHY it is Critical or Healthy */}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/15 text-accent border border-accent/30">
                  {getTriggerSourceBadgeText(analysis.triggerSource)}
                </span>
              </div>

              <div className="flex items-baseline gap-3 flex-wrap">
                <h3 
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight"
                  style={{ color: analysis.levelColor }}
                >
                  {analysis.hasSufficientSensorData ? t(analysis.levelKey) : t('status_insufficient_sensor')}
                </h3>
                <span className="text-base sm:text-lg font-mono text-text-secondary">
                  {analysis.scoreBreakdown.totalScore !== null
                    ? `(${t('score_out_of_100', { score: analysis.scoreBreakdown.totalScore })})`
                    : `(${t('unit_na')})`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className={`px-4 py-2 rounded-xl text-sm ${getStatusPillClasses(analysis.level)}`}>
                {analysis.hasSufficientSensorData ? t(analysis.levelKey) : t('status_insufficient_sensor')}
              </span>
            </div>
          </div>

          {/* SYNTHESIZED EXPLAINER: Resolves contradiction between soil sensors and clean leaf */}
          <div className="mt-4 p-4 rounded-xl bg-card-elevated border border-border-green space-y-2">
            <div className="flex items-start gap-2.5">
              <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-text-primary leading-relaxed font-normal">
                {t(analysis.synthesisKey)}
              </p>
            </div>

            {/* Specific primary soil telemetry driver */}
            {analysis.hasSufficientSensorData && (
              <div className="pt-2 border-t border-border-green/50 text-xs sm:text-sm text-text-secondary flex items-center gap-2">
                <span className="font-semibold text-accent">{t('result_health_title')}:</span>
                <span className="text-text-primary font-medium">{t(analysis.problemKey)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Transparent Score Breakdown (Only if sufficient data exists) */}
        {analysis.hasSufficientSensorData ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border-green">
            <div className="p-3.5 sm:p-4 rounded-xl bg-card-elevated border border-border-green">
              <span className="text-xs sm:text-sm text-text-secondary block mb-1">{t('score_npk')}</span>
              <strong className="text-text-primary font-mono text-base sm:text-lg">
                {formatNumber(analysis.scoreBreakdown.npkScore)} / {formatNumber(40)}
              </strong>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-card-elevated border border-border-green">
              <span className="text-xs sm:text-sm text-text-secondary block mb-1">{t('score_humidity')}</span>
              <strong className="text-text-primary font-mono text-base sm:text-lg">
                {formatNumber(analysis.scoreBreakdown.humidityScore)} / {formatNumber(20)}
              </strong>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-card-elevated border border-border-green">
              <span className="text-xs sm:text-sm text-text-secondary block mb-1">{t('score_trend')}</span>
              <strong className="text-text-primary font-mono text-base sm:text-lg">
                {formatNumber(analysis.scoreBreakdown.trendScore)} / {formatNumber(25)}
              </strong>
            </div>
            <div className="p-3.5 sm:p-4 rounded-xl bg-card-elevated border border-border-green">
              <span className="text-xs sm:text-sm text-text-secondary block mb-1">{t('score_penalty')}</span>
              <strong className="text-alert-warning font-mono text-base sm:text-lg">
                {penaltyScore > 0 
                  ? `-${formatNumber(penaltyScore)} ${t('unit_pts')}`
                  : `0 ${t('unit_pts')}`}
              </strong>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-card-elevated border border-alert-warning/30 text-alert-warning text-sm">
            {t('problem_insufficient_data')}
          </div>
        )}
      </div>

      {/* 3. Pest & Disease Diagnosis with Subject Validation */}
      <div className="rounded-2xl border border-border-green bg-card p-6 sm:p-8 shadow-card-soft space-y-5">
        <div className="pb-4 border-b border-border-green flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary font-bengali">
                {t('pest_section_title')}
              </h3>
            </div>
            <p className="text-sm sm:text-base text-text-secondary mt-1">
              {t('pest_section_explainer')}
            </p>
          </div>

          {/* Quick change photo action */}
          {onChangeImage && (
            <button
              onClick={onChangeImage}
              className="interactive text-xs sm:text-sm text-accent hover:text-accent-hover font-semibold underline flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{t('btn_change_photo')}</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
          {/* Uploaded Crop Image Thumbnail */}
          <div className="relative w-full sm:w-56 aspect-[4/3] rounded-2xl overflow-hidden border border-border-green bg-black shrink-0">
            <img
              src={cropImage}
              alt="Analyzed subject"
              className="w-full h-full object-cover"
            />
            {!pestVerdict.isCropOrPlant && (
              <div className="absolute inset-0 bg-black/75 flex items-center justify-center p-3 text-center">
                <span className="text-xs font-bold text-alert-warning px-2.5 py-1 rounded bg-black/80 border border-alert-warning/40">
                  {t('non_crop_badge')}
                </span>
              </div>
            )}
          </div>

          {/* Verdict details */}
          <div className="flex-1 space-y-4 w-full">
            {/* If Non-Agricultural Subject Detected */}
            {!pestVerdict.isCropOrPlant ? (
              <div className="p-4 rounded-xl border border-alert-warning/40 bg-alert-warning/10 space-y-2">
                <div className="flex items-center gap-2 text-alert-warning font-bold text-sm sm:text-base">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{pestVerdict.detectedSubject} ({t('pest_status_non_crop')})</span>
                </div>
                <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                  {pestVerdict.rejectionReason?.[lang] || pestVerdict.rejectionReason?.en || t('non_crop_alert_desc', { subject: pestVerdict.detectedSubject })}
                </p>
                <div className="pt-1 text-xs text-text-secondary flex gap-4">
                  <span>{t('pest_confidence')}: <strong className="font-mono text-text-primary">{t('unit_na')}</strong></span>
                  <span>{t('pest_severity')}: <strong className="text-text-primary">{t('unit_na')}</strong></span>
                </div>
              </div>
            ) : (
              /* Verified Plant Image Case */
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  {pestVerdict.pestDetected ? (
                    <div className="w-10 h-10 rounded-full bg-alert-warning/20 text-alert-warning flex items-center justify-center shrink-0 border border-alert-warning/35 mt-0.5">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 border border-accent/35 mt-0.5">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg sm:text-xl font-bold text-text-primary">
                        {pestVerdict.pestOrDisease[lang] || pestVerdict.pestOrDisease.en}
                      </h4>
                      {pestVerdict.isHypothesisOnly && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {t('ai_hypothesis_badge')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs sm:text-sm text-text-secondary mt-1 flex-wrap">
                      <span>
                        {t('ai_confidence_label')}:{' '}
                        <strong className="font-mono text-accent">
                          {pestVerdict.diagnosisConfidence !== null
                            ? `${formatNumber(pestVerdict.diagnosisConfidence)}%`
                            : t('uncertainty_badge')}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        {t('pest_severity')}:{' '}
                        <strong className="text-text-primary capitalize">
                          {t(`pest_severity_${pestVerdict.severity}` as TranslationKey)}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Direct Visual Observations */}
                {pestVerdict.visualObservations && (
                  <div className="p-3.5 rounded-xl bg-card-elevated border border-border-green text-xs sm:text-sm space-y-1.5">
                    <span className="font-semibold text-accent block">
                      {t('visual_observations_title')}:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-text-primary leading-relaxed">
                      {(pestVerdict.visualObservations[lang] || pestVerdict.visualObservations.en).map((obs: string, i: number) => (
                        <li key={i}>{obs}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actionable recommendation */}
                <div className="p-4 rounded-xl bg-card-elevated border border-border-green text-sm sm:text-base space-y-1">
                  <span className="text-xs sm:text-sm text-accent font-bold block">
                    {t('pest_recommendation_label')}:
                  </span>
                  <p className="text-text-primary leading-relaxed font-normal">
                    {pestVerdict.recommendation[lang] || pestVerdict.recommendation.en}
                  </p>
                </div>

                <p className="text-xs text-text-secondary italic">
                  * {t('pest_disclaimer')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Mineral Graphs & Weekly Consumption Rate */}
      <div className="rounded-2xl border border-border-green bg-card p-6 sm:p-8 shadow-card-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-green">
          <div>
            <div className="flex items-center gap-2.5">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary font-bengali">
                {t('trends_section_title')}
              </h3>
            </div>
            <p className="text-sm sm:text-base text-text-secondary mt-1">
              {t('trends_section_explainer')}
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex rounded-xl border border-border-green bg-card p-1 self-start sm:self-auto">
            <button
              onClick={() => setActiveChartTab('npk')}
              className={`interactive px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeChartTab === 'npk'
                  ? 'bg-accent text-text-on-accent font-bold shadow-glow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t('chart_toggle_npk')}
            </button>
            <button
              onClick={() => setActiveChartTab('humidity')}
              className={`interactive px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                activeChartTab === 'humidity'
                  ? 'bg-accent text-text-on-accent font-bold shadow-glow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t('chart_toggle_humidity')}
            </button>
          </div>
        </div>

        {/* Line Chart with 3px lines, larger hover dots, dark tooltips, legends */}
        <div className="w-full h-72 pt-3">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartTab === 'npk' ? (
              <LineChart data={analysis.timelineData}>
                <CartesianGrid stroke="rgba(74, 222, 128, 0.12)" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#B4C6BC" fontSize={13} tickLine={false} />
                <YAxis stroke="#B4C6BC" fontSize={13} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111C17', 
                    borderColor: 'rgba(74, 222, 128, 0.25)', 
                    borderRadius: '12px', 
                    fontSize: '14px',
                    color: '#F1F6F3',
                    padding: '10px 14px'
                  }} 
                />
                <Legend 
                  wrapperStyle={{ fontSize: '13px', color: '#B4C6BC', paddingTop: '10px' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="nitrogen" 
                  name={t('chart_nitrogen')} 
                  stroke="#38BDF8" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, stroke: '#111C17', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="phosphorus" 
                  name={t('chart_phosphorus')} 
                  stroke="#F59E0B" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, stroke: '#111C17', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="potassium" 
                  name={t('chart_potassium')} 
                  stroke="#A855F7" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, stroke: '#111C17', strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <LineChart data={analysis.timelineData}>
                <CartesianGrid stroke="rgba(74, 222, 128, 0.12)" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#B4C6BC" fontSize={13} tickLine={false} />
                <YAxis stroke="#B4C6BC" fontSize={13} tickLine={false} domain={[40, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111C17', 
                    borderColor: 'rgba(74, 222, 128, 0.25)', 
                    borderRadius: '12px', 
                    fontSize: '14px',
                    color: '#F1F6F3',
                    padding: '10px 14px'
                  }} 
                />
                <Legend 
                  wrapperStyle={{ fontSize: '13px', color: '#B4C6BC', paddingTop: '10px' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  name={t('chart_humidity')} 
                  stroke="#4ADE80" 
                  strokeWidth={3} 
                  dot={false}
                  activeDot={{ r: 6, stroke: '#111C17', strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Weekly Consumption Rate with Value Labels and Explainer */}
        <div className="pt-5 border-t border-border-green space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-base font-bold text-text-primary flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-accent" />
              <span>{t('consumption_section_title')}</span>
            </span>
            <span className="text-xs sm:text-sm text-text-secondary">
              {t('consumption_section_explainer')}
            </span>
          </div>

          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionBarData} layout="vertical" margin={{ left: 20, right: 60, top: 10, bottom: 10 }}>
                <CartesianGrid stroke="rgba(74, 222, 128, 0.12)" horizontal={false} />
                <XAxis type="number" stroke="#B4C6BC" fontSize={12} />
                <YAxis dataKey="mineral" type="category" stroke="#B4C6BC" fontSize={13} tickLine={false} width={130} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111C17', 
                    borderColor: 'rgba(74, 222, 128, 0.25)', 
                    borderRadius: '12px', 
                    fontSize: '14px',
                    color: '#F1F6F3'
                  }} 
                />
                <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                  {consumptionBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList dataKey="displayRate" position="right" fill="#F1F6F3" fontSize={12} offset={10} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Plain language caption */}
          <div className="p-4 rounded-xl bg-card-elevated border border-border-green text-sm sm:text-base text-text-secondary">
            {analysis.consumptionRates.fastestDepleting === 'nitrogen'
              ? t('consumption_caption_fastest_drop')
              : analysis.consumptionRates.fastestDepleting === 'phosphorus' || analysis.consumptionRates.fastestDepleting === 'potassium'
              ? t('consumption_caption_mild_drop')
              : t('consumption_caption_balanced')}
          </div>
        </div>
      </div>

      {/* 5. Weather Analysis and Actionable Tips */}
      <div className="rounded-2xl border border-border-green bg-card p-6 sm:p-8 shadow-card-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-green">
          <div>
            <div className="flex items-center gap-2.5">
              <CloudSun className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary font-bengali">
                {t('weather_section_title')}
              </h3>
            </div>
            <p className="text-sm sm:text-base text-text-secondary mt-1">
              {t('weather_section_explainer')}
            </p>
          </div>

          <span
            className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold border self-start sm:self-auto ${getStatusPillClasses(weatherEval.riskLabel === 'Low' ? 'Good' : weatherEval.riskLabel === 'Moderate' ? 'Fair' : 'Critical')}`}
          >
            {t('weather_risk_label')} {t(weatherEval.riskKey)}
          </span>
        </div>

        <p className="text-base text-text-primary leading-relaxed">
          {weatherEval.summary[lang] || weatherEval.summary.en}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {(weatherEval.tips[lang] || weatherEval.tips.en).map((tip: string, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-card-elevated border border-border-green text-sm sm:text-base text-text-primary flex items-start gap-3"
            >
              <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {formatNumber(idx + 1)}
              </span>
              <span className="leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Comparative Ranking Across All Sections (Most Attention at Top) */}
      <div className="rounded-2xl border border-border-green bg-card p-6 sm:p-8 shadow-card-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-green">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary font-bengali flex items-center gap-2.5">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              <span>{t('ranking_section_title')}</span>
            </h3>
            <p className="text-sm sm:text-base text-text-secondary mt-1">
              {t('ranking_section_explainer')}
            </p>
          </div>

          <div className="text-sm sm:text-base text-accent font-semibold self-start sm:self-auto">
            {t('ranking_batch_position', {
              rank: analysis.batchRank,
              total: analysis.totalSectionsCount
            })}
          </div>
        </div>

        {/* Ranking List */}
        <div className="space-y-3">
          {analysis.sectionRanking.map((sec, idx) => {
            const isSelected = sec.sectionKey.toLowerCase() === batch.sectionKey.toLowerCase();
            const secCropKey = getCropTranslationKey(sec.cropType);
            return (
              <div
                key={sec.sectionKey}
                className={`p-4 sm:p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 transition-all ${
                  isSelected
                    ? 'border-accent bg-card-elevated shadow-glow-sm ring-1 ring-accent'
                    : 'border-border-green bg-card hover:bg-card-elevated'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center justify-center shrink-0 ${
                      idx === 0
                        ? 'bg-alert-warning/20 text-alert-warning border border-alert-warning/40'
                        : 'bg-bg text-text-secondary border border-border-green'
                    }`}
                  >
                    #{formatNumber(idx + 1)}
                  </span>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-text-primary font-mono">
                        {sec.sectionKey}
                      </h4>
                      {isSelected && (
                        <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-accent text-text-on-accent font-bold">
                          {t('ranking_this_batch_badge')}
                        </span>
                      )}
                      <span className="text-xs sm:text-sm text-text-secondary">
                        ({t(secCropKey)})
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-text-secondary block mt-0.5">
                      {t(sec.problemKey)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 self-end md:self-auto flex-wrap">
                  {/* Clean readable NPK labels in regular font, monospace ONLY for numbers */}
                  <div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-text-secondary">
                    <span>{t('chart_nitrogen')} <strong className="font-mono text-text-primary text-sm">{sec.latestN !== null ? formatNumber(sec.latestN) : '—'}</strong></span>
                    <span>•</span>
                    <span>{t('chart_phosphorus')} <strong className="font-mono text-text-primary text-sm">{sec.latestP !== null ? formatNumber(sec.latestP) : '—'}</strong></span>
                    <span>•</span>
                    <span>{t('chart_potassium')} <strong className="font-mono text-text-primary text-sm">{sec.latestK !== null ? formatNumber(sec.latestK) : '—'}</strong></span>
                  </div>

                  <span className={`px-3 py-1 rounded-lg text-xs sm:text-sm ${getStatusPillClasses(sec.level)}`}>
                    {t(sec.levelKey)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Summary */}
        <div className="p-4 rounded-xl bg-card-elevated border border-border-green text-sm sm:text-base text-text-secondary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>
            {analysis.averageHealthScore !== null
              ? t('ranking_avg_score', { score: analysis.averageHealthScore })
              : t('problem_insufficient_data')}
          </span>
          {analysis.averageHealthScore !== null && analysis.scoreBreakdown.totalScore !== null && (
            <span className="font-semibold text-text-primary">
              {analysis.scoreBreakdown.totalScore >= analysis.averageHealthScore
                ? t('ranking_comparison_better', { diff: analysis.scoreBreakdown.totalScore - analysis.averageHealthScore })
                : t('ranking_comparison_worse', { diff: analysis.averageHealthScore - analysis.scoreBreakdown.totalScore })}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
