import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"

export type TickerPreset = 
  | "trending"
  | "gainers"
  | "losers"
  | "mixed"
  | "sp500"
  | "weighted"
  | "marketCap"
  | "sector"
  | "indices"
  | "custom";

interface TickerConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (config: TickerConfig) => void
  currentConfig: TickerConfig
}

export interface TickerConfig {
  preset: TickerPreset
  customTickers: string[]
  sector?: string
  maxTickers: number
}

export const DEFAULT_CONFIG: TickerConfig = {
  preset: "trending",
  customTickers: [],
  maxTickers: 20,
}

const PRESET_OPTIONS = [
  { value: "trending", label: "Top Trending" },
  { value: "gainers", label: "Biggest Gainers" },
  { value: "losers", label: "Biggest Losers" },
  { value: "mixed", label: "Mixed Performance" },
  { value: "sp500", label: "S&P 500 Components" },
  { value: "weighted", label: "Top Weighted" },
  { value: "marketCap", label: "Largest Market Cap" },
  { value: "sector", label: "By Sector" },
  { value: "indices", label: "Major Indices" },
  { value: "custom", label: "Custom Selection" },
] as const

const SECTORS = [
  "Technology",
  "Healthcare",
  "Financials",
  "Consumer Discretionary",
  "Consumer Staples",
  "Industrials",
  "Energy",
  "Materials",
  "Utilities",
  "Real Estate",
  "Communication Services",
] as const

export function TickerConfigDialog({ 
  open, 
  onOpenChange, 
  onSave,
  currentConfig = DEFAULT_CONFIG
}: TickerConfigDialogProps) {
  const [config, setConfig] = useState<TickerConfig>(currentConfig)
  const [activeTab, setActiveTab] = useState<string>("presets")
  const [newTicker, setNewTicker] = useState("")

  // Update local state when currentConfig changes
  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig)
    }
  }, [currentConfig])

  const handleSave = () => {
    // Validate config before saving
    const validConfig: TickerConfig = {
      preset: config.preset,
      customTickers: config.customTickers || [],
      maxTickers: config.maxTickers || 20,
      sector: config.preset === 'sector' ? config.sector : undefined
    }

    // Only save if we have a valid preset
    if (validConfig.preset === 'sector' && !validConfig.sector) {
      return // Don't save if sector preset is selected but no sector is chosen
    }

    if (validConfig.preset === 'custom' && validConfig.customTickers.length === 0) {
      return // Don't save if custom preset is selected but no tickers are added
    }

    onSave(validConfig)
    onOpenChange(false)
  }

  const addCustomTicker = () => {
    if (newTicker && !config.customTickers.includes(newTicker.toUpperCase())) {
      setConfig(prev => ({
        ...prev,
        customTickers: [...prev.customTickers, newTicker.toUpperCase()],
      }))
      setNewTicker("")
    }
  }

  const removeCustomTicker = (ticker: string) => {
    setConfig(prev => ({
      ...prev,
      customTickers: prev.customTickers.filter(t => t !== ticker),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Ticker Display</DialogTitle>
        </DialogHeader>
        <Tabs 
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          
          <TabsContent value="presets">
            <div className="grid grid-cols-2 gap-4 mb-8">
              {PRESET_OPTIONS.map(preset => (
                <Button
                  key={preset.value}
                  variant={config.preset === preset.value ? "default" : "outline"}
                  onClick={() => setConfig(prev => ({ 
                    ...prev, 
                    preset: preset.value as TickerPreset,
                    // Clear sector when switching to non-sector preset
                    sector: preset.value === "sector" ? prev.sector : undefined 
                  }))}
                  className="justify-start"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            
            {config.preset === "sector" && (
              <div className="mt-4">
                <h4 className="mb-2 font-medium">Select Sector</h4>
                <div className="grid grid-cols-2 gap-2">
                  {SECTORS.map(sector => (
                    <Button
                      key={sector}
                      variant={config.sector === sector ? "default" : "outline"}
                      onClick={() => setConfig(prev => ({ ...prev, sector }))}
                      className="justify-start"
                    >
                      {sector}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter ticker symbol (e.g., AAPL)"
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && addCustomTicker()}
                />
                <Button onClick={addCustomTicker}>Add</Button>
              </div>
              
              <ScrollArea className="h-[200px] border rounded-md p-4">
                <div className="flex flex-wrap gap-2">
                  {config.customTickers.map(ticker => (
                    <Badge key={ticker} variant="secondary">
                      {ticker}
                      <button
                        onClick={() => removeCustomTicker(ticker)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 