"use client"

import { useState } from "react"
import Joyride, { type Step } from "react-joyride"

const steps: Step[] = [
  {
    target: ".settings-button",
    content: "Click here to open the settings panel and customize your dashboard.",
  },
  {
    target: ".theme-toggle",
    content: "Toggle between light and dark mode for your preferred viewing experience.",
  },
  {
    target: ".widget-list",
    content: "Drag and drop widgets to reorder them on your dashboard.",
  },
  // Add more steps as needed
]

export function GuidedTour() {
  const [run, setRun] = useState(true)

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      styles={{
        options: {
          primaryColor: "#4338ca",
        },
      }}
      callback={(data) => {
        const { status } = data
        if (["finished", "skipped"].includes(status)) {
          setRun(false)
        }
      }}
    />
  )
}

