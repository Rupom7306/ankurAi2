export interface BilingualText {
  en: string;
  bn: string;
}

export interface BilingualList {
  en: string[];
  bn: string[];
}

export interface PestDiagnosisResult {
  isCropOrPlant: boolean;
  detectedSubject: string;
  imageQuality: 'clear' | 'blurry' | 'too_dark' | 'too_far' | 'unclear';
  rejectionReason: BilingualText | null;
  visualObservations: BilingualList;
  pestDetected: boolean;
  pestOrDisease: BilingualText;
  diagnosisConfidence: number | null;
  severity: 'none' | 'low' | 'medium' | 'high';
  isHypothesisOnly: boolean;
  recommendation: BilingualText;
  isLowQuality: boolean;
}

/**
 * Calls backend endpoint /api/analyze-crop
 * Returns full bilingual diagnosis with subject validation and genuine evidence-based scoring
 */
export const diagnoseCropImage = async (
  imageBase64: string,
  cropType: string
): Promise<PestDiagnosisResult> => {
  try {
    const res = await fetch('/api/analyze-crop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        cropType,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();

    const isCropOrPlant = data.isCropOrPlant !== undefined ? Boolean(data.isCropOrPlant) : true;
    const isLowQuality = Boolean(data.isLowQuality || data.imageQuality === 'blurry' || data.imageQuality === 'too_dark');

    return {
      isCropOrPlant,
      detectedSubject: data.detectedSubject || (isCropOrPlant ? cropType : 'Unknown Object'),
      imageQuality: data.imageQuality || (isLowQuality ? 'blurry' : 'clear'),
      rejectionReason: data.rejectionReason && typeof data.rejectionReason === 'object' ? {
        en: data.rejectionReason.en || 'Non-agricultural image detected.',
        bn: data.rejectionReason.bn || 'অনুপযুক্ত বা অ-কৃষিবিষয়ক ছবি সনাক্ত হয়েছে।',
      } : null,
      visualObservations: {
        en: Array.isArray(data.visualObservations?.en) ? data.visualObservations.en : ['Visual inspection completed.'],
        bn: Array.isArray(data.visualObservations?.bn) ? data.visualObservations.bn : ['ভিজ্যুয়াল নিরীক্ষা সম্পন্ন হয়েছে।'],
      },
      pestDetected: isCropOrPlant ? Boolean(data.pestDetected) : false,
      pestOrDisease: {
        en: typeof data.pestOrDisease === 'object' ? data.pestOrDisease.en || 'N/A' : data.pestOrDisease || 'N/A',
        bn: typeof data.pestOrDisease === 'object' ? data.pestOrDisease.bn || 'প্রযোজ্য নয়' : data.pestOrDiseaseBn || 'প্রযোজ্য নয়',
      },
      diagnosisConfidence: typeof data.diagnosisConfidence === 'number'
        ? data.diagnosisConfidence
        : typeof data.confidence === 'number' && isCropOrPlant && !isLowQuality
        ? data.confidence
        : null,
      severity: isCropOrPlant ? (data.severity || 'none') : 'none',
      isHypothesisOnly: Boolean(data.isHypothesisOnly),
      recommendation: {
        en: typeof data.recommendation === 'object' ? data.recommendation.en : data.recommendation || 'Consult your local agricultural extension service.',
        bn: typeof data.recommendation === 'object' ? data.recommendation.bn : data.recommendationBn || 'পরামর্শের জন্য স্থানীয় কৃষি কর্মকর্তার সাথে যোগাযোগ করুন।',
      },
      isLowQuality,
    };
  } catch (err) {
    console.warn('Backend diagnosis endpoint error, using transparent fallback:', err);
    return {
      isCropOrPlant: true,
      detectedSubject: `${cropType} Leaf (Offline)`,
      imageQuality: 'unclear',
      rejectionReason: null,
      visualObservations: {
        en: ['Online vision inspection unavailable — offline mode'],
        bn: ['অনলাইন এআই দৃষ্টি সংযোগ নেই — অফলাইন মোড'],
      },
      pestDetected: false,
      pestOrDisease: {
        en: 'Visual Inspection Pending',
        bn: 'ভিজ্যুয়াল নিরীক্ষা অপেক্ষমাণ',
      },
      diagnosisConfidence: null,
      severity: 'none',
      isHypothesisOnly: true,
      recommendation: {
        en: 'Maintain balanced crop care and review soil telemetry trends.',
        bn: 'সুষম পরিচর্যা বজায় রাখুন এবং মাটির সেন্সর ডেটা পর্যবেক্ষণ করুন।',
      },
      isLowQuality: true,
    };
  }
};
