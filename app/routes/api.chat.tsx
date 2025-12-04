import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { Route } from "./+types/api.chat";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_API_KEY || "",
});

export async function action({ request }: Route.ActionArgs) {
  const { messages } = await request.json();

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

  return result.toDataStreamResponse();
}
