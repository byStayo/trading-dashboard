import { GenerativeChat } from "@/components/generative-chat"

export default function ChatPage() {
  return (
    <div className="container max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Weather Chat</h1>
      <GenerativeChat />
    </div>
  )
}

