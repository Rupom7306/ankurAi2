import { bn } from './bn';
import { en } from './en';

export type Language = 'bn' | 'en';
export type TranslationKey = keyof typeof bn;

export const dictionaries = {
  bn,
  en,
};

/**
 * Converts Western digits 0-9 to Bangla digits ০-৯
 */
export const toBanglaDigits = (val: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
};

/**
 * Formats a number according to the chosen language
 */
export const formatNumber = (val: number | string | null | undefined, lang: Language): string => {
  if (val === null || val === undefined || val === '') return '-';
  const str = String(val);
  return lang === 'bn' ? toBanglaDigits(str) : str;
};

/**
 * Maps dynamic crop types to i18n keys
 */
export const getCropTranslationKey = (cropType: string): TranslationKey => {
  const c = cropType.toLowerCase();
  if (c.includes('boro')) return 'crop_boro_rice';
  if (c.includes('aman')) return 'crop_aman_rice';
  if (c.includes('aus')) return 'crop_aus_rice';
  if (c.includes('rice') || c.includes('ধান')) return 'crop_boro_rice';
  if (c.includes('wheat') || c.includes('গম')) return 'crop_wheat';
  if (c.includes('potato') || c.includes('আলু')) return 'crop_potato';
  if (c.includes('tomato') || c.includes('টমেটো')) return 'crop_tomato';
  if (c.includes('maize') || c.includes('ভুট্টা')) return 'crop_maize';
  if (c.includes('jute') || c.includes('পাট')) return 'crop_jute';
  if (c.includes('mustard') || c.includes('সরিষা')) return 'crop_mustard';
  if (c.includes('lentil') || c.includes('ডাল')) return 'crop_lentil';
  if (c.includes('chili') || c.includes('মরিচ')) return 'crop_chili';
  if (c.includes('onion') || c.includes('পেঁয়াজ')) return 'crop_onion';
  return 'crop_default';
};

/**
 * Maps dynamic health levels to i18n keys
 */
export const getLevelTranslationKey = (level: string): TranslationKey => {
  switch (level.toLowerCase()) {
    case 'critical':
      return 'level_critical';
    case 'poor':
      return 'level_poor';
    case 'fair':
      return 'level_fair';
    case 'good':
      return 'level_good';
    case 'excellent':
      return 'level_excellent';
    default:
      return 'level_fair';
  }
};
