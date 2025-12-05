"use client";

import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { Send, Sparkles, TrendingUp, FileText, Calculator } from "lucide-react";

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

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  console.log('Chat render - messages:', messages.length, 'input:', input, 'isLoading:', isLoading);

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

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    console.log('Sending message:', content);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

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

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiMessage = '';

      const assistantMessageId = (Date.now() + 1).toString();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const jsonStr = line.substring(2);
                const data = JSON.parse(jsonStr);
                if (data && typeof data === 'string') {
                  aiMessage += data;
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }

          // Update message in real-time
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant' && lastMessage.id === assistantMessageId) {
              lastMessage.content = aiMessage;
            } else {
              newMessages.push({
                id: assistantMessageId,
                role: 'assistant',
                content: aiMessage,
              });
            }
            return newMessages;
          });
        }
      }

      console.log('Message sent successfully');
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
    console.log('Quick prompt clicked:', prompt);
    sendMessage(prompt);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, input:', input);
    sendMessage(input);
  };

  return (
    <div className="fixed inset-0 top-14 bottom-16 flex flex-col bg-background">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-screen-sm mx-auto px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">AI Accounting Assistant</h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Ask me anything about your finances. I can help with reports, analysis, and more.
              </p>

              {/* Quick Prompts */}
              <div className="w-full space-y-2 mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  Try asking:
                </p>
                {quickPrompts.map((prompt, idx) => {
                  const Icon = prompt.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(prompt.prompt)}
                      disabled={isLoading}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left disabled:opacity-50"
                    >
                      <div className="flex-shrink-0 bg-primary/10 p-2 rounded-lg">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{prompt.text}</span>
                    </button>
                  );
                })}
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
                      "max-w-[85%] px-4 py-3 rounded-2xl shadow-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    )}
                  >
                    <div className="text-sm leading-relaxed prose prose-sm prose-p:my-1 prose-li:my-0.5 prose-ul:my-2 prose-ol:my-2 max-w-none dark:prose-invert">
                      <Markdown>{message.content}</Markdown>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-screen-sm mx-auto px-4 py-3">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              rows={1}
              className="min-h-[44px] max-h-32 resize-none text-base py-3"
              onKeyDown={(e) => {
                console.log('Key pressed:', e.key);
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  console.log('Enter pressed, submitting');
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input?.trim()}
              className="h-[44px] w-[44px] flex-shrink-0"
              onClick={() => console.log('Send button clicked')}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
          {error && (
            <div className="text-xs text-red-600 text-center mt-2">
              Error: {error}
            </div>
          )}
          {!error && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
