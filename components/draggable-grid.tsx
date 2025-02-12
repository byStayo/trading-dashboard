"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Move } from "lucide-react"
import type React from "react"

interface DraggableGridProps {
  children: React.ReactNode[]
  onLayoutChange?: (newLayout: string[]) => void
  editMode: boolean
  freeMovement?: boolean
}

export function DraggableGrid({ children, onLayoutChange, editMode, freeMovement }: DraggableGridProps) {
  const [items, setItems] = useState(children)
  const gridRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<{ [key: string]: number }>({})
  const [layout, setLayout] = useState<string[]>([])

  useEffect(() => {
    setItems(children)
    // Initialize positions if they don't exist
    const initialPositions: { [key: string]: number } = {}
    const initialLayout: string[] = []
    children.forEach((child: any, index) => {
      if (child?.key) {
        initialPositions[child.key] = index
        initialLayout.push(child.key)
      }
    })
    setPositions(initialPositions)
    setLayout(initialLayout)
  }, [children])

  const findClosestDropZone = (x: number, y: number) => {
    if (!gridRef.current) return 0
    const gridItems = Array.from(gridRef.current.children)
    let closestIndex = 0
    let closestDistance = Number.POSITIVE_INFINITY

    gridItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))

      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })

    return closestIndex
  }

  const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: any, itemKey: string) => {
    if (!editMode) return

    const dropIndex = findClosestDropZone(info.point.x, info.point.y)
    const draggedItemIndex = Object.values(positions).indexOf(positions[itemKey])

    if (freeMovement) {
      const newLayout = [...layout]
      const draggedIndex = newLayout.indexOf(itemKey)
      newLayout.splice(draggedIndex, 1)
      newLayout.splice(dropIndex, 0, itemKey)
      if (onLayoutChange) {
        onLayoutChange(newLayout)
      }
    } else {
      if (draggedItemIndex !== dropIndex) {
        const newPositions = { ...positions }

        // Update positions of items between drag start and drop positions
        Object.keys(newPositions).forEach((key) => {
          const currentPos = newPositions[key]
          if (draggedItemIndex < dropIndex) {
            if (currentPos > draggedItemIndex && currentPos <= dropIndex) {
              newPositions[key]--
            }
          } else {
            if (currentPos >= dropIndex && currentPos < draggedItemIndex) {
              newPositions[key]++
            }
          }
        })

        newPositions[itemKey] = dropIndex
        setPositions(newPositions)

        // Update layout
        const newLayout = Object.entries(newPositions)
          .sort(([, a], [, b]) => a - b)
          .map(([key]) => key)

        if (onLayoutChange) {
          onLayoutChange(newLayout)
        }
      }
    }
  }

  const sortedItems = [...items].sort((a: any, b: any) => {
    return (positions[a.key] || 0) - (positions[b.key] || 0)
  })

  return (
    <AnimatePresence>
      <motion.div
        ref={gridRef}
        className={`grid gap-4 p-4 ${
          freeMovement
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        }`}
        layout
      >
        {sortedItems.map((item: any) => (
          <motion.div
            key={item.key}
            layout
            drag={editMode}
            dragMomentum={false}
            dragElastic={0.1}
            onDragEnd={(event, info) => onDragEnd(event, info, item.key)}
            className="relative"
            whileHover={editMode ? { scale: 1.02 } : undefined}
            whileDrag={{ scale: 1.05, zIndex: 1 }}
          >
            {editMode && (
              <div className="absolute top-2 right-2 z-10 p-1 rounded-full bg-background/80 backdrop-blur-sm opacity-75">
                <Move className="h-4 w-4" />
              </div>
            )}
            {item}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

