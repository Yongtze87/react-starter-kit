import { getChatModel } from './gemini-client';
import { parseFinancialQuery, executeFinancialQuery, type ParsedQuery } from './query-parser';
import { searchFAQ } from '../supabase/queries';
import { getConversationHistory, saveMessage } from '../supabase/queries';
import { createEscalation } from '../supabase/queries';

const AI_CONFIDENCE_THRESHOLD = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD || '0.8');
const MAX_CONVERSATION_HISTORY = parseInt(process.env.MAX_CONVERSATION_HISTORY || '10');

export interface ConversationContext {
  userId: string;
  companyId: string;
  sessionId: string;
  userRole: 'client' | 'admin';
}

export interface ChatResponse {
  message: string;
  confidence: number;
  intent: string;
  needsEscalation: boolean;
  data?: any;
  suggestions?: string[];
}

/**
 * Main conversation handler - processes user messages and generates responses
 */
export async function handleConversation(
  userMessage: string,
  context: ConversationContext
): Promise<ChatResponse> {
  try {
    // 1. Get conversation history for context
    const history = await getConversationHistory(context.userId, context.sessionId, MAX_CONVERSATION_HISTORY);

    // 2. Save user message
    await saveMessage({
      user_id: context.userId,
      company_id: context.companyId,
      message_role: 'user',
      message_content: userMessage,
      session_id: context.sessionId,
    });

    // 3. Parse user query to determine intent
    const parsedQuery = await parseFinancialQuery(userMessage);

    // 4. Check if confidence is too low and escalation is needed
    if (parsedQuery.confidence < AI_CONFIDENCE_THRESHOLD && parsedQuery.intent !== 'escalation_request') {
      return await handleLowConfidence(userMessage, parsedQuery, context);
    }

    // 5. Route to appropriate handler based on intent
    let response: ChatResponse;

    switch (parsedQuery.intent) {
      case 'revenue_query':
      case 'expense_query':
      case 'profit_query':
      case 'comparison_query':
        response = await handleFinancialQuery(parsedQuery, context);
        break;

      case 'report_request':
        response = await handleReportRequest(parsedQuery, context);
        break;

      case 'faq_question':
        response = await handleFAQQuestion(userMessage, parsedQuery, context, history);
        break;

      case 'escalation_request':
        response = await handleEscalationRequest(userMessage, context);
        break;

      case 'document_upload':
        response = {
          message:
            'To upload a document, please use the upload button in the chat interface or drag and drop your file. I can process PDFs, images, Excel files, and Word documents up to 10MB.',
          confidence: 1.0,
          intent: 'document_upload',
          needsEscalation: false,
          suggestions: ['Upload invoice', 'Upload receipt', 'Upload bank statement'],
        };
        break;

      case 'general_chat':
      default:
        response = await handleGeneralChat(userMessage, context, history);
        break;
    }

    // 6. Save assistant response
    await saveMessage({
      user_id: context.userId,
      company_id: context.companyId,
      message_role: 'assistant',
      message_content: response.message,
      session_id: context.sessionId,
      message_metadata: {
        intent: response.intent,
        confidence: response.confidence,
        needsEscalation: response.needsEscalation,
      },
    });

    return response;
  } catch (error) {
    console.error('Error in conversation handler:', error);

    // Save error and escalate
    await createEscalation({
      company_id: context.companyId,
      user_id: context.userId,
      query_text: userMessage,
      ai_confidence: 0,
      reason: `System error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });

    return {
      message:
        "I apologize, but I encountered an error processing your request. I've notified our accounting team, and they will reach out to you shortly. Is there anything else I can help you with?",
      confidence: 0,
      intent: 'error',
      needsEscalation: true,
    };
  }
}

/**
 * Handle financial data queries
 */
async function handleFinancialQuery(
  parsedQuery: ParsedQuery,
  context: ConversationContext
): Promise<ChatResponse> {
  try {
    const result = await executeFinancialQuery(context.companyId, parsedQuery);

    return {
      message: result.summary,
      confidence: parsedQuery.confidence,
      intent: parsedQuery.intent,
      needsEscalation: false,
      data: result.data,
      suggestions: ['Show me more details', 'Generate a report', 'Compare to another year'],
    };
  } catch (error) {
    console.error('Error executing financial query:', error);
    return {
      message:
        "I couldn't retrieve that financial data. Let me connect you with an accountant who can help.",
      confidence: 0,
      intent: parsedQuery.intent,
      needsEscalation: true,
    };
  }
}

/**
 * Handle report generation requests
 */
async function handleReportRequest(
  parsedQuery: ParsedQuery,
  context: ConversationContext
): Promise<ChatResponse> {
  const { reportType, fiscalYear, format } = parsedQuery.parameters;

  const year = fiscalYear || new Date().getFullYear();
  const fileFormat = format || 'excel';

  return {
    message: `I'll generate your ${reportType === 'profit_loss' ? 'Profit & Loss' : reportType} report for ${year} in ${fileFormat.toUpperCase()} format. Please give me a moment...`,
    confidence: parsedQuery.confidence,
    intent: 'report_request',
    needsEscalation: false,
    data: {
      reportType,
      year,
      format: fileFormat,
      status: 'generating',
    },
    suggestions: ['Request different format', 'Request different year'],
  };
}

/**
 * Handle FAQ questions using RAG
 */
async function handleFAQQuestion(
  userMessage: string,
  parsedQuery: ParsedQuery,
  context: ConversationContext,
  history: any[]
): Promise<ChatResponse> {
  try {
    // Extract keywords from user message
    const keywords = extractKeywords(userMessage);

    // Search FAQ database
    const faqs = await searchFAQ(keywords);

    if (faqs.length > 0) {
      // Use the highest priority FAQ
      const topFAQ = faqs[0];

      return {
        message: topFAQ.answer,
        confidence: 0.9,
        intent: 'faq_question',
        needsEscalation: false,
        data: {
          category: topFAQ.category,
          question: topFAQ.question,
        },
        suggestions: ['Ask another question', 'Speak with an accountant'],
      };
    }

    // If no FAQ match, use AI to generate response
    return await generateAIResponse(userMessage, context, history);
  } catch (error) {
    console.error('Error handling FAQ:', error);
    return await generateAIResponse(userMessage, context, history);
  }
}

/**
 * Handle escalation requests
 */
async function handleEscalationRequest(
  userMessage: string,
  context: ConversationContext
): Promise<ChatResponse> {
  // Create escalation record
  await createEscalation({
    company_id: context.companyId,
    user_id: context.userId,
    query_text: userMessage,
    ai_confidence: 1.0,
    reason: 'User requested human assistance',
  });

  return {
    message:
      "I understand you'd like to speak with an accountant. I've notified our team, and someone will reach out to you within 2 business hours during office hours (Monday-Friday, 9am-6pm EST). In the meantime, I'm here to help with any other questions you may have.",
    confidence: 1.0,
    intent: 'escalation_request',
    needsEscalation: true,
    suggestions: ['Check office hours', 'Ask another question', 'View FAQs'],
  };
}

/**
 * Handle general chat using AI
 */
async function handleGeneralChat(
  userMessage: string,
  context: ConversationContext,
  history: any[]
): Promise<ChatResponse> {
  return await generateAIResponse(userMessage, context, history);
}

/**
 * Handle low confidence responses
 */
async function handleLowConfidence(
  userMessage: string,
  parsedQuery: ParsedQuery,
  context: ConversationContext
): Promise<ChatResponse> {
  // Create escalation for review
  await createEscalation({
    company_id: context.companyId,
    user_id: context.userId,
    query_text: userMessage,
    ai_confidence: parsedQuery.confidence,
    reason: `Low confidence (${(parsedQuery.confidence * 100).toFixed(0)}%) - requires human review`,
  });

  return {
    message:
      "I'm not entirely sure I understood your question correctly. I've flagged this for one of our accountants to review. They'll get back to you shortly. Could you rephrase your question, or is there something else I can help you with?",
    confidence: parsedQuery.confidence,
    intent: parsedQuery.intent,
    needsEscalation: true,
    suggestions: ['Rephrase question', 'View FAQs', 'Speak with accountant'],
  };
}

/**
 * Generate AI response using Gemini
 */
async function generateAIResponse(
  userMessage: string,
  context: ConversationContext,
  history: any[]
): Promise<ChatResponse> {
  const model = getChatModel();

  // Build conversation context
  const conversationContext = history
    .map((msg) => `${msg.message_role === 'user' ? 'User' : 'Assistant'}: ${msg.message_content}`)
    .join('\n');

  const systemPrompt = `You are a helpful AI assistant for an accounting firm. You provide 24/7 support to clients.

Your capabilities:
- Answer questions about financial data
- Generate reports (P&L, expense reports, etc.)
- Process document uploads
- Answer common accounting questions
- Escalate complex queries to human accountants

Guidelines:
- Be professional, friendly, and concise
- Use proper currency formatting ($X,XXX)
- If unsure, suggest escalating to a human accountant
- Stay within accounting/finance topics
- Don't provide tax advice or make financial recommendations

Conversation history:
${conversationContext}

User: ${userMessage}

Respond in a helpful, professional manner. Keep your response under 200 words.`;

  try {
    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text().trim();

    return {
      message: text,
      confidence: 0.85,
      intent: 'general_chat',
      needsEscalation: false,
      suggestions: ['Ask about financials', 'Request a report', 'Speak with accountant'],
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    return {
      message:
        "I apologize, but I'm having trouble generating a response right now. Would you like me to connect you with a human accountant?",
      confidence: 0,
      intent: 'error',
      needsEscalation: true,
    };
  }
}

/**
 * Extract keywords from user message for FAQ search
 */
function extractKeywords(message: string): string[] {
  const stopWords = new Set([
    'a',
    'an',
    'and',
    'are',
    'as',
    'at',
    'be',
    'by',
    'for',
    'from',
    'has',
    'he',
    'in',
    'is',
    'it',
    'its',
    'of',
    'on',
    'that',
    'the',
    'to',
    'was',
    'will',
    'with',
    'what',
    'when',
    'where',
    'who',
    'can',
    'you',
    'your',
    'do',
    'does',
    'my',
    'me',
    'i',
  ]);

  const words = message
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  return [...new Set(words)]; // Remove duplicates
}