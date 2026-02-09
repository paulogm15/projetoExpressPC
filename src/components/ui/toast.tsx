<<<<<<< HEAD
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const ToastContext = React.createContext<{
  toast: (options: { title?: string; description?: string; variant?: "default" | "destructive" }) => void;
} | null>(null)

export function Toaster() {
  const [toasts, setToasts] = React.useState<
    { id: number; title?: string; description?: string; variant?: string }[]
  >([])

  const toast = React.useCallback((options: any) => {
    setToasts(prev => [...prev, { id: Date.now(), ...options }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              "rounded-md border bg-white shadow p-4",
              t.variant === "destructive" && "border-red-600 text-red-700"
            )}
          >
            {t.title && <p className="font-semibold">{t.title}</p>}
            {t.description && <p className="text-sm">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) throw new Error("useToast must be used inside <Toaster />")
  return context
}
=======
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const ToastContext = React.createContext<{
  toast: (options: { title?: string; description?: string; variant?: "default" | "destructive" }) => void;
} | null>(null)

export function Toaster() {
  const [toasts, setToasts] = React.useState<
    { id: number; title?: string; description?: string; variant?: string }[]
  >([])

  const toast = React.useCallback((options: any) => {
    setToasts(prev => [...prev, { id: Date.now(), ...options }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              "rounded-md border bg-white shadow p-4",
              t.variant === "destructive" && "border-red-600 text-red-700"
            )}
          >
            {t.title && <p className="font-semibold">{t.title}</p>}
            {t.description && <p className="text-sm">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) throw new Error("useToast must be used inside <Toaster />")
  return context
}
>>>>>>> origin/main
