"use client"

import { useState, useEffect } from "react"
import type { Layout } from "react-grid-layout"

interface UserPreferences {
  layout: Layout[]
}

const defaultPreferences: UserPreferences = {
  layout: [],
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences)

  useEffect(() => {
    const storedPreferences = localStorage.getItem("userPreferences")
    if (storedPreferences) {
      try {
        setPreferences(JSON.parse(storedPreferences))
      } catch (error) {
        console.error("Failed to parse stored preferences:", error)
        setPreferences(defaultPreferences)
      }
    }
  }, [])

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences }
    setPreferences(updatedPreferences)
    localStorage.setItem("userPreferences", JSON.stringify(updatedPreferences))
  }

  const updateLayout = (newLayout: Layout[]) => {
    updatePreferences({ layout: newLayout })
  }

  return {
    preferences,
    updatePreferences,
    updateLayout,
  }
}

