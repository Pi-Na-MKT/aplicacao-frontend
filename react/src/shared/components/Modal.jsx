import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

const WIDTHS = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' }

function ModalRoot({ children, onClose, size = 'md' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${WIDTHS[size]} flex flex-col max-h-[90vh] animate-scale-in`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

function Header({ title, onClose }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  )
}

function Body({ children, className = '' }) {
  return (
    <div className={`overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4 ${className}`}>
      {children}
    </div>
  )
}

function Footer({ children }) {
  return (
    <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
      {children}
    </div>
  )
}

const Modal = Object.assign(ModalRoot, { Header, Body, Footer })
export default Modal
