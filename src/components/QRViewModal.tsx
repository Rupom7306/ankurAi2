import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Download, QrCode } from 'lucide-react';
import { CropBatch } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface QRViewModalProps {
  batch: CropBatch | null;
  onClose: () => void;
}

export const QRViewModal: React.FC<QRViewModalProps> = ({ batch, onClose }) => {
  const { t } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  if (!batch) return null;

  // Encode structured payload for scanner
  const qrPayload = JSON.stringify({
    batchId: batch.id,
    sectionKey: batch.sectionKey,
    name: batch.name,
    crop: batch.cropType,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = () => {
    const svgElement = document.getElementById(`batch-qr-svg-${batch.id}`) as SVGSVGElement | null;
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 20, 20, 360, 360);
        const png = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `QR-${batch.sectionKey}-${batch.name.replace(/\s+/g, '_')}.png`;
        downloadLink.href = png;
        downloadLink.click();
      }
    };
    image.src = blobURL;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Printable CSS media query injected */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-batch-label, #print-batch-label * {
            visibility: visible;
          }
          #print-batch-label {
            position: absolute;
            left: 0;
            top: 0;
            width: 100mm;
            padding: 10mm;
            color: #000000 !important;
            background: #ffffff !important;
            border: 1px solid #000000 !important;
          }
        }
      `}</style>

      <div 
        className="relative w-full max-w-md rounded-2xl border border-border-green bg-card-elevated p-6 sm:p-7 shadow-card-soft text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="interactive absolute top-4 right-4 p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-card transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center justify-center gap-2.5 mb-5 text-text-primary">
          <QrCode className="w-6 h-6 text-accent" />
          <h3 className="text-lg font-bold font-bengali">{t('qr_view_title')}</h3>
        </div>

        {/* Printable Label Area */}
        <div 
          id="print-batch-label"
          ref={printRef}
          className="p-6 rounded-2xl bg-white text-black border-2 border-border-green space-y-3.5 mx-auto max-w-xs shadow-card-soft"
        >
          <div className="border-b border-gray-300 pb-2">
            <h4 className="font-extrabold text-base leading-tight">অঙ্কুর AI</h4>
            <p className="text-xs text-gray-600">Smart Crop Batch ID</p>
          </div>

          {/* SVG QR Code */}
          <div className="flex justify-center py-2">
            <QRCodeSVG
              id={`batch-qr-svg-${batch.id}`}
              value={qrPayload}
              size={180}
              level="M"
              includeMargin={true}
            />
          </div>

          <div className="space-y-1 text-left text-xs border-t border-gray-300 pt-2 font-mono">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Batch:</span>
              <span className="font-bold">{batch.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Crop:</span>
              <span>{batch.cropType}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-gray-600">Section:</span>
              <span className="font-bold text-accent-hover">{batch.sectionKey}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6">
          <button
            onClick={handlePrint}
            className="interactive btn-secondary flex-1 h-12 text-sm sm:text-base font-semibold"
          >
            <Printer className="w-4 h-4" />
            <span>{t('btn_print_label')}</span>
          </button>

          <button
            onClick={handleDownloadPNG}
            className="btn-primary flex-1 h-12 text-sm sm:text-base font-semibold"
          >
            <Download className="w-4 h-4" />
            <span>{t('btn_download_png')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
