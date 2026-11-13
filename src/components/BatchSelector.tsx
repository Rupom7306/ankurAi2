import React, { useState, useEffect } from 'react';
import { QrCode, Sprout, Check, Plus, RotateCcw, ArrowRight } from 'lucide-react';
import { CropBatch } from '../types';
import { subscribeUserBatches } from '../services/cropBatchService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { QRScannerModal } from './QRScannerModal';

interface BatchSelectorProps {
  selectedImage: string;
  onImageCleared: () => void;
  onBatchSelected: (batch: CropBatch) => void;
  onOpenCreateBatch: () => void;
  onRequireLogin: () => void;
}

export const BatchSelector: React.FC<BatchSelectorProps> = ({
  selectedImage,
  onImageCleared,
  onBatchSelected,
  onOpenCreateBatch,
  onRequireLogin,
}) => {
  const { currentUser } = useAuth();
  const { t, formatNumber } = useLanguage();
  const [batches, setBatches] = useState<CropBatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [qrScanMessage, setQrScanMessage] = useState<string | null>(null);

  // Subscribe to real user batches in Firestore
  useEffect(() => {
    if (!currentUser) {
      setBatches([]);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeUserBatches(
      currentUser.uid,
      (userBatches) => {
        setBatches(userBatches);
        setIsLoading(false);
      },
      (error) => {
        console.error('Failed to load batches:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Handle QR code match
  const handleQRScanSuccess = (decodedText: string) => {
    let targetKey = decodedText.trim();
    let targetBatchId = '';

    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.batchId) targetBatchId = parsed.batchId;
      if (parsed.sectionKey) targetKey = parsed.sectionKey;
    } catch {
      // Plain text code
    }

    const matched = batches.find(
      (b) =>
        (targetBatchId && b.id === targetBatchId) ||
        b.id.toLowerCase() === targetKey.toLowerCase() ||
        b.sectionKey.toLowerCase() === targetKey.toLowerCase() ||
        (b.qrCodeUrl && b.qrCodeUrl.toLowerCase() === targetKey.toLowerCase())
    );

    if (matched) {
      setSelectedBatchId(matched.id);
      setQrScanMessage(`${t('qr_matched_msg')} ${matched.name} (${matched.sectionKey})`);
      onBatchSelected(matched);
    } else {
      setQrScanMessage(`${t('qr_unmatched_msg')} "${decodedText}"`);
    }
  };

  const currentSelectedBatch = batches.find((b) => b.id === selectedBatchId);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Image Preview Strip */}
      <div className="rounded-2xl border border-border-green bg-card p-5 sm:p-6 flex items-center justify-between gap-4 shadow-card-soft">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-border-green bg-black shrink-0">
            <img
              src={selectedImage}
              alt="Crop preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-sm font-semibold text-accent uppercase tracking-wider block">
              {t('photo_added_title')}
            </span>
            <h4 className="text-base sm:text-lg font-bold text-text-primary mt-1">
              {t('photo_added_desc')}
            </h4>
          </div>
        </div>

        <button
          onClick={onImageCleared}
          className="interactive btn-secondary h-11 px-4 text-sm shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t('btn_change_photo')}</span>
        </button>
      </div>

      {/* If Not Logged In -> Prompt Login First */}
      {!currentUser ? (
        <div className="rounded-2xl border border-border-green bg-card p-8 sm:p-10 text-center space-y-5 shadow-card-soft">
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-border-green flex items-center justify-center text-accent mx-auto shadow-glow-sm">
            <Sprout className="w-8 h-8 stroke-[2]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold font-bengali text-text-primary">
              {t('login_prompt_title')}
            </h3>
            <p className="text-base text-text-secondary max-w-md mx-auto leading-relaxed">
              {t('login_prompt_desc')}
            </p>
          </div>

          <div className="pt-3">
            <button
              onClick={onRequireLogin}
              className="btn-primary w-full sm:w-auto min-w-[240px]"
            >
              {t('btn_login_to_continue')}
            </button>
          </div>
        </div>
      ) : (
        /* Logged In Flow: Ask "Which crop batch is this?" */
        <div className="rounded-2xl border border-border-green bg-card p-6 sm:p-8 space-y-6 shadow-card-soft">
          {/* Section Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-green">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-bengali text-text-primary">
                {t('which_batch_title')}
              </h3>
              <p className="text-sm sm:text-base text-text-secondary mt-1">
                {t('which_batch_sub')}
              </p>
            </div>

            {/* Scan QR Button */}
            <button
              onClick={() => setIsQRScannerOpen(true)}
              className="interactive btn-secondary h-12 px-5 text-sm sm:text-base"
            >
              <QrCode className="w-5 h-5 text-accent" />
              <span>{t('btn_scan_qr')}</span>
            </button>
          </div>

          {/* QR Scan feedback alert if triggered */}
          {qrScanMessage && (
            <div className="p-4 rounded-xl border border-border-green bg-card-elevated text-sm sm:text-base text-text-primary flex items-start gap-3">
              <Sprout className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <span>{qrScanMessage}</span>
            </div>
          )}

          {/* Option B: Choose from Saved Batches */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
                {t('saved_batches_title')} ({formatNumber(batches.length)})
              </span>
              <button
                onClick={onOpenCreateBatch}
                className="interactive flex items-center gap-1.5 text-sm sm:text-base text-accent hover:text-accent-hover font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('btn_new_batch')}</span>
              </button>
            </div>

            {isLoading ? (
              <div className="py-10 text-center text-sm sm:text-base text-text-secondary">
                {t('auth_submitting')}
              </div>
            ) : batches.length === 0 ? (
              /* Empty state if user has no batches yet */
              <div className="py-10 px-6 rounded-xl border border-dashed border-border-green bg-card-elevated text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-border-green flex items-center justify-center text-accent mx-auto">
                  <Sprout className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold font-bengali text-text-primary">
                    {t('empty_batches_title')}
                  </h4>
                  <p className="text-sm sm:text-base text-text-secondary mt-1">
                    {t('empty_batches_desc')}
                  </p>
                </div>
                <button
                  onClick={onOpenCreateBatch}
                  className="btn-primary"
                >
                  <Plus className="w-5 h-5" />
                  <span>{t('btn_create_first_batch')}</span>
                </button>
              </div>
            ) : (
              /* List of Real User Batches */
              <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto pr-1">
                {batches.map((batch) => {
                  const isSelected = selectedBatchId === batch.id;
                  return (
                    <button
                      key={batch.id}
                      type="button"
                      onClick={() => {
                        setSelectedBatchId(batch.id);
                        onBatchSelected(batch);
                      }}
                      className={`interactive w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-accent bg-card-elevated shadow-glow-sm ring-1 ring-accent'
                          : 'border-border-green bg-card hover:bg-card-elevated hover:border-accent/40'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base sm:text-lg text-text-primary font-bengali">
                            {batch.name}
                          </h4>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-bg text-accent border border-border-green">
                            {batch.sectionKey}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary">
                          {batch.cropType} {batch.variety ? `• ${batch.variety}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-card border border-border-green text-text-secondary">
                          {t('profile_status_offline')}
                        </span>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-accent text-text-on-accent'
                              : 'border border-border-green text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Continue button if batch selected */}
          {currentSelectedBatch && (
            <div className="pt-4 border-t border-border-green flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
              <div className="text-sm sm:text-base text-text-secondary">
                <span>{t('selected_batch_label')} </span>
                <strong className="text-accent font-semibold">{currentSelectedBatch.name}</strong>
              </div>

              <button
                onClick={() => onBatchSelected(currentSelectedBatch)}
                className="btn-primary w-full sm:w-auto"
              >
                <span>{t('btn_continue_to_sensor')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScanSuccess={handleQRScanSuccess}
      />
    </div>
  );
};
