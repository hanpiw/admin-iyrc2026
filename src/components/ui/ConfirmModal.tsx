"use client"

import { X, AlertCircle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, Hapus',
  cancelText = 'Batal',
  variant = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
    warning: 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/20',
    info: 'bg-primary hover:bg-primary/90 shadow-primary/20'
  }

  const iconColors = {
    danger: 'text-red-500 bg-red-500/10',
    warning: 'text-yellow-500 bg-yellow-500/10',
    info: 'text-primary bg-primary/10'
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 flex flex-col items-center text-center">
          {/* Icon Header */}
          <div className={`p-4 rounded-full mb-4 ${iconColors[variant]}`}>
            <AlertCircle className="h-8 w-8" />
          </div>

          <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex flex-col w-full gap-2">
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-lg transition-all active:scale-95 ${variantStyles[variant]}`}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {cancelText}
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
