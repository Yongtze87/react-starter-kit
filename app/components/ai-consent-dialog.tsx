import { useState } from 'react';
import { Button } from './ui/button';
import { NeoCard, NeoCardContent, NeoCardHeader, NeoCardTitle, NeoCardDescription } from './ui/neo-card';
import { Shield, AlertCircle } from 'lucide-react';

interface AIConsentDialogProps {
  onAccept: () => void;
  onDecline: () => void;
}

/**
 * AI Processing Consent Dialog
 *
 * Required for PDPA/GDPR compliance when processing user data with AI.
 * Informs users about data processing and obtains explicit consent.
 */
export function AIConsentDialog({ onAccept, onDecline }: AIConsentDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <NeoCard className="max-w-md w-full bg-white">
        <NeoCardHeader className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-[#00d4a1] p-2 rounded-lg border-2 border-black">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <NeoCardTitle className="text-base font-bold">
              AI Assistant Privacy Notice
            </NeoCardTitle>
          </div>
          <NeoCardDescription className="text-sm font-semibold text-[#666]">
            Before you continue, please review how we process your data
          </NeoCardDescription>
        </NeoCardHeader>

        <NeoCardContent className="p-4 pt-0 space-y-4">
          {/* Information Section */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-[#666] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold mb-1">What data is processed?</h4>
                <p className="text-xs font-semibold text-[#666]">
                  Your chat messages are sent to Google's Gemini AI to generate responses.
                  This may include financial information you share in the conversation.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-[#666] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold mb-1">How is it stored?</h4>
                <p className="text-xs font-semibold text-[#666]">
                  Chat history is stored temporarily in your browser session only (up to 10 messages).
                  All data is automatically deleted when you close this tab.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-[#666] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold mb-1">Third-party processing</h4>
                <p className="text-xs font-semibold text-[#666]">
                  Google AI processes your messages to provide responses. Google's privacy policy
                  and terms of service apply to this processing.
                </p>
              </div>
            </div>
          </div>

          {/* Consent Notice */}
          <div className="bg-[#fffef5] border-2 border-black rounded-lg p-3">
            <p className="text-xs font-bold">
              By clicking "I Understand & Agree", you consent to:
            </p>
            <ul className="text-xs font-semibold text-[#666] mt-2 space-y-1 ml-4 list-disc">
              <li>Processing of your messages by Google Gemini AI</li>
              <li>Temporary storage of chat history in your browser</li>
              <li>Sharing financial information at your own discretion</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={onAccept}
              className="w-full neo-btn bg-[#00d4a1] hover:bg-[#00d4a1]/90 text-black font-bold"
            >
              <Shield className="w-4 h-4 mr-2" />
              I Understand & Agree
            </Button>
            <Button
              onClick={onDecline}
              variant="outline"
              className="w-full neo-btn bg-white hover:bg-[#f9f9f9] font-bold"
            >
              Decline
            </Button>
          </div>

          <p className="text-[10px] font-semibold text-[#666] text-center">
            You can clear your chat history at any time using the trash button.
          </p>
        </NeoCardContent>
      </NeoCard>
    </div>
  );
}
