import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { Route } from "./+types/api.chat";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY || "",
});

export async function action({ request }: Route.ActionArgs) {
  try {
    console.log('Chat API called');

    const { messages } = await request.json();
    console.log('Received messages:', messages?.length);

    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error('GOOGLE_AI_API_KEY is not set');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = streamText({
      model: google("gemini-2.0-flash-exp"),
      messages,
      system: `You are an AI Accounting Assistant. You help users with:
- Financial analysis and insights
- Generating reports (P&L, expense summaries)
- Answering questions about revenue, expenses, and profit
- Explaining financial transactions and categories
- Providing guidance on document processing

Be concise, helpful, and professional. When discussing financial data:
- Use clear numbers and percentages
- Break down complex information into simple points
- Suggest actionable insights when relevant

Current capabilities:
- Access to financial transactions data
- Can generate Excel and PDF reports
- Process receipts and invoices with OCR
- Analyze trends across fiscal years and quarters`,
    });

    console.log('Streaming response');
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
