"use client"

import { useState, useEffect } from "react"

type WebSocketMessage = {
  type: string
  data: any
}

export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)

  useEffect(() => {
    const ws = new WebSocket(url)

    ws.onopen = () => setIsConnected(true)
    ws.onclose = () => setIsConnected(false)
    ws.onmessage = (event) => setLastMessage(JSON.parse(event.data))

    setSocket(ws)

    return () => {
      ws.close()
    }
  }, [url])

  const sendMessage = (message: WebSocketMessage) => {
    if (socket) {
      socket.send(JSON.stringify(message))
    }
  }

  return { isConnected, lastMessage, sendMessage }
}

