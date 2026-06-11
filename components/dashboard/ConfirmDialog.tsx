"use client";

import { buttonDangerClass, buttonSecondaryClass } from "./form-styles";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Excluir",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <h2
          id="confirm-title"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={buttonSecondaryClass}>
            Cancelar
          </button>
          <button type="button" onClick={onConfirm} className={buttonDangerClass}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
