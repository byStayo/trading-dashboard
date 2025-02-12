"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface AppState {
  theme: "light" | "dark"
  currency: "USD" | "EUR" | "GBP"
}

interface AppStateContextType {
  state: AppState
  updateState: (newState: Partial<AppState>) => void
}

const AppStateContext = createContext<AppStateContextType | undefined>(undefined)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    theme: "light",
    currency: "USD",
  })

  const updateState = (newState: Partial<AppState>) => {
    setState((prevState) => ({ ...prevState, ...newState }))
  }

  return <AppStateContext.Provider value={{ state, updateState }}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider")
  }
  return context
}

