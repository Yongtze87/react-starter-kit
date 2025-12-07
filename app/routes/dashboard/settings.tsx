import { NeoCard, NeoCardContent, NeoCardDescription, NeoCardHeader, NeoCardTitle } from "~/components/ui/neo-card";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Bell, Lock, User, CreditCard, Database, Moon, Globe } from "lucide-react";
import SubscriptionStatus from "~/components/subscription-status";

const settingsSections = [
  {
    title: "Account",
    icon: User,
    items: [
      { label: "Full Name", value: "Demo User" },
      { label: "Email", value: "demo@example.com" },
      { label: "Phone", value: "+1 (555) 123-4567" },
      { label: "Company", value: "Acme Inc." },
    ]
  },
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { label: "Email Notifications", value: "Enabled" },
      { label: "Push Notifications", value: "Disabled" },
      { label: "Weekly Reports", value: "Enabled" },
      { label: "Transaction Alerts", value: "Enabled" },
    ]
  },
  {
    title: "Security",
    icon: Lock,
    items: [
      { label: "Two-Factor Auth", value: "Enabled" },
      { label: "Session Timeout", value: "30 minutes" },
      { label: "Last Password Change", value: "2 weeks ago" },
      { label: "Active Sessions", value: "2 devices" },
    ]
  },
  {
    title: "Billing",
    icon: CreditCard,
    items: [
      { label: "Current Plan", value: "Pro Plan" },
      { label: "Billing Cycle", value: "Monthly" },
      { label: "Next Payment", value: "Jan 15, 2025" },
      { label: "Payment Method", value: "•••• 4242" },
    ]
  },
  {
    title: "Data & Storage",
    icon: Database,
    items: [
      { label: "Documents Stored", value: "156 files" },
      { label: "Storage Used", value: "2.3 GB / 10 GB" },
      { label: "Last Backup", value: "Today, 3:42 AM" },
      { label: "Auto-Backup", value: "Enabled" },
    ]
  },
  {
    title: "Preferences",
    icon: Globe,
    items: [
      { label: "Language", value: "English (US)" },
      { label: "Timezone", value: "PST (UTC-8)" },
      { label: "Date Format", value: "MM/DD/YYYY" },
      { label: "Currency", value: "USD ($)" },
    ]
  },
  {
    title: "Appearance",
    icon: Moon,
    items: [
      { label: "Theme", value: "System" },
      { label: "Compact Mode", value: "Disabled" },
      { label: "Font Size", value: "Medium" },
      { label: "Animations", value: "Enabled" },
    ]
  },
];

export default function Page() {
  return (
    <div className="flex flex-col gap-3 w-full pb-4">
      {/* Subscription Status */}
      <SubscriptionStatus />

      {/* Settings Sections */}
      {settingsSections.map((section) => {
        const Icon = section.icon;
        return (
          <NeoCard key={section.title}>
            <NeoCardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-black" />
                <NeoCardTitle className="text-sm font-bold">{section.title}</NeoCardTitle>
              </div>
            </NeoCardHeader>
            <NeoCardContent className="p-3 pt-0">
              <div className="space-y-2">
                {section.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5 border-b-2 border-[#f0f0f0] last:border-0">
                    <Label className="text-xs font-semibold text-[#666]">{item.label}</Label>
                    <span className="text-xs font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 h-8 text-xs neo-btn bg-white hover:bg-[#fffef5] font-bold">
                Edit {section.title}
              </Button>
            </NeoCardContent>
          </NeoCard>
        );
      })}

      {/* Danger Zone */}
      <NeoCard className="bg-[#ffe5e5]">
        <NeoCardHeader className="p-3 pb-2">
          <NeoCardTitle className="text-sm font-bold text-[#ff6b6b]">⚠️ Danger Zone</NeoCardTitle>
          <NeoCardDescription className="text-xs font-semibold text-[#666]">
            Irreversible actions that affect your account
          </NeoCardDescription>
        </NeoCardHeader>
        <NeoCardContent className="p-3 pt-0 space-y-2">
          <Button variant="outline" size="sm" className="w-full h-8 text-xs neo-btn bg-white text-[#ff6b6b] border-[#ff6b6b] hover:bg-[#ff6b6b] hover:text-white font-bold">
            Export All Data
          </Button>
          <Button variant="outline" size="sm" className="w-full h-8 text-xs neo-btn bg-white text-[#ff6b6b] border-[#ff6b6b] hover:bg-[#ff6b6b] hover:text-white font-bold">
            Delete Account
          </Button>
        </NeoCardContent>
      </NeoCard>
    </div>
  );
}
