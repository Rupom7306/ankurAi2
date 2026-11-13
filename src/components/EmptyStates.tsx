import React from 'react';
import { Sprout, BarChart3, Plus } from 'lucide-react';

interface EmptyBatchesProps {
  onCreateBatch?: () => void;
}

export const EmptyBatchesState: React.FC<EmptyBatchesProps> = ({ onCreateBatch }) => {
  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl border border-border-green bg-card text-center shadow-card-soft">
      <div className="w-14 h-14 rounded-full bg-accent/10 border border-border-green flex items-center justify-center text-accent mx-auto mb-4 shadow-glow-sm">
        <Sprout className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold font-bengali text-text-primary mb-1">
        কোন ফসলের ব্যাচ পাওয়া যায়নি
      </h3>
      <p className="text-xs text-text-secondary mb-5">
        No crop batches registered yet. Register your first batch to start tracking telemetry and sensor analytics.
      </p>
      {onCreateBatch && (
        <button
          onClick={onCreateBatch}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-text-on-accent text-xs font-bold hover:bg-accent-hover shadow-glow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ব্যাচ তৈরি করুন (Create New Batch)</span>
        </button>
      )}
    </div>
  );
};

export const EmptyChartPlaceholder: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-2xl border border-dashed border-border-green bg-card/60 text-center">
      <div className="w-12 h-12 rounded-full bg-accent/10 border border-border-green flex items-center justify-center text-accent mx-auto mb-3">
        <BarChart3 className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold font-bengali text-text-primary mb-1">
        সেন্সর ও পুষ্টির তথ্য চার্ট
      </h4>
      <p className="text-xs text-text-secondary">
        ফসলের ব্যাচ নির্বাচন বা স্ক্যান সম্পন্ন হলে NPK বিশ্লেষণ ও সার্বিক র‍্যাংকিং প্রদর্শিত হবে।
      </p>
      <span className="inline-block mt-3 text-[11px] text-accent/80 font-mono">
        Scan a batch to see sensor telemetry and ranking
      </span>
    </div>
  );
};
