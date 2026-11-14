import React, { useRef, useState, useEffect } from 'react';
import { Camera, Upload, AlertCircle, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { optimizeImageFile } from '../lib/imageUtils';

interface ScanHeroProps {
  onImageSelected: (dataUrl: string, fileName?: string) => void;
}

export const ScanHero: React.FC<ScanHeroProps> = ({
  onImageSelected,
}) => {
  const { t } = useLanguage();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File processing with automated smartphone photo downscaling/compression
  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(t('scan_cam_device_error'));
      return;
    }
    try {
      const optimizedDataUrl = await optimizeImageFile(file);
      onImageSelected(optimizedDataUrl, file.name);
    } catch (err) {
      console.warn('Image optimization fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onImageSelected(reader.result, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Start device camera
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
      console.error('Camera error:', err);
      const isPermissionDenied = err instanceof Error && err.name === 'NotAllowedError';
      setCameraError(
        isPermissionDenied
          ? t('scan_cam_perm_error')
          : t('scan_cam_device_error')
      );
    }
  };

  // Stop device camera
  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  // Snap photo from live stream
  const handleSnapCamera = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onImageSelected(dataUrl, `crop-capture-${Date.now()}.jpg`);
      }
    }
    handleStopCamera();
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Live Camera Modal */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl border border-border-green bg-card-elevated p-6 sm:p-7 shadow-card-soft">
            <div className="flex items-center justify-between pb-3.5 border-b border-border-green mb-4">
              <span className="text-lg font-semibold text-text-primary flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-accent" />
                <span>{t('scan_cam_modal_title')}</span>
              </span>
              <button
                onClick={handleStopCamera}
                className="interactive p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-card transition-colors cursor-pointer"
                aria-label="Close camera"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-6 text-center space-y-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-alert-warning/15 text-alert-warning mx-auto border border-alert-warning/30">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <p className="text-base text-text-secondary leading-relaxed">{cameraError}</p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-3">
                  <button
                    onClick={handleStartCamera}
                    className="btn-secondary h-12 px-6"
                  >
                    {t('scan_cam_retry')}
                  </button>
                  <button
                    onClick={() => {
                      handleStopCamera();
                      fileInputRef.current?.click();
                    }}
                    className="btn-primary h-12 px-6"
                  >
                    {t('scan_cam_upload_instead')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="relative aspect-video sm:aspect-[4/3] w-full rounded-xl overflow-hidden bg-black border border-border-green">
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-4 sm:inset-6 border-2 border-accent/40 rounded-xl pointer-events-none" />
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleSnapCamera}
                    className="btn-primary w-full sm:w-auto min-w-[220px]"
                  >
                    <Camera className="w-5 h-5" />
                    <span>{t('scan_cam_snap')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Scan Area (Dashed green-tinted border, faint glow, camera icon in circle) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-full max-w-2xl mx-auto rounded-2xl border-2 border-dashed transition-all duration-300 p-8 sm:p-14 text-center ${
          isDragging
            ? 'border-accent bg-card shadow-glow scale-[1.01]'
            : 'border-border-green bg-card/90 shadow-card-soft hover:shadow-glow-sm hover:border-accent/40'
        }`}
      >
        {/* Large green camera icon inside soft green circle */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-accent/10 border border-border-green flex items-center justify-center text-accent mx-auto mb-6 shadow-glow-sm">
          <Camera className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.8]" />
        </div>

        {/* Heading + Subtitle according to selected language */}
        <div className="space-y-2 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold font-bengali text-text-primary tracking-tight">
            {t('scan_title')}
          </h2>
          <p className="text-base sm:text-lg text-text-secondary font-normal max-w-lg mx-auto leading-relaxed">
            {t('scan_subtitle')}
          </p>
        </div>

        {/* Two buttons side-by-side: Camera (primary filled) & Upload (secondary outlined), equal dimensions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={handleStartCamera}
            type="button"
            className="btn-primary w-full sm:w-1/2"
          >
            <Camera className="w-5 h-5" />
            <span>{t('scan_camera')}</span>
          </button>

          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
                fileInputRef.current.click();
              }
            }}
            type="button"
            className="btn-secondary w-full sm:w-1/2"
          >
            <Upload className="w-5 h-5" />
            <span>{t('scan_upload')}</span>
          </button>
        </div>

        {/* Drag & drop hint */}
        <p className="text-sm text-text-secondary mt-6 font-bengali">
          {t('scan_drag_drop_hint')}
        </p>
      </div>
    </div>
  );
};
