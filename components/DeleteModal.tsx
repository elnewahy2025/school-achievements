'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import { useSettings } from './SettingsContext';

interface DeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteModal({ isOpen, title, message, onConfirm, onCancel, loading }: DeleteModalProps) {
  const { t } = useSettings();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-dark-800 rounded-2xl border border-dark-600 p-6 max-w-md w-full animate-bounce-in shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-kahoot-red/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-kahoot-red" />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <p className="text-gray-300 mb-6 text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-dark-700 text-gray-300 hover:bg-dark-600 hover:text-white transition-all text-sm"
          >
            {t('modal.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-kahoot-red text-white hover:bg-red-600 transition-all text-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {loading ? t('modal.deleting') : t('modal.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
