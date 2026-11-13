import React, { useRef, useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { CropBatch } from '../types';
import { parseSensorFile, ParseResult, ParsedSensorRow } from '../lib/excelParser';
import { useLanguage } from '../context/LanguageContext';

interface SensorDataUploaderProps {
  selectedBatch: CropBatch;
  onDataParsed: (data: { allRows: ParsedSensorRow[]; batchRows: ParsedSensorRow[]; detectedSections: string[] }) => void;
  onBack: () => void;
}

export const SensorDataUploader: React.FC<SensorDataUploaderProps> = ({
  selectedBatch,
  onDataParsed,
  onBack,
}) => {
  const { t, formatNumber } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessFile = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setFileName(file.name);

    try {
      const result = await parseSensorFile(file, selectedBatch.sectionKey);

      if (!result.success) {
        setError(result.error || t('sensor_parsing_progress'));
        setParseResult(null);
      } else {
        setParseResult(result);
        onDataParsed({
          allRows: result.rows,
          batchRows: result.batchRows,
          detectedSections: result.detectedSections,
        });
      }
    } catch (err: unknown) {
      console.error('File parsing error:', err);
      setError(t('sensor_parsing_progress'));
      setParseResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fadeIn">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleProcessFile(file);
        }}
        className="hidden"
      />

      {/* Main Card */}
      <div className="rounded-2xl border border-border-green bg-card p-6 sm:p-8 shadow-card-soft space-y-6">
        
        {/* Header & Batch Info (No sample download button) */}
        <div className="pb-4 border-b border-border-green">
          <h3 className="text-xl sm:text-2xl font-bold font-bengali text-text-primary">
            {t('sensor_upload_title')}
          </h3>
          <p className="text-base text-text-secondary mt-1">
            {t('sensor_upload_desc')} <strong className="text-accent">{selectedBatch.name}</strong> ({t('sensor_upload_sub_section')} <span className="font-mono text-accent">{selectedBatch.sectionKey}</span>)
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl border border-alert-warning/30 bg-alert-warning/10 text-alert-warning text-sm sm:text-base flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Drop Zone or Processing State */}
        {isProcessing ? (
          <div className="p-10 rounded-2xl border-2 border-dashed border-border-green bg-card-elevated text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto" />
            <p className="text-base font-semibold text-text-primary">
              {t('sensor_parsing_progress')}
            </p>
          </div>
        ) : !parseResult ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all text-center space-y-4 ${
              isDragging
                ? 'border-accent bg-card-elevated shadow-glow'
                : 'border-border-green bg-card hover:border-accent/40'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-accent/10 border border-border-green flex items-center justify-center text-accent mx-auto shadow-glow-sm">
              <FileSpreadsheet className="w-8 h-8 stroke-[1.8]" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg sm:text-xl font-bold font-bengali text-text-primary">
                {t('sensor_drop_title')}
              </h4>
              <p className="text-sm sm:text-base text-text-secondary max-w-sm mx-auto">
                {t('sensor_drop_desc')}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary h-12 px-6"
              >
                <Upload className="w-5 h-5" />
                <span>{t('btn_browse_file')}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Parsed Summary Card */
          <div className="space-y-5 animate-fadeIn">
            <div className="p-4 rounded-xl border border-accent/30 bg-accent/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-accent shrink-0" />
                <div>
                  <span className="text-sm font-bold text-text-primary font-mono truncate max-w-xs block">
                    {fileName}
                  </span>
                  <span className="text-xs text-accent">
                    {t('score_npk')} & {t('score_humidity')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setParseResult(null);
                  setFileName(null);
                }}
                className="interactive text-sm text-text-secondary hover:text-text-primary underline cursor-pointer"
              >
                {t('sensor_upload_another')}
              </button>
            </div>

            {/* Metrics extracted */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-xl border border-border-green bg-card-elevated">
                <span className="text-xs text-text-secondary block mb-1">{t('sensor_metric_total')}</span>
                <strong className="text-lg font-bold text-text-primary font-mono">
                  {formatNumber(parseResult.rows.length)}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl border border-border-green bg-card-elevated">
                <span className="text-xs text-text-secondary block mb-1">{t('sensor_metric_sections')}</span>
                <strong className="text-lg font-bold text-accent font-mono">
                  {formatNumber(parseResult.detectedSections.length)}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl border border-border-green bg-card-elevated">
                <span className="text-xs text-text-secondary block mb-1">{t('sensor_metric_batch_rows')}</span>
                <strong className="text-lg font-bold text-text-primary font-mono">
                  {formatNumber(parseResult.batchRows.length)}
                </strong>
              </div>
              <div className="p-3.5 rounded-xl border border-border-green bg-card-elevated">
                <span className="text-xs text-text-secondary block mb-1">{t('sensor_metric_date_range')}</span>
                <strong className="text-sm font-bold text-text-primary font-mono">
                  {parseResult.batchRows.length > 0
                    ? `${parseResult.batchRows[0].date.slice(5)} ~ ${parseResult.batchRows[parseResult.batchRows.length - 1].date.slice(5)}`
                    : 'N/A'}
                </strong>
              </div>
            </div>

            {/* Section match warning if 0 rows */}
            {parseResult.batchRows.length === 0 && (
              <div className="p-4 rounded-xl border border-alert-warning/40 bg-alert-warning/10 text-alert-warning text-sm sm:text-base space-y-2">
                <p className="font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{t('sensor_no_rows_warning')}</span>
                </p>
                <p className="text-xs text-text-secondary">
                  {t('sensor_detected_sections_label')} {parseResult.detectedSections.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-border-green flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="interactive btn-secondary w-full sm:w-auto h-12 px-5"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('btn_back_to_batches')}</span>
          </button>

          {parseResult && (
            <button
              type="button"
              onClick={() => {
                onDataParsed({
                  allRows: parseResult.rows,
                  batchRows: parseResult.batchRows,
                  detectedSections: parseResult.detectedSections,
                });
              }}
              className="btn-primary w-full sm:w-auto"
            >
              <span>{t('btn_proceed_to_analysis')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
