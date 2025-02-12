import { LiveTickerBar } from "@/components/live-ticker-bar"
import { useEffect, useState, useCallback } from "react"
import { TickerConfig, DEFAULT_CONFIG } from "./ticker-config-dialog"

const STORAGE_KEY = "tickerConfig"

export function LiveTickerWrapper() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<TickerConfig>(DEFAULT_CONFIG)

  // Load config from localStorage
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEY)
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig)
        if (isValidConfig(parsedConfig)) {
          setConfig(parsedConfig)
        }
      }
    } catch (error) {
      console.error('Error loading ticker config:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const isValidConfig = (config: any): config is TickerConfig => {
    return (
      config &&
      typeof config === 'object' &&
      typeof config.preset === 'string' &&
      Array.isArray(config.customTickers) &&
      (typeof config.maxTickers === 'number' || config.maxTickers === undefined) &&
      (typeof config.sector === 'string' || config.sector === undefined)
    )
  }

  const handleConfigUpdate = useCallback((newConfig: TickerConfig) => {
    try {
      if (!isValidConfig(newConfig)) {
        throw new Error('Invalid configuration format')
      }

      // Validate preset-specific requirements
      if (newConfig.preset === 'sector' && !newConfig.sector) {
        throw new Error('Sector must be selected for sector preset')
      }

      if (newConfig.preset === 'custom' && (!Array.isArray(newConfig.customTickers) || newConfig.customTickers.length === 0)) {
        throw new Error('Custom tickers must be provided for custom preset')
      }

      // Create a clean config object
      const validConfig: TickerConfig = {
        preset: newConfig.preset,
        customTickers: Array.isArray(newConfig.customTickers) ? newConfig.customTickers : [],
        maxTickers: newConfig.maxTickers || 20,
        sector: newConfig.preset === 'sector' ? newConfig.sector : undefined
      }

      // Update state
      setConfig(validConfig)

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validConfig))

      // Clear any existing errors
      setError(null)
    } catch (error) {
      console.error('Error updating ticker config:', error)
      setError(error instanceof Error ? error.message : 'Failed to save configuration')
    }
  }, [])

  return (
    <div className="w-full">
      <LiveTickerBar
        config={config}
        onConfigUpdate={handleConfigUpdate}
        isLoading={isLoading}
      />
      {error && (
        <div className="text-sm text-red-500 mt-1">
          {error}
        </div>
      )}
    </div>
  )
}

