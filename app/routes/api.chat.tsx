import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { Route } from "./+types/api.chat";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY || "",
});

export async function action({ request }: Route.ActionArgs) {
  try {
    console.log('Chat API called');
    console.log('API Key present:', !!process.env.GOOGLE_AI_API_KEY);
    console.log('API Key length:', process.env.GOOGLE_AI_API_KEY?.length || 0);

    const { messages } = await request.json();
    console.log('Received messages:', messages?.length);

    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('GOOGLE_AI_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await streamText({
      model: google("gemini-2.0-flash-exp"),
      messages,
      system: `You are a financial chatbot assistant. Keep responses SHORT and DIRECT.

Rules:
- Give answers in 1-3 sentences MAX
- Use bullet points for lists
- Show numbers and data when relevant
- Skip pleasantries and filler words
- Be conversational, not formal
- NEVER ask follow-up questions or suggest additional actions
- Just answer what the user asks - nothing more
- Don't offer to create charts, reports, or additional analysis unless explicitly asked

Examples:
User: "What's my 2024 revenue?"
You: "2024 revenue: $458,320 (↑23% vs PY)"

User: "Show me revenue trends"
You: "Revenue trends this year:
• Q1: $124,563
• Q2: $132,890
• Q3: $145,230
• Q4: $142,450"

User: "Top expenses this month"
You: "Top expenses:
• Payroll: $45,200
• Rent: $12,000
• Marketing: $8,500
Total: $82,345"

Stay brief. Answer directly. No follow-up questions. No suggestions.`,
    });

    console.log('Streaming response');

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            // Properly escape the chunk for JSON
            const escapedChunk = chunk
              .replace(/\\/g, '\\\\')
              .replace(/"/g, '\\"')
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/\t/g, '\\t');
            const data = `0:"${escapedChunk}"\n`;
            controller.enqueue(encoder.encode(data));
            console.log('Sent chunk:', chunk.substring(0, 50)); // Debug log
          }
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
