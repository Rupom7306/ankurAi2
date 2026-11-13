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
  Activity
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
          detected: pestVerdict.pestDetected,
          disease: pestVerdict.pestOrDisease.en,
          confidence: pestVerdict.confidence,
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
        return 'bg-red-500/18 text-[#FCA5A5] border-red-500/35';
      case 'Poor':
        return 'bg-amber-500/18 text-[#FCD34D] border-amber-500/35';
      case 'Fair':
        return 'bg-yellow-500/18 text-[#FDE047] border-yellow-500/35';
      case 'Good':
      case 'Excellent':
      default:
        return 'bg-emerald-500/18 text-[#86EFAC] border-emerald-500/35';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-7 animate-fadeIn pb-20">
      
      {/* Top Bar: Back button and Save action (min 44px height, 16px font) */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-border-header">
        <button
          onClick={onResetToHome}
          className="interactive btn-secondary h-12 px-5 text-sm sm:text-base font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('result_btn_new_scan')}</span>
        </button>

        <button
          onClick={handleSaveAnalysis}
          disabled={isSaving || saveSuccess}
          className={`interactive h-12 px-6 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center gap-2.5 cursor-pointer ${
            saveSuccess
              ? 'bg-accent/20 border border-accent text-accent'
              : 'btn-primary'
          }`}
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>{t('result_saving')}</span>
            </>
          ) : saveSuccess ? (
            <>
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{t('result_saved')}</span>
            </>
          ) : (
            <>
              <Bookmark className="w-5 h-5" />
              <span>{t('result_btn_save')}</span>
            </>
          )}
        </button>
      </div>

      {/* 1. Header: Batch Meta & Location / Weather Snapshot */}
      <div className="rounded-2xl border border-border-green bg-card p-6 sm:p-7 shadow-card-soft flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="font-mono text-sm px-2.5 py-1 rounded-md bg-bg text-accent border border-border-green font-bold">
              {batch.sectionKey}
            </span>
            <span className="text-sm text-text-secondary flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{t('result_planted_on')} {batch.plantingDate}</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-bengali text-text-primary">
            {batch.name}
          </h2>
          <p className="text-base text-accent font-semibold mt-1">
            {t(cropKey)} {batch.variety ? `• ${batch.variety}` : ''}
          </p>
        </div>

        {/* Weather capsule */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-card-elevated border border-border-green self-start md:self-auto">
          <CloudSun className="w-8 h-8 text-accent shrink-0" />
          <div className="text-sm sm:text-base">
            <div className="flex items-center gap-2.5">
              <strong className="text-text-primary">
                {typeof weather.locationName === 'object'
                  ? weather.locationName[lang] || weather.locationName.en
                  : weather.locationName}
              </strong>
              <span className="text-accent font-bold font-mono">{formatNumber(weather.current.temperature)}°C</span>
            </div>
            <div className="text-sm text-text-secondary flex gap-3 mt-1">
              <span>{t('weather_humidity')}: {formatNumber(weather.current.humidity)}%</span>
              <span>{t('weather_precipitation')}: {formatNumber(weather.current.precipitation)}mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Health Level (Large & Clear) with 1-Sentence Plain Explainer */}
      <div className="rounded-2xl border border-border-green bg-card p-6 sm:p-8 shadow-card-soft space-y-5">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-green">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-text-secondary block mb-1">
                {t('result_health_title')}
              </span>
              <div className="flex items-baseline gap-3.5 flex-wrap">
                <h3 
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight"
                  style={{ color: analysis.levelColor }}
                >
                  {t(analysis.levelKey)}
                </h3>
                <span className="text-lg font-mono text-text-secondary">
                  ({t('score_out_of_100', { score: analysis.scoreBreakdown.totalScore })})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${getStatusPillClasses(analysis.level)}`}>
                {t(analysis.levelKey)}
              </span>
            </div>
          </div>

          {/* 1-sentence plain-language explainer */}
          <p className="text-base text-text-secondary mt-3 font-normal leading-relaxed">
            {t('health_section_explainer')}
          </p>

          {/* One line summary diagnosis reason */}
          <div className="mt-4 p-4 rounded-xl bg-card-elevated border border-border-green text-base text-text-primary font-medium leading-relaxed">
            {t(analysis.problemKey)}
          </div>
        </div>

        {/* Transparent Score Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border-green">
          <div className="p-4 rounded-xl bg-card-elevated border border-border-green">
            <span className="text-sm text-text-secondary block mb-1">{t('score_npk')}</span>
            <strong className="text-text-primary font-mono text-base sm:text-lg">
              {formatNumber(analysis.scoreBreakdown.npkScore)} / {formatNumber(40)}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-card-elevated border border-border-green">
            <span className="text-sm text-text-secondary block mb-1">{t('score_humidity')}</span>
            <strong className="text-text-primary font-mono text-base sm:text-lg">
              {formatNumber(analysis.scoreBreakdown.humidityScore)} / {formatNumber(20)}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-card-elevated border border-border-green">
            <span className="text-sm text-text-secondary block mb-1">{t('score_trend')}</span>
            <strong className="text-text-primary font-mono text-base sm:text-lg">
              {formatNumber(analysis.scoreBreakdown.trendScore)} / {formatNumber(25)}
            </strong>
          </div>
          <div className="p-4 rounded-xl bg-card-elevated border border-border-green">
            <span className="text-sm text-text-secondary block mb-1">{t('score_penalty')}</span>
            <strong className="text-alert-warning font-mono text-base sm:text-lg">
              {penaltyScore > 0 
                ? `-${formatNumber(penaltyScore)} ${t('unit_pts')}`
                : `0 ${t('unit_pts')}`}
            </strong>
          </div>
        </div>
      </div>

      {/* 3. Pest & Disease Verdict with Uploaded Image */}
      <div className="rounded-2xl border border-border-green bg-card p-6 sm:p-8 shadow-card-soft space-y-5">
        <div className="pb-4 border-b border-border-green">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-accent" />
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary font-bengali">
              {t('pest_section_title')}
            </h3>
          </div>
          <p className="text-base text-text-secondary mt-1">
            {t('pest_section_explainer')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Uploaded Crop Image Thumbnail */}
          <div className="relative w-full sm:w-56 aspect-[4/3] rounded-2xl overflow-hidden border border-border-green bg-black shrink-0">
            <img
              src={cropImage}
              alt="Analyzed crop sample"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Verdict details */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3.5">
              {pestVerdict.pestDetected ? (
                <div className="w-9 h-9 rounded-full bg-alert-warning/20 text-alert-warning flex items-center justify-center shrink-0 border border-alert-warning/35">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-accent/20 text-accent flex items-center justify-center shrink-0 border border-accent/35">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-text-primary">
                  {pestVerdict.pestOrDisease[lang] || pestVerdict.pestOrDisease.en}
                </h4>
                <div className="flex items-center gap-3 text-sm text-text-secondary mt-1 flex-wrap">
                  <span>{t('pest_confidence')}: <strong className="font-mono text-accent">{formatNumber(pestVerdict.confidence)}%</strong></span>
                  <span>•</span>
                  <span>{t('pest_severity')}: <strong className="text-text-primary">{t(`pest_severity_${pestVerdict.severity}` as TranslationKey)}</strong></span>
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-4 rounded-xl bg-card-elevated border border-border-green text-sm sm:text-base space-y-1">
              <span className="text-sm text-accent font-bold block">
                {t('pest_recommendation_label')}:
              </span>
              <p className="text-text-primary leading-relaxed font-normal">
                {pestVerdict.recommendation[lang] || pestVerdict.recommendation.en}
              </p>
            </div>

            <p className="text-sm text-text-secondary italic">
              * {t('pest_disclaimer')}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Mineral Graphs & Weekly Consumption Rate */}
      <div className="rounded-2xl border border-border-green bg-card p-6 sm:p-8 shadow-card-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-green">
          <div>
            <div className="flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-accent" />
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary font-bengali">
                {t('trends_section_title')}
              </h3>
            </div>
            <p className="text-base text-text-secondary mt-1">
              {t('trends_section_explainer')}
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex rounded-xl border border-border-green bg-card p-1">
            <button
              onClick={() => setActiveChartTab('npk')}
              className={`interactive px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-all cursor-pointer ${
                activeChartTab === 'npk'
                  ? 'bg-accent text-text-on-accent font-bold shadow-glow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t('chart_toggle_npk')}
            </button>
            <button
              onClick={() => setActiveChartTab('humidity')}
              className={`interactive px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-all cursor-pointer ${
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
                <XAxis dataKey="date" stroke="#B4C6BC" fontSize={14} tickLine={false} />
                <YAxis stroke="#B4C6BC" fontSize={14} tickLine={false} domain={['auto', 'auto']} />
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
                  wrapperStyle={{ fontSize: '14px', color: '#B4C6BC', paddingTop: '10px' }} 
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
                <XAxis dataKey="date" stroke="#B4C6BC" fontSize={14} tickLine={false} />
                <YAxis stroke="#B4C6BC" fontSize={14} tickLine={false} domain={[40, 100]} />
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
                  wrapperStyle={{ fontSize: '14px', color: '#B4C6BC', paddingTop: '10px' }} 
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
            <span className="text-sm text-text-secondary">
              {t('consumption_section_explainer')}
            </span>
          </div>

          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumptionBarData} layout="vertical" margin={{ left: 20, right: 60, top: 10, bottom: 10 }}>
                <CartesianGrid stroke="rgba(74, 222, 128, 0.12)" horizontal={false} />
                <XAxis type="number" stroke="#B4C6BC" fontSize={13} />
                <YAxis dataKey="mineral" type="category" stroke="#B4C6BC" fontSize={14} tickLine={false} width={130} />
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
                  <LabelList dataKey="displayRate" position="right" fill="#F1F6F3" fontSize={13} offset={10} />
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
              <CloudSun className="w-6 h-6 text-accent" />
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary font-bengali">
                {t('weather_section_title')}
              </h3>
            </div>
            <p className="text-base text-text-secondary mt-1">
              {t('weather_section_explainer')}
            </p>
          </div>

          <span
            className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusPillClasses(weatherEval.riskLabel === 'Low' ? 'Good' : weatherEval.riskLabel === 'Moderate' ? 'Fair' : 'Critical')}`}
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
              <Award className="w-6 h-6 text-accent" />
              <span>{t('ranking_section_title')}</span>
            </h3>
            <p className="text-base text-text-secondary mt-1">
              {t('ranking_section_explainer')}
            </p>
          </div>

          <div className="text-base text-accent font-semibold">
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
                className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  isSelected
                    ? 'border-accent bg-card-elevated shadow-glow-sm ring-1 ring-accent'
                    : 'border-border-green bg-card hover:bg-card-elevated'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`w-9 h-9 rounded-xl text-sm font-mono font-bold flex items-center justify-center shrink-0 ${
                      idx === 0
                        ? 'bg-alert-warning/20 text-alert-warning border border-alert-warning/40'
                        : 'bg-bg text-text-secondary border border-border-green'
                    }`}
                  >
                    #{formatNumber(idx + 1)}
                  </span>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="text-base sm:text-lg font-bold text-text-primary font-mono">
                        {sec.sectionKey}
                      </h4>
                      {isSelected && (
                        <span className="text-xs px-2 py-0.5 rounded bg-accent text-text-on-accent font-bold">
                          {t('ranking_this_batch_badge')}
                        </span>
                      )}
                      <span className="text-sm text-text-secondary">
                        ({t(secCropKey)})
                      </span>
                    </div>
                    <span className="text-sm text-text-secondary block mt-0.5">
                      {t(sec.problemKey)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-auto flex-wrap">
                  {/* Clean readable NPK labels in regular font, monospace ONLY for numbers */}
                  <div className="flex items-center gap-3 text-sm sm:text-base text-text-secondary">
                    <span>{t('chart_nitrogen')} <strong className="font-mono text-text-primary text-base">{sec.latestN !== null ? formatNumber(sec.latestN) : '—'}</strong></span>
                    <span>•</span>
                    <span>{t('chart_phosphorus')} <strong className="font-mono text-text-primary text-base">{sec.latestP !== null ? formatNumber(sec.latestP) : '—'}</strong></span>
                    <span>•</span>
                    <span>{t('chart_potassium')} <strong className="font-mono text-text-primary text-base">{sec.latestK !== null ? formatNumber(sec.latestK) : '—'}</strong></span>
                  </div>

                  <span className={`px-3 py-1.5 rounded-lg text-sm font-bold border ${getStatusPillClasses(sec.level)}`}>
                    {t(sec.levelKey)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Summary */}
        <div className="p-4 rounded-xl bg-card-elevated border border-border-green text-sm sm:text-base text-text-secondary flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span>{t('ranking_avg_score', { score: analysis.averageHealthScore })}</span>
          <span className="font-semibold text-text-primary">
            {analysis.scoreBreakdown.totalScore >= analysis.averageHealthScore
              ? t('ranking_comparison_better', { diff: analysis.scoreBreakdown.totalScore - analysis.averageHealthScore })
              : t('ranking_comparison_worse', { diff: analysis.averageHealthScore - analysis.scoreBreakdown.totalScore })}
          </span>
        </div>
      </div>

    </div>
  );
};
