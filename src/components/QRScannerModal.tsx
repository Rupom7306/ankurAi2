import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, QrCode, AlertCircle, Upload } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const { t } = useLanguage();
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const readerId = 'html5qr-code-reader';

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setScannerError(null);

    const startScanner = async () => {
      try {
        const qrScanner = new Html5Qrcode(readerId);
        scannerRef.current = qrScanner;

        const config = {
          fps: 12,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        };

        await qrScanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (isMounted) {
              onScanSuccess(decodedText.trim());
              handleCleanClose();
            }
          },
          () => {
            // Frame scanning error, silent
          }
        );

        if (isMounted) {
          setIsScanning(true);
        }
      } catch (err: unknown) {
        console.warn('QR camera scan error:', err);
        if (isMounted) {
          setIsScanning(false);
          const isPermissionDenied = err instanceof Error && err.name === 'NotAllowedError';
          setScannerError(
            isPermissionDenied
              ? t('scan_cam_perm_error')
              : t('scan_cam_device_error')
          );
        }
      }
    };

    // Small delay to ensure DOM element is mounted
    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [isOpen]);

  const handleCleanClose = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current
        .stop()
        .catch(console.error)
        .finally(() => {
          setIsScanning(false);
          onClose();
        });
    } else {
      setIsScanning(false);
      onClose();
    }
  };

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(readerId);
      }
      const result = await scannerRef.current.scanFile(file, true);
      onScanSuccess(result.trim());
      handleCleanClose();
    } catch (err) {
      console.error('Failed to parse QR from file:', err);
      setScannerError(t('scan_cam_device_error'));
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScanSuccess(manualInput.trim());
      handleCleanClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-md rounded-2xl border border-border-green bg-card-elevated p-6 sm:p-7 shadow-card-soft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border-green mb-4">
          <div className="flex items-center gap-2.5 text-text-primary">
            <QrCode className="w-5 h-5 text-accent" />
            <span className="text-base font-bold font-bengali">
              {t('qr_modal_title')}
            </span>
            {isScanning && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/15 text-accent border border-border-green font-bold">
                {t('qr_active_status')}
              </span>
            )}
          </div>
          <button
            onClick={handleCleanClose}
            className="interactive p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-card transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Scanner Container */}
        <div className="space-y-4">
          <div 
            id={readerId} 
            className="relative w-full aspect-square max-w-[280px] mx-auto rounded-xl overflow-hidden bg-black border border-border-green shadow-inner"
          />

          {scannerError && (
            <div className="p-3.5 rounded-xl border border-alert-warning/30 bg-alert-warning/10 text-alert-warning text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{scannerError}</span>
            </div>
          )}

          {/* Alternative options: Upload QR Image or Enter Code */}
          <div className="pt-3 border-t border-border-green space-y-3">
            <div className="flex items-center justify-between gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileScan}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="interactive btn-secondary flex-1 h-11 text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{t('qr_upload_image')}</span>
              </button>
            </div>

            {/* Manual keyword / ID fallback */}
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder={t('qr_code_placeholder')}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-border-green bg-card text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-accent outline-none"
              />
              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="btn-primary h-11 px-5 text-sm font-semibold"
              >
                {t('qr_search_btn')}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
