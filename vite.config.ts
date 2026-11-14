import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function geminiBackendPlugin(): Plugin {
  return {
    name: 'gemini-backend-plugin',
    configureServer(server) {
      server.middlewares.use('/api/analyze-crop', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const { imageBase64, mimeType = 'image/jpeg', cropType = 'Crop' } = JSON.parse(body);
            const env = loadEnv('', process.cwd(), '');
            const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

            const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

            const systemPrompt = `You are an expert agricultural vision inspector specialized in plant pathology for Bangladeshi crops (Boro/Aman rice, wheat, potato, tomato, maize, jute, mustard, lentil, chili, onion). Target crop context: "${cropType}".

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

            let geminiResult = null;
            if (apiKey) {
              const modelsToTry = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];
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
                            { text: systemPrompt },
                            { inlineData: { mimeType, data: cleanBase64 } }
                          ]
                        }
                      ],
                      generationConfig: {
                        responseMimeType: 'application/json'
                      }
                    }),
                    signal: AbortSignal.timeout(18000)
                  });

                  if (apiRes.ok) {
                    const data = await apiRes.json();
                    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (rawJson) {
                      geminiResult = JSON.parse(rawJson);
                      break;
                    }
                  } else {
                    console.warn(`Model ${model} returned status ${apiRes.status}`);
                  }
                } catch (e) {
                  console.warn(`Gemini API error with ${model}:`, e);
                }
              }
            }

            if (!geminiResult) {
              // Unverified / Offline Fallback — never invent fake 90% confidence or fake leaf health!
              geminiResult = {
                isCropOrPlant: true,
                detectedSubject: "Crop Foliage (Offline Analysis)",
                imageQuality: "unclear",
                rejectionReason: null,
                visualObservations: {
                  en: ["Image visual inspection pending online verification"],
                  bn: ["অনলাইন সংযোগ না থাকায় পাতার ভিজ্যুয়াল পরীক্ষা অপেক্ষমাণ"]
                },
                pestDetected: false,
                pestOrDisease: {
                  en: "Visual Diagnosis Pending (Offline)",
                  bn: "ভিজ্যুয়াল রোগ নিরীক্ষা অপেক্ষমাণ (অফলাইন)"
                },
                diagnosisConfidence: null,
                severity: "none",
                isHypothesisOnly: true,
                recommendation: {
                  en: "Consult your local Upazila Agriculture Officer (DAE) for on-field leaf pathology verification.",
                  bn: "মাঠ পর্যায়ে পাতা পরীক্ষার জন্য স্থানীয় উপজেলা কৃষি কর্মকর্তার (ডিএই) পরামর্শ নিন।"
                },
                isLowQuality: true
              };
            }

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(geminiResult));
          } catch (err) {
            console.error('Server analyze-crop error:', err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Image analysis error' }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), geminiBackendPlugin()],
  server: {
    port: 5173,
    host: true,
  },
});
