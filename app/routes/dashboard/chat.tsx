import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { NeoCard } from "~/components/ui/neo-card";
import { cn } from "~/lib/utils";
import { Send, Sparkles, TrendingUp, FileText, Calculator, Trash2 } from "lucide-react";

const quickPrompts = [
  {
    icon: TrendingUp,
    text: "Show revenue trends",
    prompt: "Can you show me the revenue trends for this fiscal year?",
  },
  {
    icon: FileText,
    text: "Generate P&L report",
    prompt: "Generate a profit and loss report for the current quarter",
  },
  {
    icon: Calculator,
    text: "Expense breakdown",
    prompt: "What's my expense breakdown by category this month?",
  },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const STORAGE_KEY = 'chat-history';
const MAX_STORED_MESSAGES = 10;

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingQueueRef = useRef<string[]>([]);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load conversation history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMessages(parsed);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }, []);

  // Save conversation history to localStorage (keep last 10 messages)
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // Keep only the last MAX_STORED_MESSAGES
        const messagesToStore = messages.slice(-MAX_STORED_MESSAGES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToStore));
      } catch (error) {
        console.error('Failed to save chat history:', error);
      }
    }
  }, [messages]);

  // Removed noisy render logging - React 19 strict mode causes double renders in dev

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  // Typing simulation effect
  const startTypingSimulation = (fullText: string, messageId: string) => {
    setIsTyping(true);

    // Split text into chunks (words and punctuation)
    const chunks = fullText.split(/(\s+|[.!?,;:])/g).filter(Boolean);
    typingQueueRef.current = chunks;

    let currentText = '';
    let chunkIndex = 0;

    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    typingIntervalRef.current = setInterval(() => {
      if (chunkIndex < chunks.length) {
        currentText += chunks[chunkIndex];
        chunkIndex++;

        setMessages(prev => {
          const newMessages = [...prev];
          const msgIndex = newMessages.findIndex(m => m.id === messageId);
          if (msgIndex !== -1) {
            newMessages[msgIndex].content = currentText;
          }
          return newMessages;
        });
      } else {
        // Finished typing
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setIsTyping(false);
        typingQueueRef.current = [];
      }
    }, 30); // Adjust speed: 30ms per chunk (feels natural)
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Keep focus on input after sending
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMsg = errorData?.error || `API error: ${response.status}`;
        console.error('API Error:', errorMsg);
        throw new Error(errorMsg);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiMessage = '';
      let buffer = ''; // Buffer for incomplete lines

      const assistantMessageId = (Date.now() + 1).toString();

      if (reader) {
        // Collect all chunks first (no real-time display)
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const jsonStr = line.substring(2);
                const data = JSON.parse(jsonStr);
                if (data && typeof data === 'string') {
                  aiMessage += data;
                }
              } catch (e) {
                console.error('Parse error for line:', line, e);
              }
            }
          }
        }

        // Process any remaining buffer
        if (buffer && buffer.startsWith('0:')) {
          try {
            const jsonStr = buffer.substring(2);
            const data = JSON.parse(jsonStr);
            if (data && typeof data === 'string') {
              aiMessage += data;
            }
          } catch (e) {
            console.error('Final buffer parse error:', e);
          }
        }
      }

      setIsLoading(false);

      // Add empty message first, then start typing simulation
      setMessages(prev => [...prev, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
      }]);

      // Start typing simulation with collected text
      startTypingSimulation(aiMessage, assistantMessageId);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the user message if failed
      setMessages(prev => prev.slice(0, -1));
      setInput(content); // Restore input
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
    // Focus the textarea after populating
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleClearChat = () => {
    setMessages([]);
    setInput("");
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] -mx-4 -my-4">
      {/* Messages Container */}
      <div className="flex-1 px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="bg-[#00d4a1] p-4 rounded-2xl mb-4 border-[3px] border-black" style={{boxShadow: '4px 4px 0 rgba(0, 0, 0, 1)'}}>
                <Sparkles className="w-8 h-8 text-black" />
              </div>
              <h2 className="text-xl font-extrabold mb-2 tracking-tight">AI Accounting Assistant</h2>
              <p className="text-sm font-semibold text-[#666] mb-6 max-w-xs">
                Ask me anything about your finances. I can help with reports, analysis, and more.
              </p>

              {/* Quick Prompts */}
              <div className="w-full mt-4">
                <p className="text-xs font-bold text-muted-foreground mb-3">
                  Try asking:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {quickPrompts.map((prompt, idx) => {
                    const Icon = prompt.icon;
                    return (
                      <NeoCard
                        key={idx}
                        onClick={() => handleQuickPrompt(prompt.prompt)}
                        className="flex flex-col items-center gap-2 p-2.5 cursor-pointer hover:bg-[#fffef5] transition-colors disabled:opacity-50"
                      >
                        <div className="flex-shrink-0 bg-[#00d4a1] p-2 rounded-lg border-2 border-black">
                          <Icon className="w-4 h-4 text-black" />
                        </div>
                        <span className="text-xs font-bold text-center leading-tight">{prompt.text}</span>
                      </NeoCard>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] px-4 py-3 rounded-2xl border-2 border-black",
                      message.role === "user"
                        ? "bg-[#00d4a1] text-black rounded-br-sm font-semibold"
                        : "bg-[#f9f9f9] text-foreground rounded-bl-sm font-semibold"
                    )}
                    style={{boxShadow: '3px 3px 0 rgba(0, 0, 0, 1)'}}
                  >
                    <div className="text-xs leading-relaxed prose prose-sm prose-p:my-1 prose-li:my-0.5 prose-ul:my-2 prose-ol:my-2 max-w-none dark:prose-invert">
                      <Markdown>{message.content}</Markdown>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading/Typing indicator */}
              {(isLoading || isTyping) && (
                <div className="flex justify-start">
                  <div className="bg-[#f9f9f9] px-4 py-3 rounded-2xl rounded-bl-sm border-2 border-black" style={{boxShadow: '3px 3px 0 rgba(0, 0, 0, 1)'}}>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
      </div>

      {/* Input Area - Sticky at bottom */}
      <div className="sticky bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-3">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading || isTyping}
              rows={1}
              className="min-h-[44px] max-h-32 resize-none text-base py-3 neo-input font-semibold"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            {messages.length > 0 && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleClearChat}
                className="h-[44px] w-[44px] flex-shrink-0"
                title="Clear chat"
              >
                <Trash2 className="h-5 w-5 text-[#ff6b6b]" />
              </Button>
            )}
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || isTyping || !input?.trim()}
              className="h-[44px] w-[44px] flex-shrink-0 neo-btn bg-black text-white hover:bg-black"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
          {error && (
            <div className="text-xs font-bold text-[#ff6b6b] text-center mt-2">
              Error: {error}
            </div>
          )}
          {!error && (
            <p className="text-xs font-semibold text-[#666] text-center mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
