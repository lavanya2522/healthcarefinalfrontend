import { useState } from "react";
import { Send, Bot, User, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "bot";
  content: string;
}

const quickResponses: Record<string, string> = {
  "headache": "For headaches, try resting in a quiet dark room, staying hydrated, and taking over-the-counter pain relief. If severe or persistent, please use our Predict feature or consult a doctor.",
  "fever": "For fever, rest and stay hydrated. Take acetaminophen or ibuprofen as directed. Seek medical attention if fever exceeds 103°F (39.4°C) or lasts more than 3 days.",
  "cold": "For common cold symptoms, rest, drink warm fluids, and use a humidifier. Most colds resolve in 7-10 days. Use our Predict feature for a detailed assessment.",
  "cough": "For coughs, try honey and warm liquids. Avoid irritants. If cough persists beyond 2 weeks or produces blood, seek medical attention immediately.",
  "stomach": "For stomach issues, try the BRAT diet (bananas, rice, applesauce, toast). Stay hydrated with small sips. Consult a doctor if symptoms are severe.",
  "sleep": "For better sleep: maintain a consistent schedule, avoid screens before bed, keep your room cool and dark, and limit caffeine after noon.",
  "stress": "To manage stress: practice deep breathing, exercise regularly, maintain social connections, and consider mindfulness meditation. Professional support is always available.",
};

const getResponse = (input: string): string => {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(quickResponses)) {
    if (lower.includes(key)) return response;
  }
  return "I can help with basic health queries! Try asking about headaches, fever, cold, cough, stomach issues, sleep, or stress. For symptom-based disease prediction, please use our **Predict** feature.";
};

const HealthChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "👋 Hi! I'm your health assistant. Ask me about common health concerns, or use the **Predict** feature for symptom-based disease prediction." },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    const botMsg: Message = { role: "bot", content: getResponse(input) };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-elevated gradient-primary text-primary-foreground transition-transform hover:scale-110 active:scale-95"
        aria-label="Open health assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-elevated animate-slide-up overflow-hidden">
          <div className="flex items-center gap-2 gradient-primary p-4 text-primary-foreground">
            <Bot className="h-5 w-5" />
            <span className="font-display font-semibold text-sm">Health Assistant</span>
          </div>

          <div className="h-72 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "bot" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "gradient-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                }`}>
                  {m.content}
                </div>
                {m.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 border-t border-border p-3">
            <Input
              placeholder="Ask a health question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <Button size="icon" onClick={send} className="gradient-primary text-primary-foreground shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default HealthChatbot;
