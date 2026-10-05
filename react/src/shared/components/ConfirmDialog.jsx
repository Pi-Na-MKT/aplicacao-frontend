import React from 'react'
import { createPortal } from 'react-dom'
import Spinner from './Spinner'

export default function ConfirmDialog({ title, description, onConfirm, onCancel, loading = false, confirmLabel = 'Excluir' }) {
  return createPortal(
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in">
        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-1">{title}</h3>
        {description && <div className="text-center mb-5">{description}</div>}
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading} className="btn-ghost flex-1 justify-center">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Spinner size="sm" className="text-white" /> : null}
            {loading ? 'Excluindo...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
