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
  QrCode, 
  Plus, 
  RotateCcw,
  Check
} from 'lucide-react';

interface PhotoItem {
  id: string;
  dataUrl: string;
  name: string;
  size: string;
}

interface LinkedBatchQR {
  batchId: string;
  batchName: string;
  qrCode: string;
}

interface DiagnosticResult {
  diseaseName: string;
  bengaliName: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  nutrientStatus: string;
  recommendation: string;
  batchContext: string;
}

export const ImageCaptureHero: React.FC = () => {
  // Photos collection
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  // Linked Batch QR code
  const [linkedBatch, setLinkedBatch] = useState<LinkedBatchQR | null>(null);
  // Manual QR input
  const [manualQrInput, setManualQrInput] = useState('');
  
  // UI states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraMode, setCameraMode] = useState<'plant' | 'qr'>('plant');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showAddMoreModal, setShowAddMoreModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DiagnosticResult | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null);

  // Pre-configured registered batches for quick instant linking
  const availableBatches: LinkedBatchQR[] = [
    { batchId: 'batch-c47a98', batchName: 'Paddy Block A (BRRI Dhan-28)', qrCode: 'BATCH-C47A98' },
    { batchId: 'batch-f81b22', batchName: 'Wheat Field South (BARI Gom-33)', qrCode: 'BATCH-F81B22' },
    { batchId: 'batch-d12e55', batchName: 'Mustard Plot Alpha (Tori-7)', qrCode: 'BATCH-D12E55' },
  ];

  // Handle plant photo file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newPhoto: PhotoItem = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          dataUrl: reader.result as string,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        };
        setPhotos((prev) => [...prev, newPhoto]);
        setShowAddMoreModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle QR code image file upload
  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate reading QR code from uploaded image
      const randomBatch = availableBatches[0];
      setLinkedBatch({
        batchId: randomBatch.batchId,
        batchName: randomBatch.batchName,
        qrCode: randomBatch.qrCode,
      });
    }
  };

  // Start live device camera (WebRTC)
  const handleStartCamera = async (mode: 'plant' | 'qr') => {
    setCameraMode(mode);
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
          : 'Unable to access camera device. Please connect a camera or upload from files.';
      setCameraError(errorMessage);
    }
  };

  // Snap photo from live camera
  const handleSnapCamera = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

        if (cameraMode === 'plant') {
          const newPhoto: PhotoItem = {
            id: `photo-${Date.now()}`,
            dataUrl,
            name: `camera-${photos.length + 1}.jpg`,
            size: 'Camera Capture',
          };
          setPhotos((prev) => [...prev, newPhoto]);
          setShowAddMoreModal(false);
        } else {
          // In QR mode, simulate scanned QR code
          const batch = availableBatches[1];
          setLinkedBatch(batch);
        }
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

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Remove individual photo
  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Link batch manually
  const handleManualQrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQrInput.trim()) return;
    const found = availableBatches.find(
      (b) => b.qrCode.toLowerCase() === manualQrInput.trim().toLowerCase()
    );
    if (found) {
      setLinkedBatch(found);
    } else {
      setLinkedBatch({
        batchId: `batch-custom-${Date.now()}`,
        batchName: `Batch (${manualQrInput.toUpperCase()})`,
        qrCode: manualQrInput.toUpperCase(),
      });
    }
    setManualQrInput('');
  };

  // Trigger Gemini AI Diagnosis
  const handleSimulateDiagnosis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisResult({
        diseaseName: 'Early Blight (Alternaria solani)',
        bengaliName: 'আগেভাগে ধ্বসা রোগ',
        confidence: 94.6,
        severity: 'Medium',
        nutrientStatus: 'Nitrogen levels low; leaf chlorosis visible along margin veins',
        recommendation: 'Spray copper-based fungicide; increase row spacing to reduce foliage humidity.',
        batchContext: linkedBatch?.batchName || 'General Crop Plot',
      });
    }, 1600);
  };

  // Reset entire flow
  const handleResetAll = () => {
    setPhotos([]);
    setLinkedBatch(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setShowAddMoreModal(false);
  };

  return (
    <div className="w-full">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={qrFileInputRef}
        accept="image/*"
        onChange={handleQrFileChange}
        className="hidden"
      />

      {/* LIVE CAMERA MODAL (Plant photo or QR scanner) */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/90 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-dark-900 border border-parrot-500/40 p-4 sm:p-6 shadow-glow-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                {cameraMode === 'plant' ? (
                  <>
                    <Camera className="w-4 h-4 text-parrot-400" />
                    <span>Capture Plant Photo</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 text-parrot-400" />
                    <span>Scan Batch QR Code</span>
                  </>
                )}
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
                    onClick={() => handleStartCamera(cameraMode)}
                    className="px-4 py-2 rounded-xl bg-dark-800 text-xs text-white"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => {
                      handleStopCamera();
                      if (cameraMode === 'plant') fileInputRef.current?.click();
                      else qrFileInputRef.current?.click();
                    }}
                    className="px-4 py-2 rounded-xl bg-parrot-500 text-dark-950 font-bold text-xs"
                  >
                    Upload File Instead
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-dark-800">
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Visual framing box */}
                  <div className="absolute inset-8 border border-parrot-400/40 rounded-xl pointer-events-none flex items-center justify-center">
                    {cameraMode === 'qr' && (
                      <div className="w-40 h-40 border-2 border-parrot-400 rounded-lg animate-pulse flex items-center justify-center">
                        <QrCode className="w-12 h-12 text-parrot-400/60" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleSnapCamera}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-parrot-500 hover:bg-parrot-400 text-dark-950 font-extrabold shadow-glow-md hover:scale-105 transition-all"
                  >
                    {cameraMode === 'plant' ? (
                      <>
                        <Camera className="w-5 h-5" />
                        <span>Snap Photo</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-5 h-5" />
                        <span>Read QR Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL TO ADD MORE PHOTOS */}
      {showAddMoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-dark-900 border border-dark-750 p-6 text-center space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white">Add Another Photo</h4>
              <button
                onClick={() => setShowAddMoreModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => {
                  setShowAddMoreModal(false);
                  handleStartCamera('plant');
                }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-dark-850 hover:bg-dark-800 border border-parrot-500/30 text-white font-bold gap-2 transition-all"
              >
                <Camera className="w-6 h-6 text-parrot-400" />
                <span className="text-xs">Take Photo</span>
              </button>

              <button
                onClick={() => {
                  setShowAddMoreModal(false);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                    fileInputRef.current.click();
                  }
                }}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-dark-850 hover:bg-dark-800 border border-dark-700 text-white font-bold gap-2 transition-all"
              >
                <UploadCloud className="w-6 h-6 text-parrot-400" />
                <span className="text-xs">Upload File</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STEP 1: INITIAL STATE (NO PHOTOS YET) - DOTTED ROUNDED RECTANGLE
         ========================================================================= */}
      {photos.length === 0 && (
        <div className="w-full max-w-2xl mx-auto my-6 p-6 sm:p-10 rounded-3xl border-2 border-dashed border-parrot-500/30 hover:border-parrot-500/60 bg-dark-900/30 backdrop-blur-sm transition-all duration-300 flex flex-col items-center justify-center">
          <div className="grid grid-cols-2 gap-4 sm:gap-8 w-full max-w-md">
            
            {/* Square Button 1: Camera */}
            <button
              onClick={() => handleStartCamera('plant')}
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
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                  fileInputRef.current.click();
                }
              }}
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
      )}

      {/* =========================================================================
          STEP 2: PHOTO ADDED, BUT NO QR CODE LINKED YET -> MUST ASK FOR QR CODE
         ========================================================================= */}
      {photos.length > 0 && !linkedBatch && !analysisResult && (
        <div className="max-w-xl mx-auto my-6 p-6 sm:p-8 rounded-3xl bg-dark-900 border border-parrot-500/50 shadow-glow-sm animate-fadeIn space-y-6">
          
          {/* Photo Thumbnail Header */}
          <div className="flex items-center justify-between pb-4 border-b border-dark-800">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-parrot-500/50 shrink-0">
                <img src={photos[0].dataUrl} alt="Captured plant" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xs text-parrot-400 font-bold uppercase tracking-wider block">Photo Added</span>
                <h4 className="text-sm font-bold text-white truncate max-w-[200px]">{photos[0].name}</h4>
              </div>
            </div>

            <button
              onClick={handleResetAll}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* MUST ASK FOR RESPECTIVE QR CODE */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-parrot-500/10 border border-parrot-500/30 flex items-center justify-center mx-auto mb-2 text-parrot-400">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white">Scan Batch QR Code</h3>
              <p className="text-xs text-slate-400 mt-1">
                Link this plant photo to its registered crop batch
              </p>
            </div>

            {/* QR Scan Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleStartCamera('qr')}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-parrot-500 hover:bg-parrot-400 text-dark-950 font-bold text-xs shadow-glow-sm transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Scan with Camera</span>
              </button>

              <button
                onClick={() => qrFileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-dark-850 hover:bg-dark-800 text-white font-bold text-xs border border-dark-700 hover:border-parrot-500/40 transition-all"
              >
                <UploadCloud className="w-4 h-4 text-parrot-400" />
                <span>Upload QR Image</span>
              </button>
            </div>

            {/* Quick-Select from Active Batches */}
            <div className="pt-3 border-t border-dark-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                Or Select Registered Batch
              </span>
              <div className="space-y-1.5">
                {availableBatches.map((b) => (
                  <button
                    key={b.batchId}
                    onClick={() => setLinkedBatch(b)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-dark-950 hover:bg-dark-850 border border-dark-800 hover:border-parrot-500/40 text-xs text-left transition-all group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <QrCode className="w-3.5 h-3.5 text-parrot-400 shrink-0" />
                      <span className="font-semibold text-slate-200 group-hover:text-parrot-300 truncate">
                        {b.batchName}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-900 text-parrot-400 border border-dark-700 shrink-0">
                      {b.qrCode}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual QR Input */}
            <form onSubmit={handleManualQrSubmit} className="flex gap-2 pt-2">
              <input
                type="text"
                value={manualQrInput}
                onChange={(e) => setManualQrInput(e.target.value)}
                placeholder="Enter QR Code ID (e.g. BATCH-C47A98)"
                className="flex-1 px-3 py-2 rounded-xl bg-dark-950 border border-dark-800 text-xs text-white placeholder-slate-500 focus:border-parrot-400 outline-none"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-parrot-400 text-xs font-bold border border-parrot-500/30"
              >
                Link
              </button>
            </form>
          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 3: QR CODE LINKED! -> EITHER SUBMIT ALONE OR ADD MORE PHOTOS
         ========================================================================= */}
      {photos.length > 0 && linkedBatch && !analysisResult && (
        <div className="max-w-xl mx-auto my-6 p-6 sm:p-8 rounded-3xl bg-dark-900 border border-parrot-500/50 shadow-glow-sm animate-fadeIn space-y-6">
          
          {/* Linked Batch Confirmation Badge */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-parrot-500/10 border border-parrot-500/30">
            <div className="flex items-center gap-2.5 truncate">
              <div className="p-1 rounded-lg bg-parrot-500/20 text-parrot-400">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div className="truncate">
                <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Linked Batch</div>
                <div className="text-xs font-bold text-white truncate">{linkedBatch.batchName}</div>
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-parrot-400 px-2 py-1 rounded-lg bg-dark-900 border border-dark-800 shrink-0">
              {linkedBatch.qrCode}
            </span>
          </div>

          {/* Photo Gallery (Preview of all captured/uploaded photos) */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300">
                Crop Photos ({photos.length})
              </span>
              <span>Ready for Diagnosis</span>
            </div>

            <div className="flex flex-wrap gap-3">
              {photos.map((p, idx) => (
                <div key={p.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-dark-750 group">
                  <img src={p.dataUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemovePhoto(p.id)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-dark-950/80 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-1 left-1 text-[9px] font-mono font-bold bg-dark-950/80 px-1 rounded text-parrot-400">
                    #{idx + 1}
                  </span>
                </div>
              ))}

              {/* Add More Photo Trigger Button */}
              <button
                onClick={() => setShowAddMoreModal(true)}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-dark-750 hover:border-parrot-500/60 bg-dark-950/50 hover:bg-dark-850 flex flex-col items-center justify-center text-slate-400 hover:text-parrot-400 transition-all cursor-pointer"
              >
                <Plus className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-bold">Add Photo</span>
              </button>
            </div>
          </div>

          {/* THE TWO EXPLICIT CHOICES: SUBMIT ALONE OR ADD MORE PHOTOS */}
          <div className="space-y-3 pt-3 border-t border-dark-800">
            {/* Action 1: SUBMIT (Submit the photo & QR alone or all photos together) */}
            <button
              onClick={handleSimulateDiagnosis}
              disabled={isAnalyzing}
              className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm bg-parrot-500 hover:bg-parrot-400 text-dark-950 shadow-glow-sm hover:shadow-glow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Diagnosing Crop with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    Submit {photos.length > 1 ? `(${photos.length} Photos)` : ''} with QR Code
                  </span>
                </>
              )}
            </button>

            {/* Action 2: CHOOSE TO ADD MORE PHOTOS */}
            <div className="flex items-center justify-between text-xs">
              <button
                onClick={() => setShowAddMoreModal(true)}
                className="flex items-center gap-1.5 text-slate-300 hover:text-parrot-300 font-semibold py-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-parrot-400" />
                <span>Add More Photos</span>
              </button>

              <button
                onClick={handleResetAll}
                className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 4: DIAGNOSIS RESULT (AFTER SUBMISSION)
         ========================================================================= */}
      {analysisResult && (
        <div className="max-w-xl mx-auto my-6 p-6 rounded-3xl bg-dark-900 border border-parrot-500/50 shadow-glow-sm animate-fadeIn space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-dark-800">
            <div>
              <span className="text-[10px] font-mono text-parrot-400 uppercase font-bold">Analysis Complete</span>
              <h4 className="text-base font-bold text-white">{analysisResult.diseaseName}</h4>
              <p className="text-xs font-bengali text-rose-400 font-semibold">{analysisResult.bengaliName}</p>
            </div>
            
            <div className="text-right">
              <span className="text-sm font-mono font-extrabold text-parrot-400 block">
                {analysisResult.confidence}%
              </span>
              <span className="text-[10px] uppercase font-bold text-rose-400 px-2 py-0.5 rounded bg-rose-500/15">
                {analysisResult.severity} Severity
              </span>
            </div>
          </div>

          {/* Evidence and Recommendation */}
          <div className="p-3.5 rounded-2xl bg-dark-950 border border-dark-800 text-xs space-y-2 text-slate-300">
            <div className="flex items-start gap-2">
              <Leaf className="w-4 h-4 text-parrot-400 shrink-0 mt-0.5" />
              <span><strong>Nutrient & Soil Telemetry:</strong> {analysisResult.nutrientStatus}</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Actionable Remedy:</strong> {analysisResult.recommendation}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Linked to: <strong className="text-white">{analysisResult.batchContext}</strong> ({photos.length} photo(s) submitted)
          </div>

          <button
            onClick={handleResetAll}
            className="w-full py-2.5 rounded-xl bg-dark-850 hover:bg-dark-800 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            Start New Inspection
          </button>
        </div>
      )}

    </div>
  );
};
