import React, { useState, useEffect } from 'react';
import { X, Sprout, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { updateCropBatch } from '../services/cropBatchService';
import { CropBatch } from '../types';
import { BANGLADESH_CROPS } from './CreateBatchModal';

interface EditBatchModalProps {
  batch: CropBatch | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditBatchModal: React.FC<EditBatchModalProps> = ({
  batch,
  isOpen,
  onClose,
}) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [plantingDate, setPlantingDate] = useState('');
  const [cropType, setCropType] = useState('');
  const [variety, setVariety] = useState('');
  const [sectionKey, setSectionKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (batch) {
      setName(batch.name);
      setPlantingDate(batch.plantingDate);
      setCropType(batch.cropType);
      setVariety(batch.variety || '');
      setSectionKey(batch.sectionKey);
      setError(null);
    }
  }, [batch]);

  if (!isOpen || !batch) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError(null);

    if (!name.trim()) {
      setError(t('field_batch_name'));
      return;
    }

    if (!sectionKey.trim()) {
      setError(t('field_section_key'));
      return;
    }

    setIsSubmitting(true);
    try {
      await updateCropBatch(currentUser.uid, batch.id, {
        name: name.trim(),
        cropType,
        variety: variety.trim(),
        plantingDate,
        sectionKey: sectionKey.trim().toLowerCase(),
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: unknown) {
      console.error('Failed to update batch:', err);
      const msg = err instanceof Error ? err.message : t('auth_submitting');
      setError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-xl rounded-2xl border border-border-green bg-card-elevated p-6 sm:p-8 shadow-card-soft max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="interactive absolute top-4 right-4 p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-card transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-border-green bg-accent/10 text-accent shadow-glow-sm">
            <Sprout className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-bengali text-text-primary">
              {t('modal_edit_batch_title')}
            </h3>
            <p className="text-sm sm:text-base text-text-secondary mt-0.5">
              {t('modal_edit_batch_sub')}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl border border-alert-warning/30 bg-alert-warning/10 text-alert-warning text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1.5">
              {t('field_batch_name')} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border-green bg-card text-base text-text-primary focus:border-accent outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t('field_crop_type')} *
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-green bg-card text-base text-text-primary focus:border-accent outline-none transition-colors"
              >
                {BANGLADESH_CROPS.map((c) => (
                  <option key={c} value={c} className="bg-card text-text-primary">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t('field_variety')}
              </label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-green bg-card text-base text-text-primary focus:border-accent outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t('field_planting_date')} *
              </label>
              <input
                type="date"
                required
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-green bg-card text-base text-text-primary focus:border-accent outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-primary mb-1.5">
                {t('field_section_key')} *
              </label>
              <input
                type="text"
                required
                value={sectionKey}
                onChange={(e) => setSectionKey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border-green bg-card text-base text-text-primary focus:border-accent outline-none transition-colors font-mono"
              />
              <span className="text-xs text-text-secondary mt-1 block">
                {t('field_section_key_hint')}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>{t('btn_submitting_batch')}</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>{t('btn_submit_edit_batch')}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
