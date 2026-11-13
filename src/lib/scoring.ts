import { ParsedSensorRow } from './excelParser';
import { getCropProfile } from '../config/cropProfiles';
import { TranslationKey } from '../i18n';

export type HealthLevel = 'Critical' | 'Poor' | 'Fair' | 'Good' | 'Excellent';

export interface ScoreBreakdown {
  npkScore: number; // 0 - 40
  humidityScore: number; // 0 - 20
  trendScore: number; // 0 - 25
  weatherPenalty: number; // 0 - 10
  pestPenalty: number; // 0 - 15
  totalScore: number; // 0 - 100
}

export interface SectionHealthSummary {
  sectionKey: string;
  cropType: string;
  totalScore: number;
  level: HealthLevel;
  levelKey: TranslationKey;
  levelColor: string;
  problemKey: TranslationKey;
  latestN: number | null;
  latestP: number | null;
  latestK: number | null;
  latestHumidity: number | null;
  consumptionRateN: number; // change per week
  consumptionRateP: number;
  consumptionRateK: number;
}

export interface BatchAnalysisResult {
  batchSectionKey: string;
  level: HealthLevel;
  levelKey: TranslationKey;
  levelColor: string;
  problemKey: TranslationKey;
  scoreBreakdown: ScoreBreakdown;
  timelineData: Array<{
    date: string;
    nitrogen: number | null;
    phosphorus: number | null;
    potassium: number | null;
    humidity: number | null;
  }>;
  consumptionRates: {
    nWeeklyChange: number;
    pWeeklyChange: number;
    kWeeklyChange: number;
    fastestDepleting: 'nitrogen' | 'phosphorus' | 'potassium' | 'none';
  };
  sectionRanking: SectionHealthSummary[];
  batchRank: number;
  totalSectionsCount: number;
  averageHealthScore: number;
}

const getLevelMeta = (score: number): { level: HealthLevel; levelKey: TranslationKey; color: string } => {
  if (score < 40) return { level: 'Critical', levelKey: 'level_critical', color: '#EF4444' };
  if (score < 60) return { level: 'Poor', levelKey: 'level_poor', color: '#F97316' };
  if (score < 75) return { level: 'Fair', levelKey: 'level_fair', color: '#F59E0B' };
  if (score < 90) return { level: 'Good', levelKey: 'level_good', color: '#84CC16' };
  return { level: 'Excellent', levelKey: 'level_excellent', color: '#4ADE80' };
};

/**
 * Calculates health score and diagnosis key for a specific section
 */
export const calculateSectionHealth = (
  _sectionKey: string,
  rows: ParsedSensorRow[],
  cropType = 'Boro Rice',
  weatherRisk: 'Low' | 'Moderate' | 'High' = 'Low',
  pestSeverity: 'none' | 'low' | 'medium' | 'high' = 'none'
): { score: number; level: HealthLevel; levelKey: TranslationKey; levelColor: string; problemKey: TranslationKey; breakdown: ScoreBreakdown; nRate: number; pRate: number; kRate: number } => {
  const profile = getCropProfile(cropType);

  if (rows.length === 0) {
    return {
      score: 50,
      level: 'Fair',
      levelKey: 'level_fair',
      levelColor: '#F59E0B',
      problemKey: 'problem_insufficient_data',
      breakdown: { npkScore: 20, humidityScore: 10, trendScore: 15, weatherPenalty: 0, pestPenalty: 0, totalScore: 50 },
      nRate: 0,
      pRate: 0,
      kRate: 0,
    };
  }

  // Get valid non-null rows
  const nRows = rows.filter((r) => r.nitrogen !== null);
  const pRows = rows.filter((r) => r.phosphorus !== null);
  const kRows = rows.filter((r) => r.potassium !== null);
  const hRows = rows.filter((r) => r.humidity !== null);

  const latestN = nRows.length > 0 ? nRows[nRows.length - 1].nitrogen! : (profile.nRange[0] + profile.nRange[1]) / 2;
  const latestP = pRows.length > 0 ? pRows[pRows.length - 1].phosphorus! : (profile.pRange[0] + profile.pRange[1]) / 2;
  const latestK = kRows.length > 0 ? kRows[kRows.length - 1].potassium! : (profile.kRange[0] + profile.kRange[1]) / 2;
  const latestH = hRows.length > 0 ? hRows[hRows.length - 1].humidity! : 70;

  // 1. NPK Current Value Score (out of 40)
  let npkPoints = 40;
  let detectedProblemKey: TranslationKey = 'problem_balanced';

  // Nitrogen check
  if (latestN < profile.nRange[0]) {
    const deficitPercent = (profile.nRange[0] - latestN) / profile.nRange[0];
    npkPoints -= Math.min(20, Math.round(deficitPercent * 30));
    detectedProblemKey = 'problem_nitrogen_deficient';
  } else if (latestN > profile.nRange[1] * 1.25) {
    npkPoints -= 6;
  }

  // Phosphorus check
  if (latestP < profile.pRange[0]) {
    const deficitPercent = (profile.pRange[0] - latestP) / profile.pRange[0];
    npkPoints -= Math.min(15, Math.round(deficitPercent * 25));
    if (detectedProblemKey === 'problem_balanced') {
      detectedProblemKey = 'problem_phosphorus_deficient';
    }
  }

  // Potassium check
  if (latestK < profile.kRange[0]) {
    npkPoints -= 8;
    if (detectedProblemKey === 'problem_balanced') {
      detectedProblemKey = 'problem_potassium_deficient';
    }
  }
  npkPoints = Math.max(0, npkPoints);

  // 2. Humidity Score (out of 20)
  let humidityPoints = 20;
  if (latestH > profile.humidityRange[1] + 10) {
    humidityPoints = 6;
    if (detectedProblemKey === 'problem_balanced') {
      detectedProblemKey = 'problem_excessive_humidity';
    }
  } else if (latestH < profile.humidityRange[0] - 10) {
    humidityPoints = 8;
  }

  // 3. Trend & Consumption Rate Analysis (out of 25)
  const totalDays = Math.max(1, (new Date(rows[rows.length - 1].date).getTime() - new Date(rows[0].date).getTime()) / (1000 * 3600 * 24));
  const weeks = Math.max(1, totalDays / 7);

  const firstN = nRows.length > 0 ? nRows[0].nitrogen! : latestN;
  const firstP = pRows.length > 0 ? pRows[0].phosphorus! : latestP;
  const firstK = kRows.length > 0 ? kRows[0].potassium! : latestK;

  const nWeeklyRate = parseFloat(((latestN - firstN) / weeks).toFixed(1));
  const pWeeklyRate = parseFloat(((latestP - firstP) / weeks).toFixed(1));
  const kWeeklyRate = parseFloat(((latestK - firstK) / weeks).toFixed(1));

  let trendPoints = 25;
  // If Nitrogen dropped rapidly (e.g. west-102 dropped > 25 mg/kg overall)
  if (firstN - latestN > 25) {
    trendPoints -= 18;
    detectedProblemKey = 'problem_nitrogen_depleting_fast';
  } else if (firstP - latestP > 12) {
    trendPoints -= 12;
    if (detectedProblemKey === 'problem_balanced') {
      detectedProblemKey = 'problem_phosphorus_depleting';
    }
  }

  trendPoints = Math.max(0, trendPoints);

  // 4. Weather & Pest Penalties
  const weatherPenalty = weatherRisk === 'High' ? 10 : weatherRisk === 'Moderate' ? 5 : 0;
  const pestPenalty =
    pestSeverity === 'high' ? 15 : pestSeverity === 'medium' ? 10 : pestSeverity === 'low' ? 4 : 0;

  const rawTotal = npkPoints + humidityPoints + trendPoints - weatherPenalty - pestPenalty;
  const totalScore = Math.max(15, Math.min(98, rawTotal));

  const { level, levelKey, color } = getLevelMeta(totalScore);

  return {
    score: totalScore,
    level,
    levelKey,
    levelColor: color,
    problemKey: detectedProblemKey,
    breakdown: {
      npkScore: npkPoints,
      humidityScore: humidityPoints,
      trendScore: trendPoints,
      weatherPenalty,
      pestPenalty,
      totalScore,
    },
    nRate: nWeeklyRate,
    pRate: pWeeklyRate,
    kRate: kWeeklyRate,
  };
};

/**
 * Executes comprehensive analysis across the selected batch and all sections
 */
export const runFullAnalysis = (
  selectedSectionKey: string,
  selectedCropType: string,
  allRows: ParsedSensorRow[],
  weatherRisk: 'Low' | 'Moderate' | 'High' = 'Low',
  pestSeverity: 'none' | 'low' | 'medium' | 'high' = 'none'
): BatchAnalysisResult => {
  // Group rows by section
  const sectionGroups: Record<string, ParsedSensorRow[]> = {};
  allRows.forEach((row) => {
    const sec = row.section.toLowerCase();
    if (!sectionGroups[sec]) sectionGroups[sec] = [];
    sectionGroups[sec].push(row);
  });

  // Analyze every section for comparison & ranking
  const sectionSummaries: SectionHealthSummary[] = [];

  Object.entries(sectionGroups).forEach(([secKey, sRows]) => {
    sRows.sort((a, b) => a.date.localeCompare(b.date));
    const sectionCrop = sRows[0]?.cropType || selectedCropType;
    const isSelected = secKey === selectedSectionKey.toLowerCase();

    const analysis = calculateSectionHealth(
      secKey,
      sRows,
      sectionCrop,
      isSelected ? weatherRisk : 'Low',
      isSelected ? pestSeverity : 'none'
    );

    const nRows = sRows.filter((r) => r.nitrogen !== null);
    const pRows = sRows.filter((r) => r.phosphorus !== null);
    const kRows = sRows.filter((r) => r.potassium !== null);
    const hRows = sRows.filter((r) => r.humidity !== null);

    sectionSummaries.push({
      sectionKey: secKey,
      cropType: sectionCrop,
      totalScore: analysis.score,
      level: analysis.level,
      levelKey: analysis.levelKey,
      levelColor: analysis.levelColor,
      problemKey: analysis.problemKey,
      latestN: nRows.length > 0 ? nRows[nRows.length - 1].nitrogen : null,
      latestP: pRows.length > 0 ? pRows[pRows.length - 1].phosphorus : null,
      latestK: kRows.length > 0 ? kRows[kRows.length - 1].potassium : null,
      latestHumidity: hRows.length > 0 ? hRows[hRows.length - 1].humidity : null,
      consumptionRateN: analysis.nRate,
      consumptionRateP: analysis.pRate,
      consumptionRateK: analysis.kRate,
    });
  });

  // Rank so the batch needing the MOST attention is at the TOP (lowest score first)
  sectionSummaries.sort((a, b) => a.totalScore - b.totalScore);

  const targetKeyNorm = selectedSectionKey.toLowerCase();
  const batchRank = sectionSummaries.findIndex((s) => s.sectionKey === targetKeyNorm) + 1;

  // Selected batch detailed analysis
  const targetRows = sectionGroups[targetKeyNorm] || [];
  targetRows.sort((a, b) => a.date.localeCompare(b.date));

  const targetAnalysis = calculateSectionHealth(
    selectedSectionKey,
    targetRows,
    selectedCropType,
    weatherRisk,
    pestSeverity
  );

  const avgScore = Math.round(
    sectionSummaries.reduce((acc, s) => acc + s.totalScore, 0) / Math.max(1, sectionSummaries.length)
  );

  let fastestDrop: 'nitrogen' | 'phosphorus' | 'potassium' | 'none' = 'none';
  if (targetAnalysis.nRate < targetAnalysis.pRate && targetAnalysis.nRate < targetAnalysis.kRate && targetAnalysis.nRate < -3) {
    fastestDrop = 'nitrogen';
  } else if (targetAnalysis.pRate < -2) {
    fastestDrop = 'phosphorus';
  } else if (targetAnalysis.kRate < -3) {
    fastestDrop = 'potassium';
  }

  return {
    batchSectionKey: selectedSectionKey,
    level: targetAnalysis.level,
    levelKey: targetAnalysis.levelKey,
    levelColor: targetAnalysis.levelColor,
    problemKey: targetAnalysis.problemKey,
    scoreBreakdown: targetAnalysis.breakdown,
    timelineData: targetRows.map((r) => ({
      date: r.date.slice(5), // MM-DD
      nitrogen: r.nitrogen,
      phosphorus: r.phosphorus,
      potassium: r.potassium,
      humidity: r.humidity,
    })),
    consumptionRates: {
      nWeeklyChange: targetAnalysis.nRate,
      pWeeklyChange: targetAnalysis.pRate,
      kWeeklyChange: targetAnalysis.kRate,
      fastestDepleting: fastestDrop,
    },
    sectionRanking: sectionSummaries,
    batchRank: Math.max(1, batchRank),
    totalSectionsCount: sectionSummaries.length,
    averageHealthScore: avgScore,
  };
};
