import React, { useState } from 'react';
import { X, Sprout, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { createCropBatch } from '../services/cropBatchService';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBatchCreated?: (batchId: string) => void;
}

export const BANGLADESH_CROPS = [
  'Boro Rice',
  'Aman Rice',
  'Aus Rice',
  'Wheat',
  'Maize',
  'Potato',
  'Tomato',
  'Jute',
  'Mustard',
  'Lentil',
  'Chili',
  'Onion',
];

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
  isOpen,
  onClose,
  onBatchCreated,
}) => {
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);
  const [cropType, setCropType] = useState(BANGLADESH_CROPS[0]);
  const [variety, setVariety] = useState('');
  const [sectionKey, setSectionKey] = useState('');
  const [sensors] = useState<string[]>(['N', 'P', 'K', 'humidity']);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      setError(t('login_prompt_title'));
      return;
    }

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
      const newId = await createCropBatch(currentUser.uid, {
        name: name.trim(),
        cropType,
        variety: variety.trim(),
        plantingDate,
        sectionKey: sectionKey.trim().toLowerCase(),
        sensors,
        sensorStatus: 'offline',
      });

      // Clear state and close modal promptly
      setName('');
      setVariety('');
      setSectionKey('');
      setIsSubmitting(false);

      if (onBatchCreated) {
        onBatchCreated(newId);
      }
      onClose();
    } catch (err: unknown) {
      console.error('Failed to create crop batch:', err);
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
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="interactive absolute top-4 right-4 p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-card transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-border-green bg-accent/10 text-accent shadow-glow-sm">
            <Sprout className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-bengali text-text-primary">
              {t('modal_create_batch_title')}
            </h3>
            <p className="text-sm sm:text-base text-text-secondary mt-0.5">
              {t('modal_create_batch_sub')}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl border border-alert-warning/30 bg-alert-warning/10 text-alert-warning text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Create Batch Form */}
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
              placeholder={t('field_batch_name_placeholder')}
              className="w-full px-4 py-3 rounded-xl border border-border-green bg-card text-base text-text-primary placeholder:text-text-secondary/50 focus:border-accent outline-none transition-colors"
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
                placeholder={t('field_variety_placeholder')}
                className="w-full px-4 py-3 rounded-xl border border-border-green bg-card text-base text-text-primary placeholder:text-text-secondary/50 focus:border-accent outline-none transition-colors"
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
                placeholder={t('field_section_key_placeholder')}
                className="w-full px-4 py-3 rounded-xl border border-border-green bg-card text-base text-text-primary placeholder:text-text-secondary/50 focus:border-accent outline-none transition-colors font-mono"
              />
              <span className="text-xs text-text-secondary mt-1 block">
                {t('field_section_key_hint')}
              </span>
            </div>
          </div>

          {/* Sensors & Telemetry info */}
          <div className="p-4 rounded-xl border border-border-green bg-card text-sm space-y-1.5">
            <div className="flex items-center justify-between text-text-secondary">
              <span>{t('field_sensor_status_label')}</span>
              <span className="font-mono text-accent">{t('field_sensor_status_val')}</span>
            </div>
            <div className="flex items-center justify-between text-text-secondary">
              <span>{t('field_mapped_sensors_label')}</span>
              <span className="font-mono text-text-primary">{t('field_mapped_sensors_val')}</span>
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
                  <span>{t('btn_submit_create_batch')}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
