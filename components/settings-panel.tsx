"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUserPreferences } from "@/lib/hooks/use-user-preferences"
import { Settings, X, GripVertical } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

const arrayMove = (array: string[], from: number, to: number) => {
  const newArray = array.slice()
  newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0])
  return newArray
}

interface SettingsPanelProps {
  editMode: boolean
  setEditMode: (value: boolean) => void
}

export function SettingsPanel({ editMode, setEditMode }: SettingsPanelProps) {
  const { preferences, updatePreferences } = useUserPreferences()
  const [isOpen, setIsOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const onDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = preferences.layout.indexOf(active.id)
      const newIndex = preferences.layout.indexOf(over.id)

      const newLayout = arrayMove(preferences.layout, oldIndex, newIndex)
      updatePreferences({ layout: newLayout })
    }
  }

  const allWidgets = [
    { id: "market-overview", label: "Market Overview" },
    { id: "live-market-data", label: "Live Market Data" },
    { id: "smart-money-flow", label: "Smart Money Flow" },
    { id: "ai-insights", label: "AI Insights" },
    { id: "support-resistance-levels", label: "Support/Resistance Levels" },
    { id: "generative-news-panel", label: "Generative News Panel" },
    { id: "generative-trading-ideas", label: "Generative Trading Ideas" },
    { id: "context-aware-chart", label: "Context-Aware Chart" },
    { id: "order-book-visualization", label: "Order Book Visualization" },
    { id: "generative-chat-interface", label: "Generative Chat Interface" },
    { id: "portfolio-overview", label: "Portfolio Overview" },
    { id: "economic-calendar", label: "Economic Calendar" },
    { id: "market-breadth", label: "Market Breadth" },
    { id: "trading-volume", label: "Trading Volume" },
    { id: "option-chain", label: "Option Chain" },
    { id: "technical-analysis", label: "Technical Analysis" },
  ]

  function SortableItem({ id }: { id: string }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    const widget = allWidgets.find((w) => w.id === id)
    if (!widget) return null

    return (
      <li
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex items-center space-x-2 bg-muted p-2 rounded-md"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <label htmlFor={`widget-${id}`} className="text-sm font-medium leading-none cursor-pointer flex-1">
          {widget.label}
        </label>
      </li>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button onClick={() => setIsOpen(!isOpen)} size="icon">
        <Settings className="h-4 w-4" />
      </Button>
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-80 bg-background border rounded-lg shadow-lg">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Dashboard Settings</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="h-[400px] p-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-mode-toggle">Edit Mode</Label>
                <Switch id="edit-mode-toggle" checked={editMode} onCheckedChange={setEditMode} />
              </div>
              <div className="space-y-2">
                <Label>Widget Order</Label>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={preferences.layout} strategy={verticalListSortingStrategy}>
                    <ul className="space-y-2">
                      {preferences.layout.map((widgetId) => (
                        <SortableItem key={widgetId} id={widgetId} />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

