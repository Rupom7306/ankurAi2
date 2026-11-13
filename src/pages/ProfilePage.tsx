import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sprout, 
  Plus, 
  QrCode, 
  Edit3, 
  Trash2, 
  User, 
  AlertTriangle,
  Printer
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CropBatch } from '../types';
import { subscribeUserBatches, deleteCropBatch } from '../services/cropBatchService';
import { QRViewModal } from '../components/QRViewModal';
import { EditBatchModal } from '../components/EditBatchModal';
import { CreateBatchModal } from '../components/CreateBatchModal';

interface ProfilePageProps {
  onBackToHome: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBackToHome }) => {
  const { currentUser } = useAuth();
  const { t, formatNumber } = useLanguage();
  const [batches, setBatches] = useState<CropBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingQRBatch, setViewingQRBatch] = useState<CropBatch | null>(null);
  const [editingBatch, setEditingBatch] = useState<CropBatch | null>(null);
  const [batchToDelete, setBatchToDelete] = useState<CropBatch | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    setIsLoading(true);
    const unsubscribe = subscribeUserBatches(
      currentUser.uid,
      (userBatches) => {
        setBatches(userBatches);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const confirmDelete = async () => {
    if (!currentUser || !batchToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCropBatch(currentUser.uid, batchToDelete.id);
      setBatchToDelete(null);
    } catch (err) {
      console.error('Failed to delete batch:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto p-10 text-center space-y-4">
        <p className="text-text-secondary text-base">{t('login_prompt_title')}</p>
        <button
          onClick={onBackToHome}
          className="btn-primary"
        >
          {t('btn_back_to_batches')}
        </button>
      </div>
    );
  }

  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Farmer';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn pb-16">
      {/* Top Navigation & Profile Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-header">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToHome}
            className="interactive btn-secondary h-12 px-4 text-sm sm:text-base font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('result_btn_new_scan')}</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-accent/15 border border-border-green text-accent flex items-center justify-center font-bold text-base">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary leading-tight">
                {displayName}
              </h2>
              <span className="text-sm text-text-secondary font-mono">
                {currentUser.email}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="btn-primary"
        >
          <Plus className="w-5 h-5" />
          <span>{t('btn_new_batch')}</span>
        </button>
      </div>

      {/* Batches Management Section */}
      <div className="rounded-2xl border border-border-green bg-card p-6 sm:p-8 shadow-card-soft space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold font-bengali text-text-primary">
              {t('saved_batches_title')}
            </h3>
            <p className="text-base text-text-secondary mt-0.5">
              {t('profile_subtitle')}
            </p>
          </div>
          <span className="text-sm text-accent font-mono px-3 py-1.5 rounded-lg bg-accent/10 border border-border-green font-bold">
            {t('profile_total_batches')}: {formatNumber(batches.length)}
          </span>
        </div>

        {isLoading ? (
          <div className="py-14 text-center text-base text-text-secondary">
            {t('auth_submitting')}
          </div>
        ) : batches.length === 0 ? (
          <div className="py-14 px-6 text-center rounded-xl border border-dashed border-border-green bg-card-elevated space-y-4">
            <div className="w-14 h-14 rounded-full bg-accent/10 border border-border-green flex items-center justify-center text-accent mx-auto">
              <Sprout className="w-7 h-7 stroke-[2]" />
            </div>
            <h4 className="text-lg font-bold text-text-primary font-bengali">
              {t('profile_no_batches_title')}
            </h4>
            <p className="text-base text-text-secondary max-w-md mx-auto">
              {t('profile_no_batches_desc')}
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="btn-primary"
            >
              <Plus className="w-5 h-5" />
              <span>{t('btn_create_first_batch')}</span>
            </button>
          </div>
        ) : (
          /* Batches Table on Desktop / Card layout on Mobile */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm sm:text-base border-collapse">
              <thead>
                <tr className="border-b border-border-green text-text-secondary uppercase text-xs tracking-wider">
                  <th className="py-3.5 px-4">{t('profile_col_name')}</th>
                  <th className="py-3.5 px-4">{t('profile_col_crop')}</th>
                  <th className="py-3.5 px-4">{t('profile_col_date')}</th>
                  <th className="py-3.5 px-4">{t('profile_col_section')}</th>
                  <th className="py-3.5 px-4">{t('profile_col_status')}</th>
                  <th className="py-3.5 px-4 text-right">{t('profile_col_actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-green">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-card-elevated transition-colors">
                    <td className="py-4 px-4 font-bold text-text-primary">
                      {batch.name}
                    </td>
                    <td className="py-4 px-4 text-text-secondary">
                      <span className="text-text-primary font-medium">{batch.cropType}</span>
                      {batch.variety && <span className="block text-xs text-text-secondary">{batch.variety}</span>}
                    </td>
                    <td className="py-4 px-4 text-text-secondary">
                      {batch.plantingDate}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-accent bg-bg px-2.5 py-1 rounded border border-border-green text-xs font-bold">
                        {batch.sectionKey}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 rounded-full text-xs bg-bg border border-border-green text-text-secondary">
                        {t('profile_status_offline')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View & Print QR */}
                        <button
                          onClick={() => setViewingQRBatch(batch)}
                          title={t('qr_view_title')}
                          className="interactive p-2.5 rounded-xl border border-border-green bg-card hover:bg-card-elevated text-accent transition-colors cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* Direct Print */}
                        <button
                          onClick={() => setViewingQRBatch(batch)}
                          title={t('btn_print_label')}
                          className="interactive p-2.5 rounded-xl border border-border-green bg-card hover:bg-card-elevated text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => setEditingBatch(batch)}
                          title={t('modal_edit_batch_title')}
                          className="interactive p-2.5 rounded-xl border border-border-green bg-card hover:bg-card-elevated text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setBatchToDelete(batch)}
                          title={t('btn_delete')}
                          className="interactive p-2.5 rounded-xl border border-border-green bg-card hover:bg-card-elevated text-text-secondary hover:text-alert-warning transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {batchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div 
            className="w-full max-w-md rounded-2xl border border-border-green bg-card-elevated p-7 shadow-card-soft text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-alert-warning/15 border border-alert-warning/30 text-alert-warning flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-text-primary">
                {t('profile_delete_confirm_title')}
              </h4>
              <p className="text-base text-text-secondary mt-1">
                {t('profile_delete_confirm_desc')} <strong className="text-text-primary">"{batchToDelete.name}"</strong>?
              </p>
            </div>
            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setBatchToDelete(null)}
                disabled={isDeleting}
                className="interactive btn-secondary flex-1 h-12"
              >
                {t('btn_cancel')}
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="interactive flex-1 h-12 rounded-xl bg-alert-warning text-white font-bold text-base hover:bg-alert-warning/85 transition-all cursor-pointer"
              >
                {isDeleting ? t('btn_deleting') : t('btn_delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <CreateBatchModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Edit Modal */}
      <EditBatchModal
        batch={editingBatch}
        isOpen={Boolean(editingBatch)}
        onClose={() => setEditingBatch(null)}
      />

      {/* QR View & Print Modal */}
      <QRViewModal
        batch={viewingQRBatch}
        onClose={() => setViewingQRBatch(null)}
      />
    </div>
  );
};
