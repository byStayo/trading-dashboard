import { Badge, Button, Card, CardContent, CardHeader, Input } from "@/components/ui/card"
import { Loader2 } from "@/components/ui/loader"
import { Send } from "lucide-react"
import { useRef, useState } from "react"
import { Bot } from "./bot"
import { ScrollArea } from "./scroll-area"

const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case "positive":
      return "bg-green-500/10 text-green-500"
    case "negative":
      return "bg-red-500/10 text-red-500"
    case "neutral":
      return "bg-yellow-500/10 text-yellow-500"
    default:
      return ""
  }
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sentiment?: string
  confidence?: number
}

export function ChatInterface({
  messages,
  handleMessageSubmit,
  isAnalyzing,
}: {
  messages: Message[]
  handleMessageSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isAnalyzing: boolean
}) {
  const [input, setInput] = useState("")
  const [context, setContext] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useState(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Chat</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Set conversation context..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-[200px]"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex gap-2 max-w-[80%] rounded-lg p-3 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted flex items-start"
                  }`}
                >
                  {message.role === "assistant" && <Bot className="h-5 w-5 mt-1 flex-shrink-0" />}
                  <div className="flex flex-col gap-1">
                    <p className="text-sm">{message.content}</p>
                    {message.sentiment && (
                      <Badge variant="outline" className={getSentimentColor(message.sentiment)}>
                        {message.sentiment}
                      </Badge>
                    )}
                    {message.confidence && (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                        Confidence: {(message.confidence * 100).toFixed(2)}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <form onSubmit={handleMessageSubmit} className="mt-4 flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about markets, get trading ideas, or analyze trends..."
            className="flex-1"
            disabled={isAnalyzing}
          />
          <Button type="submit" disabled={isAnalyzing} className="w-24">
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

