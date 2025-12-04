import type { ActionFunctionArgs } from 'react-router';
import { json } from 'react-router';
import { handleConversation } from '~/lib/ai';
import { getCurrentUserProfile } from '~/lib/supabase';

/**
 * Chat API endpoint
 * POST /api/chat
 * Body: { message: string, sessionId: string }
 */
export async function action({ request }: ActionFunctionArgs) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Get current user
    const userProfile = await getCurrentUserProfile();

    if (!userProfile || !userProfile.profile) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { message, sessionId } = body;

    // Validate input
    if (!message || typeof message !== 'string') {
      return json({ error: 'Message is required' }, { status: 400 });
    }

    if (!sessionId || typeof sessionId !== 'string') {
      return json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Check message length
    const maxLength = parseInt(process.env.MAX_MESSAGE_LENGTH || '500');
    if (message.length > maxLength) {
      return json(
        { error: `Message too long. Maximum ${maxLength} characters allowed.` },
        { status: 400 }
      );
    }

    // Process message with AI
    const response = await handleConversation(message, {
      userId: userProfile.profile.id,
      companyId: userProfile.profile.company_id,
      sessionId,
      userRole: userProfile.profile.role,
    });

    return json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error in chat API:', error);

    return json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS preflight
export async function loader() {
  return json({ error: 'Method not allowed. Use POST.' }, { status: 405 });
}
