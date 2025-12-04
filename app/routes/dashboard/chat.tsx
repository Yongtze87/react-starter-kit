"use client";

import { useChat } from "@ai-sdk/react";
import Markdown from "react-markdown";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      maxSteps: 10,
      api: '/api/chat',
    });

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] w-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto pb-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <h2 className="text-xl font-semibold mb-2">AI Accounting Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Ask me about your finances, upload documents, or generate reports
            </p>
          </div>
        ) : (
          messages.map((message, i) => (
            <div
              key={message.id}
              className={cn(
                "flex px-2",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] px-4 py-2 text-sm shadow-sm",
                  message.role === "user"
                    ? "bg-[#0B93F6] text-white rounded-2xl rounded-br-sm"
                    : "bg-[#E9E9EB] text-black rounded-2xl rounded-bl-sm"
                )}
              >
                {message.parts.map((part) => {
                  switch (part.type) {
                    case "text":
                      return (
                        <div
                          key={`${message.id}-${i}`}
                          className="prose-sm prose-p:my-0.5 prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1"
                        >
                          <Markdown>{part.text}</Markdown>
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Form - Fixed at bottom */}
      <form
        className="flex gap-2 items-end pt-3 border-t bg-background"
        onSubmit={handleSubmit}
      >
        <Input
          className="flex-1 min-h-[44px] text-base"
          value={input}
          placeholder="Ask about your finances..."
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="default"
          className="min-h-[44px] px-6"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? "..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
