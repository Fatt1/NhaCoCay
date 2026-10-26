import React, { useEffect } from "react"

export interface ToastMessage {
  id: string
  message: string
  icon?: string
}

interface ToastProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

const ToastItem: React.FC<{ toast: ToastMessage; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, 3200)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <div className="pointer-events-auto flex items-center gap-3 px-5 py-3.5 bg-surface-container-lowest text-on-surface rounded-full shadow-xl border border-outline-variant/30 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <span className="material-symbols-outlined text-primary text-[20px]">
        {toast.icon || "check_circle"}
      </span>
      <span className="font-medium text-xs text-on-surface">{toast.message}</span>
    </div>
  )
}
