import { LiveTickerBar } from "@/components/live-ticker-bar"

interface LiveTickerWrapperProps {
  isLoadingData: boolean
  isErrorData: boolean
  marketData: any // Replace 'any' with the actual type of marketData
}

export function LiveTickerWrapper({ isLoadingData, isErrorData, marketData }: LiveTickerWrapperProps) {
  return (
    <div className="bg-muted/30 rounded-md p-1">
      {!isLoadingData && !isErrorData && marketData && <LiveTickerBar data={marketData} />}
    </div>
  )
}

