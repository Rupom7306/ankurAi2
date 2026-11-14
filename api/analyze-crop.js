// Vercel Serverless Function for Image Diagnosis
// Runs in Node.js on Vercel infrastructure

const SYSTEM_PROMPT = (cropType) => `You are an expert agricultural vision inspector specialized in plant pathology for Bangladeshi crops (Boro/Aman rice, wheat, potato, tomato, maize, jute, mustard, lentil, chili, onion). Target crop context: "${cropType}".

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

export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON payload' });
      }
    }

    const { imageBase64, mimeType = 'image/jpeg', cropType = 'Crop' } = body || {};

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 parameter' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in Vercel environment variables.',
        isConfigError: true
      });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const prompt = SYSTEM_PROMPT(cropType);

    const modelsToTry = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];
    let geminiResult = null;

    for (const model of modelsToTry) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const apiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inlineData: { mimeType, data: cleanBase64 } }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json'
            }
          }),
          signal: AbortSignal.timeout(20000)
        });

        if (apiRes.ok) {
          const data = await apiRes.json();
          const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawJson) {
            geminiResult = JSON.parse(rawJson);
            break;
          }
        } else {
          console.warn(`[Vercel API] Model ${model} returned HTTP ${apiRes.status}`);
        }
      } catch (e) {
        console.warn(`[Vercel API] Error with ${model}:`, e);
      }
    }

    if (!geminiResult) {
      return res.status(502).json({
        error: 'Gemini vision service temporarily unreachable or model quota exceeded.'
      });
    }

    return res.status(200).json(geminiResult);
  } catch (err) {
    console.error('[Vercel API] analyze-crop error:', err);
    return res.status(500).json({ error: 'Internal server error during analysis' });
  }
}
