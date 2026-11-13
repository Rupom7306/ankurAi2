import React, { useRef, useState } from 'react';
import { 
  Camera, 
  UploadCloud, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Zap, 
  Leaf, 
  FileCheck 
} from 'lucide-react';

interface DiagnosticResult {
  diseaseName: string;
  bengaliName: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  nutrientStatus: string;
  recommendation: string;
}

export const ImageCaptureHero: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ name: string; size: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DiagnosticResult | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setImageMeta({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    });
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSimulateDiagnosis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        diseaseName: 'Early Blight (Alternaria solani)',
        bengaliName: 'আগেভাগে ধ্বসা রোগ',
        confidence: 94.2,
        severity: 'Medium',
        nutrientStatus: 'Mild Nitrogen (N) deficiency detected in chlorotic leaf margins',
        recommendation: 'Apply copper hydroxide spray within 48h; avoid overhead sprinkler irrigation to lower foliage dampness.',
      });
    }, 1800);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setImageMeta(null);
    setAnalysisResult(null);
  };

  return (
    <div className="relative rounded-3xl p-6 sm:p-10 card-glass-glow border border-parrot-500/40 shadow-glow-md overflow-hidden">
      {/* Background radial glow accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-parrot-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-parrot-500/15 border border-parrot-500/30 text-parrot-400 text-xs font-bold mb-4 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-parrot-400 animate-pulse" />
          <span>Gemini Vision AI Diagnostic Hub</span>
        </div>

        {/* Big Central Title */}
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Instant Crop Health & Pest Diagnosis <br className="hidden sm:inline" />
          <span className="text-gradient-parrot font-bengali">তাত্ক্ষণিক শস্য ও পাতা পরীক্ষা</span>
        </h2>

        <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Take a live leaf photo or upload an image to detect fungal blights, bacterial spots, 
          pest infestations, and mineral starvation within seconds.
        </p>

        {/* NOTICEABLE BIG BUTTONS IN MIDDLE */}
        {!selectedImage ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
            {/* Big Button 1: Capture Crop Image */}
            <button
              onClick={handleTriggerCamera}
              className="group relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-parrot-400 via-parrot-500 to-parrot-600 text-dark-950 font-bold shadow-glow-md hover:shadow-glow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] border border-parrot-300"
            >
              <div className="p-3.5 rounded-2xl bg-dark-950/20 text-dark-950 mb-3 group-hover:scale-110 transition-transform">
                <Camera className="w-9 h-9 stroke-[2.2]" />
              </div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight">
                Capture Crop Image
              </span>
              <span className="text-xs font-bengali font-bold opacity-90 mt-0.5">
                ক্যামেরা দিয়ে ছবি তুলুন
              </span>
              <span className="text-[11px] font-medium opacity-80 mt-2">
                Use device camera directly
              </span>
            </button>

            {/* Big Button 2: Upload Image */}
            <button
              onClick={handleTriggerUpload}
              className="group relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-dark-900/90 hover:bg-dark-850 text-white font-bold border-2 border-parrot-500/50 hover:border-parrot-400 shadow-inner-glow hover:shadow-glow-sm transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]"
            >
              <div className="p-3.5 rounded-2xl bg-dark-800 text-parrot-400 mb-3 group-hover:scale-110 transition-transform border border-parrot-500/30">
                <UploadCloud className="w-9 h-9 stroke-[2.2]" />
              </div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white group-hover:text-parrot-300 transition-colors">
                Upload Image
              </span>
              <span className="text-xs font-bengali font-medium text-parrot-400 mt-0.5">
                ছবি বা গ্যালারি থেকে নির্বাচন
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-2">
                Supports JPG, PNG, WEBP files
              </span>
            </button>
          </div>
        ) : (
          /* Image Selected / Preview State */
          <div className="mt-8 max-w-xl mx-auto p-5 sm:p-6 rounded-2xl bg-dark-900/90 border border-parrot-500/40 shadow-glow-sm text-left animate-fadeIn">
            <div className="flex flex-col sm:flex-row gap-5 items-center">
              {/* Image Thumbnail with simulated scan beam */}
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-xl overflow-hidden border-2 border-parrot-500 shrink-0 shadow-md">
                <img
                  src={selectedImage}
                  alt="Selected crop leaf"
                  className="w-full h-full object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-parrot-500/20 flex flex-col items-center justify-center">
                    <div className="w-full h-1 bg-parrot-400 shadow-glow-md animate-bounce" />
                    <span className="text-[11px] font-mono font-bold text-white bg-dark-950/80 px-2 py-0.5 rounded mt-2">
                      Scanning leaf tissue...
                    </span>
                  </div>
                )}
              </div>

              {/* File details & action triggers */}
              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-parrot-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" /> Ready for Diagnosis
                  </span>
                  <button
                    onClick={handleClearImage}
                    className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    Change Photo
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white truncate">{imageMeta?.name}</h4>
                  <p className="text-xs text-slate-400">File size: {imageMeta?.size}</p>
                </div>

                {!analysisResult && (
                  <button
                    onClick={handleSimulateDiagnosis}
                    disabled={isAnalyzing}
                    className="w-full py-3 px-4 rounded-xl font-extrabold text-sm bg-parrot-500 hover:bg-parrot-400 text-dark-950 shadow-glow-sm hover:shadow-glow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Gemini Vision Diagnosing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Run Gemini AI Diagnosis</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* AI Diagnosis Result Card */}
            {analysisResult && (
              <div className="mt-5 pt-5 border-t border-dark-800 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-rose-500/20 text-rose-400">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                    <div>
                      <h5 className="text-sm font-bold text-white">
                        {analysisResult.diseaseName}
                      </h5>
                      <span className="text-xs font-bengali text-rose-400 font-semibold">
                        {analysisResult.bengaliName}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-parrot-400 block">
                      {analysisResult.confidence}% Confidence
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {analysisResult.severity} Severity
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-dark-950/80 border border-dark-800 text-xs space-y-1.5">
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <Leaf className="w-3.5 h-3.5 text-parrot-400 shrink-0 mt-0.5" />
                    <span><strong>Nutrient Correlation:</strong> {analysisResult.nutrientStatus}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-300">
                    <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <span><strong>Actionable Remedy:</strong> {analysisResult.recommendation}</span>
                  </div>
                </div>

                <button
                  onClick={handleClearImage}
                  className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white bg-dark-800 hover:bg-dark-750 rounded-xl transition-all"
                >
                  Diagnose Another Plant
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
