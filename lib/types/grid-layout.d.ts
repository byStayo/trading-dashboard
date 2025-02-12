declare module "react-grid-layout" {
  import type { ReactElement } from "react"

  export interface Layout {
    i: string
    x: number
    y: number
    w: number
    h: number
    minW?: number
    maxW?: number
    minH?: number
    maxH?: number
    isDraggable?: boolean
    isResizable?: boolean
    static?: boolean
  }

  export interface Layouts {
    [key: string]: Layout[]
  }

  export interface ResponsiveProps {
    className?: string
    layouts: Layouts
    breakpoints: { [key: string]: number }
    cols: { [key: string]: number }
    rowHeight: number
    onLayoutChange?: (layout: Layout[], layouts: Layouts) => void
    isDraggable?: boolean
    isResizable?: boolean
    margin?: [number, number]
    containerPadding?: [number, number]
    children?: ReactElement[]
  }

  export const Responsive: React.ComponentType<ResponsiveProps>
  export function WidthProvider<T>(component: React.ComponentType<T>): React.ComponentType<Omit<T, "width">>
}

