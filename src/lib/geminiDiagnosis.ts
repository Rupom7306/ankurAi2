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

const SYSTEM_PROMPT = (cropType: string) => `You are an expert agricultural vision inspector specialized in plant pathology for Bangladeshi crops (Boro/Aman rice, wheat, potato, tomato, maize, jute, mustard, lentil, chili, onion). Target crop context: "${cropType}".

Analyze the provided image with rigorous scientific objectivity:

1. SUBJECT VALIDATION:
   Determine if this image actually depicts a plant, crop, foliage/leaf, stem, root, fruit, or agricultural field soil.
   - If the image depicts a non-agricultural subject (e.g. an animal like a cat or dog, human/selfie, vehicle, room interior, computer screen/screenshot, document, or random household object):
     Set "isCropOrPlant": false,
     Provide a clear "detectedSubject" description (e.g. "Cat / Domestic Pet", "Screenshot of application", "Person", "Vehicle", "Household Object"),
     Provide a polite "rejectionReason" in both English and Bangla asking the user to upload a photo of their crop or leaf,
     Set "diagnosisConfidence": null,
     Set "pestDetected": false,
     Set "severity": "none",
     Do NOT fabricate plant diseases or pesticide recommendations for non-plants.

2. IMAGE QUALITY CHECK (for plants):
   Evaluate if the visual clarity is sufficient: "clear", "blurry", "too_dark", "too_far", or "unclear".
   - If too blurry or dark to see leaf textures:
     Set "isLowQuality": true,
     Set "isHypothesisOnly": true,
     Keep "diagnosisConfidence" low (below 45) or null.

3. VISUAL OBSERVATIONS & SYMPTOMS:
   List ONLY what is directly observable in the photo (e.g. "Spindle-shaped brown lesions with gray centers", "Uniform green leaf tissue with no lesions", "Yellowing along leaf tips").
   Do not guess unseen symptoms.

4. DIAGNOSIS & DISTINCTION:
   - "pestDetected": true only if visual evidence of pests or disease is observed. If foliage is healthy, false.
   - "pestOrDisease": The name of the probable condition or "Healthy Foliage (No active foliar disease detected)".
   - "diagnosisConfidence": An integer (0 to 100) reflecting TRUE visual certainty based on symptom clarity. If non-plant, null.
   - "isHypothesisOnly": true if visual symptoms are ambiguous or tentative; false only if classic definitive signs are visible or leaf is clearly healthy.
   - "severity": "none" | "low" | "medium" | "high".
   - "recommendation": Actionable agronomical advice tailored strictly to the observed evidence.

Output ONLY valid JSON matching this schema:
{
  "isCropOrPlant": boolean,
  "detectedSubject": string,
  "imageQuality": "clear" | "blurry" | "too_dark" | "too_far" | "unclear",
  "rejectionReason": { "en": string, "bn": string } | null,
  "visualObservations": { "en": string[], "bn": string[] },
  "pestDetected": boolean,
  "pestOrDisease": { "en": string, "bn": string },
  "diagnosisConfidence": number | null,
  "severity": "none" | "low" | "medium" | "high",
  "isHypothesisOnly": boolean,
  "recommendation": { "en": string, "bn": string },
  "isLowQuality": boolean
}`;

/**
 * Direct client-side Gemini Vision call as a resilient fallback
 * when backend serverless endpoint is 404, unreachable, or on static hosting.
 */
const callClientSideGemini = async (imageBase64: string, cropType: string): Promise<Record<string, unknown> | null> => {
  const apiKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
  const prompt = SYSTEM_PROMPT(cropType);
  const models = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        }),
        signal: AbortSignal.timeout(20000)
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return JSON.parse(text);
        }
      }
    } catch (err) {
      console.warn(`[Client-side Gemini] Error with ${model}:`, err);
    }
  }

  return null;
};

/**
 * Calls backend endpoint /api/analyze-crop (Vercel Serverless Function or Vite dev middleware)
 * and falls back to direct client-side Gemini API if needed.
 * Returns full bilingual diagnosis with subject validation and genuine evidence-based scoring.
 */
export const diagnoseCropImage = async (
  imageBase64: string,
  cropType: string
): Promise<PestDiagnosisResult> => {
  let rawData: Record<string, unknown> | null = null;

  // 1. First try the serverless backend endpoint (/api/analyze-crop)
  try {
    const res = await fetch('/api/analyze-crop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        cropType,
      }),
    });

    if (res.ok) {
      rawData = await res.json();
    } else {
      console.warn(`Backend /api/analyze-crop returned status ${res.status}`);
    }
  } catch (err) {
    console.warn('Backend endpoint unreachable, trying client-side fallback:', err);
  }

  // 2. If backend failed or wasn't available, attempt direct client-side Gemini fallback
  if (!rawData) {
    rawData = await callClientSideGemini(imageBase64, cropType);
  }

  // 3. If analysis succeeded, format and return verified result
  if (rawData) {
    const isCropOrPlant = rawData.isCropOrPlant !== undefined ? Boolean(rawData.isCropOrPlant) : true;
    const isLowQuality = Boolean(
      rawData.isLowQuality || rawData.imageQuality === 'blurry' || rawData.imageQuality === 'too_dark'
    );

    const rejectionReason = rawData.rejectionReason as { en?: string; bn?: string } | null;
    const visualObservations = rawData.visualObservations as { en?: string[]; bn?: string[] } | null;
    const pestOrDisease = rawData.pestOrDisease as { en?: string; bn?: string } | string | null;
    const recommendation = rawData.recommendation as { en?: string; bn?: string } | string | null;

    return {
      isCropOrPlant,
      detectedSubject: (rawData.detectedSubject as string) || (isCropOrPlant ? cropType : 'Unknown Object'),
      imageQuality: (rawData.imageQuality as PestDiagnosisResult['imageQuality']) || (isLowQuality ? 'blurry' : 'clear'),
      rejectionReason: rejectionReason && typeof rejectionReason === 'object' ? {
        en: rejectionReason.en || 'Non-agricultural image detected.',
        bn: rejectionReason.bn || 'অনুপযুক্ত বা অ-কৃষিবিষয়ক ছবি সনাক্ত হয়েছে।',
      } : null,
      visualObservations: {
        en: Array.isArray(visualObservations?.en) ? visualObservations.en : ['Visual inspection completed.'],
        bn: Array.isArray(visualObservations?.bn) ? visualObservations.bn : ['ভিজ্যুয়াল নিরীক্ষা সম্পন্ন হয়েছে।'],
      },
      pestDetected: isCropOrPlant ? Boolean(rawData.pestDetected) : false,
      pestOrDisease: {
        en: typeof pestOrDisease === 'object' ? pestOrDisease?.en || 'N/A' : (pestOrDisease as string) || 'N/A',
        bn: typeof pestOrDisease === 'object' ? pestOrDisease?.bn || 'প্রযোজ্য নয়' : 'প্রযোজ্য নয়',
      },
      diagnosisConfidence: typeof rawData.diagnosisConfidence === 'number'
        ? rawData.diagnosisConfidence
        : typeof rawData.confidence === 'number' && isCropOrPlant && !isLowQuality
        ? (rawData.confidence as number)
        : null,
      severity: isCropOrPlant ? ((rawData.severity as PestDiagnosisResult['severity']) || 'none') : 'none',
      isHypothesisOnly: Boolean(rawData.isHypothesisOnly),
      recommendation: {
        en: typeof recommendation === 'object' ? recommendation?.en || '' : (recommendation as string) || 'Consult your local agricultural extension service.',
        bn: typeof recommendation === 'object' ? recommendation?.bn || '' : 'পরামর্শের জন্য স্থানীয় কৃষি কর্মকর্তার সাথে যোগাযোগ করুন।',
      },
      isLowQuality,
    };
  }

  // 4. Transparent offline fallback when both backend and client API keys are unconfigured
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
};
