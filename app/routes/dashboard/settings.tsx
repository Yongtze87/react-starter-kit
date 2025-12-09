import { useState } from "react";
import { NeoCard, NeoCardContent, NeoCardDescription, NeoCardHeader, NeoCardTitle } from "~/components/ui/neo-card";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Bell, Lock, User, Building2, Database, Moon, Globe, Edit2, Check, X, Shield, Key, FileText, HelpCircle } from "lucide-react";
import SubscriptionStatus from "~/components/subscription-status";

// B2B Accounting Firm Model - Mock Data
const mockUserProfile = {
  // Client info
  name: "Tan Wei Ming",
  email: "wm.tan@example.com.sg",
  phone: "+65 9123 4567",
  company: "ABC Restaurant Pte Ltd",

  // Accounting firm info
  managedBy: {
    firmName: "SteadB Accounting Services Pte Ltd",
    accountManager: "Sarah Chen",
    email: "support@steadb.com.sg",
    phone: "+65 6789 1234",
  },

  // Subscription tier
  subscription: {
    tier: "premium" as "basic" | "premium" | "enterprise",
    features: {
      basic: [
        "AI Chat Assistant",
        "Document Upload & Processing",
        "Basic Reports",
        "Email Support",
      ],
      premium: [
        "AI Chat Assistant",
        "Document Upload & Processing",
        "Basic Reports",
        "Advanced Analytics",
        "Export Reports (Excel/PDF)",
        "Priority Email Support",
      ],
      enterprise: [
        "AI Chat Assistant",
        "Document Upload & Processing",
        "Basic Reports",
        "Advanced Analytics",
        "Export Reports (Excel/PDF)",
        "Custom Integrations",
        "API Access",
        "Dedicated Account Manager",
        "Phone Support",
      ],
    },
  },

  // Security
  passwordLastChanged: "2 weeks ago",
  twoFactorEnabled: true,
  activeSessions: 2,
};

const CONSENT_KEY = 'ai-consent-given';

export default function Page() {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, Record<string, string>>>({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [aiConsentGiven, setAiConsentGiven] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(CONSENT_KEY) === 'true';
    }
    return false;
  });

  const handleEdit = (sectionTitle: string) => {
    setEditingSection(sectionTitle);
    const values: Record<string, string> = {
      "Full Name": mockUserProfile.name,
      "Email": mockUserProfile.email,
      "Phone": mockUserProfile.phone,
      "Company": mockUserProfile.company,
    };
    setEditedValues(prev => ({ ...prev, [sectionTitle]: values }));
  };

  const handleSave = (sectionTitle: string) => {
    console.log('Saving:', sectionTitle, editedValues[sectionTitle]);
    setEditingSection(null);
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditedValues({});
  };

  const handleValueChange = (sectionTitle: string, label: string, value: string) => {
    setEditedValues(prev => ({
      ...prev,
      [sectionTitle]: {
        ...prev[sectionTitle],
        [label]: value
      }
    }));
  };

  const handlePasswordChange = () => {
    setShowPasswordModal(true);
  };

  const handleAIConsentToggle = () => {
    const newValue = !aiConsentGiven;
    setAiConsentGiven(newValue);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CONSENT_KEY, newValue.toString());
    }
  };

  const handleContactSupport = () => {
    window.location.href = `mailto:${mockUserProfile.managedBy.email}`;
  };

  const isEditing = editingSection === "Account";
  const currentTier = mockUserProfile.subscription.tier;
  const currentFeatures = mockUserProfile.subscription.features[currentTier];

  return (
    <div className="flex flex-col gap-3 w-full pb-4">
      {/* Subscription Status Banner */}
      <SubscriptionStatus />

      {/* Account Section */}
      <NeoCard>
        <NeoCardHeader className="p-3 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-black" />
              <NeoCardTitle className="text-sm font-bold">Account</NeoCardTitle>
            </div>
            {isEditing && (
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleSave("Account")}
                  className="h-6 w-6"
                >
                  <Check className="h-3.5 w-3.5 text-[#00d4a1]" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCancel}
                  className="h-6 w-6"
                >
                  <X className="h-3.5 w-3.5 text-[#ff6b6b]" />
                </Button>
              </div>
            )}
          </div>
        </NeoCardHeader>
        <NeoCardContent className="p-3 pt-0">
          <div className="space-y-2">
            {[
              { label: "Full Name", value: mockUserProfile.name, editable: true },
              { label: "Email", value: mockUserProfile.email, editable: true },
              { label: "Phone", value: mockUserProfile.phone, editable: true },
              { label: "Company", value: mockUserProfile.company, editable: true },
              { label: "Managed By", value: mockUserProfile.managedBy.firmName, editable: false },
            ].map((item, idx) => {
              const currentValue = isEditing && editedValues["Account"]?.[item.label]
                ? editedValues["Account"][item.label]
                : item.value;

              return (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b-2 border-[#f0f0f0] last:border-0">
                  <Label className="text-xs font-semibold text-[#666]">{item.label}</Label>
                  {isEditing && item.editable ? (
                    <Input
                      value={currentValue}
                      onChange={(e) => handleValueChange("Account", item.label, e.target.value)}
                      className="h-7 text-xs font-bold text-right max-w-[180px] neo-input"
                    />
                  ) : (
                    <span className={`text-xs font-bold ${!item.editable ? 'text-[#999]' : ''}`}>
                      {currentValue}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => isEditing ? handleSave("Account") : handleEdit("Account")}
            className="w-full mt-3 h-8 text-xs neo-btn bg-white hover:bg-[#fffef5] font-bold"
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Save Changes
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                Edit Account
              </>
            )}
          </Button>
        </NeoCardContent>
      </NeoCard>

      {/* Accounting Firm Section */}
      <NeoCard>
        <NeoCardHeader className="p-3 pb-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-black" />
            <NeoCardTitle className="text-sm font-bold">Your Accounting Firm</NeoCardTitle>
          </div>
          <NeoCardDescription className="text-xs font-semibold text-[#666] mt-1">
            Your account is managed by this firm
          </NeoCardDescription>
        </NeoCardHeader>
        <NeoCardContent className="p-3 pt-0">
          <div className="space-y-2">
            {[
              { label: "Firm Name", value: mockUserProfile.managedBy.firmName },
              { label: "Account Manager", value: mockUserProfile.managedBy.accountManager },
              { label: "Email", value: mockUserProfile.managedBy.email },
              { label: "Phone", value: mockUserProfile.managedBy.phone },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-1.5 border-b-2 border-[#f0f0f0] last:border-0">
                <Label className="text-xs font-semibold text-[#666]">{item.label}</Label>
                <span className="text-xs font-bold">{item.value}</span>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleContactSupport}
            className="w-full mt-3 h-8 text-xs neo-btn bg-white hover:bg-[#fffef5] font-bold"
          >
            📧 Contact Support
          </Button>
        </NeoCardContent>
      </NeoCard>

      {/* Security Section */}
      <NeoCard>
        <NeoCardHeader className="p-3 pb-2">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-black" />
            <NeoCardTitle className="text-sm font-bold">Security</NeoCardTitle>
          </div>
        </NeoCardHeader>
        <NeoCardContent className="p-3 pt-0">
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1.5 border-b-2 border-[#f0f0f0]">
              <Label className="text-xs font-semibold text-[#666]">Password</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePasswordChange}
                className="h-7 text-xs font-bold text-[#00d4a1] hover:text-[#00d4a1] hover:bg-[#fffef5] px-2"
              >
                <Key className="w-3 h-3 mr-1" />
                Change
              </Button>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b-2 border-[#f0f0f0]">
              <Label className="text-xs font-semibold text-[#666]">Last Changed</Label>
              <span className="text-xs font-bold text-[#999]">{mockUserProfile.passwordLastChanged}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b-2 border-[#f0f0f0]">
              <Label className="text-xs font-semibold text-[#666]">Two-Factor Auth</Label>
              <span className="text-xs font-bold">{mockUserProfile.twoFactorEnabled ? "Enabled" : "Disabled"}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b-2 border-[#f0f0f0]">
              <Label className="text-xs font-semibold text-[#666]">Active Sessions</Label>
              <span className="text-xs font-bold">{mockUserProfile.activeSessions} devices</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <Label className="text-xs font-semibold text-[#666]">Session Timeout</Label>
              <span className="text-xs font-bold">30 minutes</span>
            </div>
          </div>
        </NeoCardContent>
      </NeoCard>

      {/* Plan Details Section */}
      <NeoCard>
        <NeoCardHeader className="p-3 pb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-black" />
            <NeoCardTitle className="text-sm font-bold">Plan Details</NeoCardTitle>
          </div>
          <NeoCardDescription className="text-xs font-semibold text-[#666] mt-1">
            Managed by {mockUserProfile.managedBy.firmName}
          </NeoCardDescription>
        </NeoCardHeader>
        <NeoCardContent className="p-3 pt-0">
          <div className="bg-[#fffef5] border-2 border-black rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold capitalize">{currentTier} Plan</span>
              <span className="text-xs font-bold bg-[#00d4a1] text-black px-2 py-1 rounded border-2 border-black">
                Active
              </span>
            </div>
            <div className="space-y-1">
              {currentFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#00d4a1] text-xs mt-0.5">✓</span>
                  <span className="text-xs font-semibold text-[#666]">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#f9f9f9] border-2 border-[#e5e5e5] rounded-lg p-2 text-center">
            <p className="text-xs font-semibold text-[#666]">
              💡 Need to upgrade? Contact your accounting firm
            </p>
          </div>
        </NeoCardContent>
      </NeoCard>

      {/* AI Assistant Consent */}
      <NeoCard>
        <NeoCardHeader className="p-3 pb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-black" />
            <NeoCardTitle className="text-sm font-bold">AI Assistant Privacy</NeoCardTitle>
          </div>
          <NeoCardDescription className="text-xs font-semibold text-[#666] mt-1">
            Control your AI chat assistant data processing
          </NeoCardDescription>
        </NeoCardHeader>
        <NeoCardContent className="p-3 pt-0">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b-2 border-[#f0f0f0]">
              <div>
                <Label className="text-xs font-semibold text-black">AI Processing Consent</Label>
                <p className="text-[10px] font-semibold text-[#666] mt-0.5">
                  Allow chat messages to be processed by Google AI
                </p>
              </div>
              <Button
                variant={aiConsentGiven ? "default" : "outline"}
                size="sm"
                onClick={handleAIConsentToggle}
                className={`h-7 text-xs font-bold ${
                  aiConsentGiven
                    ? 'neo-btn bg-[#00d4a1] text-black hover:bg-[#00d4a1]/90'
                    : 'neo-btn bg-white hover:bg-[#f9f9f9]'
                }`}
              >
                {aiConsentGiven ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
            <div className="bg-[#fffef5] border-2 border-[#e5e5e5] rounded-lg p-2">
              <p className="text-[10px] font-semibold text-[#666]">
                ℹ️ Chat history is stored temporarily in your browser session only (up to 10 messages).
                All data is automatically deleted when you close this tab.
              </p>
            </div>
          </div>
        </NeoCardContent>
      </NeoCard>

      {/* Notifications */}
      <NeoCard>
        <NeoCardHeader className="p-3 pb-2">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-black" />
            <NeoCardTitle className="text-sm font-bold">Notifications</NeoCardTitle>
          </div>
        </NeoCardHeader>
        <NeoCardContent className="p-3 pt-0">
          <div className="space-y-2">
            {[
              { label: "Email Notifications", value: "Enabled" },
              { label: "Weekly Reports", value: "Enabled" },
              { label: "Transaction Alerts", value: "Enabled" },
              { label: "Push Notifications", value: "Disabled" },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-1.5 border-b-2 border-[#f0f0f0] last:border-0">
                <Label className="text-xs font-semibold text-[#666]">{item.label}</Label>
                <span className="text-xs font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </NeoCardContent>
      </NeoCard>

      {/* Data & Privacy */}
      <NeoCard>
        <NeoCardHeader className="p-3 pb-2">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-black" />
            <NeoCardTitle className="text-sm font-bold">Data & Privacy</NeoCardTitle>
          </div>
        </NeoCardHeader>
        <NeoCardContent className="p-3 pt-0">
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1.5 border-b-2 border-[#f0f0f0]">
              <Label className="text-xs font-semibold text-[#666]">Data Scope</Label>
              <span className="text-xs font-bold">{mockUserProfile.company} only</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b-2 border-[#f0f0f0]">
              <Label className="text-xs font-semibold text-[#666]">Storage Used</Label>
              <span className="text-xs font-bold">2.3 GB / 10 GB</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b-2 border-[#f0f0f0]">
              <Label className="text-xs font-semibold text-[#666]">Last Backup</Label>
              <span className="text-xs font-bold text-[#999]">Today, 3:42 AM</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <Label className="text-xs font-semibold text-[#666]">Auto-Backup</Label>
              <span className="text-xs font-bold">Enabled</span>
            </div>
          </div>
          <div className="mt-3 bg-[#fffef5] border-2 border-[#e5e5e5] rounded-lg p-2">
            <p className="text-[10px] font-semibold text-[#666]">
              🔒 Your data is completely isolated. No other clients can access your information.
            </p>
          </div>
        </NeoCardContent>
      </NeoCard>

      {/* Preferences */}
      <NeoCard>
        <NeoCardHeader className="p-3 pb-2">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-black" />
            <NeoCardTitle className="text-sm font-bold">Preferences</NeoCardTitle>
          </div>
        </NeoCardHeader>
        <NeoCardContent className="p-3 pt-0">
          <div className="space-y-2">
            {[
              { label: "Language", value: "English (SG)" },
              { label: "Timezone", value: "SGT (UTC+8)" },
              { label: "Date Format", value: "DD/MM/YYYY" },
              { label: "Currency", value: "SGD ($)" },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-1.5 border-b-2 border-[#f0f0f0] last:border-0">
                <Label className="text-xs font-semibold text-[#666]">{item.label}</Label>
                <span className="text-xs font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </NeoCardContent>
      </NeoCard>

      {/* Appearance */}
      <NeoCard>
        <NeoCardHeader className="p-3 pb-2">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-black" />
            <NeoCardTitle className="text-sm font-bold">Appearance</NeoCardTitle>
          </div>
        </NeoCardHeader>
        <NeoCardContent className="p-3 pt-0">
          <div className="space-y-2">
            {[
              { label: "Theme", value: "System" },
              { label: "Font Size", value: "Medium" },
              { label: "Animations", value: "Enabled" },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-1.5 border-b-2 border-[#f0f0f0] last:border-0">
                <Label className="text-xs font-semibold text-[#666]">{item.label}</Label>
                <span className="text-xs font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </NeoCardContent>
      </NeoCard>

      {/* Help & Support */}
      <NeoCard>
        <NeoCardHeader className="p-3 pb-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-black" />
            <NeoCardTitle className="text-sm font-bold">Help & Support</NeoCardTitle>
          </div>
        </NeoCardHeader>
        <NeoCardContent className="p-3 pt-0 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs neo-btn bg-white hover:bg-[#fffef5] font-bold justify-start"
          >
            <FileText className="w-3.5 h-3.5 mr-2" />
            User Guide & Documentation
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleContactSupport}
            className="w-full h-8 text-xs neo-btn bg-white hover:bg-[#fffef5] font-bold justify-start"
          >
            📧 Email Your Accounting Firm
          </Button>
        </NeoCardContent>
      </NeoCard>

      {/* Account Actions */}
      <NeoCard className="bg-[#f9f9f9]">
        <NeoCardContent className="p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs neo-btn bg-white hover:bg-[#fffef5] text-[#666] border-[#e5e5e5] font-bold"
          >
            Export All My Data
          </Button>
          <p className="text-[10px] font-semibold text-[#666] text-center mt-3">
            Need to close your account? Please contact your accounting firm.
          </p>
        </NeoCardContent>
      </NeoCard>

      {/* Footer */}
      <div className="text-center py-4 space-y-2">
        <div className="flex items-center justify-center gap-3 text-[10px] font-semibold text-[#999]">
          <button className="hover:text-black">Privacy Policy</button>
          <span>•</span>
          <button className="hover:text-black">Terms of Service</button>
          <span>•</span>
          <button className="hover:text-black">PDPA Compliance</button>
        </div>
        <p className="text-[10px] font-semibold text-[#999]">
          Account managed by {mockUserProfile.managedBy.firmName}
        </p>
      </div>

      {/* Password Change Modal (placeholder) */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <NeoCard className="max-w-md w-full">
            <NeoCardHeader className="p-4">
              <NeoCardTitle className="text-base font-bold">Change Password</NeoCardTitle>
              <NeoCardDescription className="text-xs font-semibold text-[#666]">
                Enter your current and new password
              </NeoCardDescription>
            </NeoCardHeader>
            <NeoCardContent className="p-4 pt-0 space-y-3">
              <div>
                <Label className="text-xs font-semibold text-[#666]">Current Password</Label>
                <Input type="password" className="mt-1 neo-input" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-[#666]">New Password</Label>
                <Input type="password" className="mt-1 neo-input" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-[#666]">Confirm New Password</Label>
                <Input type="password" className="mt-1 neo-input" />
              </div>
              <div className="bg-[#fffef5] border-2 border-[#e5e5e5] rounded-lg p-2">
                <p className="text-[10px] font-semibold text-[#666]">
                  Password must be at least 8 characters with uppercase, lowercase, and numbers.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowPasswordModal(false)}
                  variant="outline"
                  className="flex-1 neo-btn bg-white hover:bg-[#f9f9f9] font-bold"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Handle password change
                    setShowPasswordModal(false);
                  }}
                  className="flex-1 neo-btn bg-[#00d4a1] text-black hover:bg-[#00d4a1]/90 font-bold"
                >
                  Change Password
                </Button>
              </div>
            </NeoCardContent>
          </NeoCard>
        </div>
      )}
    </div>
  );
}
