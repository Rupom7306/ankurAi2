import React, { useRef, useState, useEffect } from 'react';
import { 
  Camera, 
  UploadCloud, 
  Sparkles, 
  RefreshCw, 
  X, 
  AlertTriangle, 
  CheckCircle, 
  Leaf, 
  RotateCcw
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

  // Live Camera Viewfinder State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file picker upload
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

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Live Camera WebRTC trigger (requests browser camera access)
  const handleStartCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      console.error('Camera permission or device error:', err);
      const errorMessage =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser.'
          : 'Unable to access camera device. Please connect a camera or upload a photo.';
      setCameraError(errorMessage);
    }
  };

  // Capture frame from live camera
  const handleSnapPhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setSelectedImage(dataUrl);
        setImageMeta({
          name: `camera-capture-${Date.now().toString().slice(-4)}.jpg`,
          size: 'Live Camera Capture',
        });
      }
    }
    handleStopCamera();
  };

  // Stop camera media stream
  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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
        recommendation: 'Apply copper hydroxide spray within 48h; avoid overhead sprinkler irrigation.',
      });
    }, 1500);
  };

  const handleClear = () => {
    setSelectedImage(null);
    setImageMeta(null);
    setAnalysisResult(null);
  };

  return (
    <div className="w-full">
      {/* Hidden file input for Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* LIVE CAMERA MODAL (When Camera is Active) */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/90 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-3xl bg-dark-900 border border-parrot-500/40 p-4 sm:p-6 shadow-glow-md">
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-parrot-400" />
                Live Camera
              </span>
              <button
                onClick={handleStopCamera}
                className="p-1.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-6 text-center space-y-4">
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                <p className="text-sm text-slate-300">{cameraError}</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleStartCamera}
                    className="px-4 py-2 rounded-xl bg-dark-800 text-xs text-white hover:bg-dark-750"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      handleStopCamera();
                      handleTriggerUpload();
                    }}
                    className="px-4 py-2 rounded-xl bg-parrot-500 text-dark-950 font-bold text-xs"
                  >
                    Upload from Files
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Live Video Feed */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-dark-800">
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Viewfinder crosshairs */}
                  <div className="absolute inset-8 border border-parrot-400/30 rounded-xl pointer-events-none flex items-center justify-center">
                    <div className="w-8 h-8 border-t-2 border-l-2 border-parrot-400 absolute top-0 left-0"></div>
                    <div className="w-8 h-8 border-t-2 border-r-2 border-parrot-400 absolute top-0 right-0"></div>
                    <div className="w-8 h-8 border-b-2 border-l-2 border-parrot-400 absolute bottom-0 left-0"></div>
                    <div className="w-8 h-8 border-b-2 border-r-2 border-parrot-400 absolute bottom-0 right-0"></div>
                  </div>
                </div>

                {/* Shutter Button */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleSnapPhoto}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-parrot-500 hover:bg-parrot-400 text-dark-950 font-extrabold shadow-glow-md hover:scale-105 transition-all"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Snap Photo</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOTTED ROUNDED-CORNER RECTANGLE CONTAINER */}
      {!selectedImage ? (
        <div className="w-full max-w-2xl mx-auto my-6 p-6 sm:p-10 rounded-3xl border-2 border-dashed border-parrot-500/30 hover:border-parrot-500/60 bg-dark-900/30 backdrop-blur-sm transition-all duration-300 flex flex-col items-center justify-center">
          
          {/* TWO LARGE SQUARE BUTTONS GROUPED TOGETHER */}
          <div className="grid grid-cols-2 gap-4 sm:gap-8 w-full max-w-md">
            
            {/* Square Button 1: Camera */}
            <button
              onClick={handleStartCamera}
              className="aspect-square flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-parrot-400 via-parrot-500 to-parrot-600 text-dark-950 shadow-glow-sm hover:shadow-glow-md hover:scale-105 active:scale-95 transition-all duration-200 p-4 sm:p-6 group cursor-pointer border border-parrot-300"
            >
              <div className="p-3 sm:p-4 rounded-2xl bg-dark-950/15 mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
                <Camera className="w-10 h-10 sm:w-14 sm:h-14 stroke-[2.2]" />
              </div>
              <span className="text-base sm:text-xl font-extrabold tracking-tight">Camera</span>
              <span className="text-[11px] sm:text-xs font-semibold opacity-90 mt-0.5">Capture</span>
            </button>

            {/* Square Button 2: Upload */}
            <button
              onClick={handleTriggerUpload}
              className="aspect-square flex flex-col items-center justify-center rounded-2xl bg-dark-900/90 hover:bg-dark-850 text-white border-2 border-parrot-500/40 hover:border-parrot-400 shadow-inner-glow hover:shadow-glow-sm hover:scale-105 active:scale-95 transition-all duration-200 p-4 sm:p-6 group cursor-pointer"
            >
              <div className="p-3 sm:p-4 rounded-2xl bg-dark-800 text-parrot-400 mb-2 sm:mb-3 group-hover:scale-110 transition-transform border border-parrot-500/20">
                <UploadCloud className="w-10 h-10 sm:w-14 sm:h-14 stroke-[2.2]" />
              </div>
              <span className="text-base sm:text-xl font-extrabold tracking-tight group-hover:text-parrot-300 transition-colors">Upload</span>
              <span className="text-[11px] sm:text-xs font-medium text-slate-400 mt-0.5">Select Image</span>
            </button>

          </div>
        </div>
      ) : (
        /* Image Preview & Diagnosis Card inside clean container */
        <div className="max-w-xl mx-auto p-5 sm:p-6 rounded-3xl bg-dark-900 border border-parrot-500/40 shadow-glow-sm animate-fadeIn my-6">
          <div className="flex gap-4 items-center">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-parrot-500/50 shrink-0 bg-black">
              <img
                src={selectedImage}
                alt="Selected crop"
                className="w-full h-full object-cover"
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-parrot-500/20 flex items-center justify-center">
                  <div className="w-full h-1 bg-parrot-400 animate-pulse" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2.5">
              <div>
                <h4 className="text-sm font-bold text-white truncate">{imageMeta?.name}</h4>
                <p className="text-xs text-slate-400">{imageMeta?.size}</p>
              </div>

              {!analysisResult && (
                <button
                  onClick={handleSimulateDiagnosis}
                  disabled={isAnalyzing}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-parrot-500 hover:bg-parrot-400 text-dark-950 shadow-glow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Diagnosing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Run AI Diagnosis</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Choose Another Photo</span>
              </button>
            </div>
          </div>

          {/* Diagnosis Results */}
          {analysisResult && (
            <div className="mt-4 pt-4 border-t border-dark-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-bold text-white">{analysisResult.diseaseName}</h5>
                  <p className="text-xs font-bengali text-rose-400 font-semibold">{analysisResult.bengaliName}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-parrot-400 block">{analysisResult.confidence}%</span>
                  <span className="text-[10px] uppercase font-bold text-rose-400">{analysisResult.severity}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-dark-950 border border-dark-800 text-xs space-y-1 text-slate-300">
                <div className="flex items-start gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-parrot-400 shrink-0 mt-0.5" />
                  <span>{analysisResult.nutrientStatus}</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{analysisResult.recommendation}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
