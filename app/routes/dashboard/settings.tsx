import { useState } from "react";
import { NeoCard, NeoCardContent, NeoCardDescription, NeoCardHeader, NeoCardTitle } from "~/components/ui/neo-card";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Bell, Lock, User, CreditCard, Database, Moon, Globe, Edit2, Check, X } from "lucide-react";
import SubscriptionStatus from "~/components/subscription-status";

const settingsSections = [
  {
    title: "Account",
    icon: User,
    items: [
      { label: "Full Name", value: "Tan Wei Ming", editable: true },
      { label: "Email", value: "wm.tan@example.com.sg", editable: true },
      { label: "Phone", value: "+65 9123 4567", editable: true },
      { label: "Company", value: "ABC Restaurant Pte Ltd", editable: true },
    ]
  },
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { label: "Email Notifications", value: "Enabled", editable: false },
      { label: "Push Notifications", value: "Disabled", editable: false },
      { label: "Weekly Reports", value: "Enabled", editable: false },
      { label: "Transaction Alerts", value: "Enabled", editable: false },
    ]
  },
  {
    title: "Security",
    icon: Lock,
    items: [
      { label: "Two-Factor Auth", value: "Enabled", editable: false },
      { label: "Session Timeout", value: "30 minutes", editable: false },
      { label: "Last Password Change", value: "2 weeks ago", editable: false },
      { label: "Active Sessions", value: "2 devices", editable: false },
    ]
  },
  {
    title: "Billing",
    icon: CreditCard,
    items: [
      { label: "Current Plan", value: "Pro Plan", editable: false },
      { label: "Billing Cycle", value: "Monthly", editable: false },
      { label: "Next Payment", value: "Jan 15, 2025", editable: false },
      { label: "Payment Method", value: "•••• 1234", editable: false },
    ]
  },
  {
    title: "Data & Storage",
    icon: Database,
    items: [
      { label: "Documents Stored", value: "156 files", editable: false },
      { label: "Storage Used", value: "2.3 GB / 10 GB", editable: false },
      { label: "Last Backup", value: "Today, 3:42 AM", editable: false },
      { label: "Auto-Backup", value: "Enabled", editable: false },
    ]
  },
  {
    title: "Preferences",
    icon: Globe,
    items: [
      { label: "Language", value: "English (SG)", editable: false },
      { label: "Timezone", value: "SGT (UTC+8)", editable: false },
      { label: "Date Format", value: "DD/MM/YYYY", editable: false },
      { label: "Currency", value: "SGD ($)", editable: false },
    ]
  },
  {
    title: "Appearance",
    icon: Moon,
    items: [
      { label: "Theme", value: "System", editable: false },
      { label: "Compact Mode", value: "Disabled", editable: false },
      { label: "Font Size", value: "Medium", editable: false },
      { label: "Animations", value: "Enabled", editable: false },
    ]
  },
];

export default function Page() {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, Record<string, string>>>({});

  const handleEdit = (sectionTitle: string) => {
    setEditingSection(sectionTitle);
    // Initialize edited values with current values
    const section = settingsSections.find(s => s.title === sectionTitle);
    if (section) {
      const values: Record<string, string> = {};
      section.items.forEach(item => {
        values[item.label] = item.value;
      });
      setEditedValues(prev => ({ ...prev, [sectionTitle]: values }));
    }
  };

  const handleSave = (sectionTitle: string) => {
    // In a real app, this would save to backend
    console.log('Saving:', sectionTitle, editedValues[sectionTitle]);
    setEditingSection(null);
    // Here you would typically update the actual data source
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

  return (
    <div className="flex flex-col gap-3 w-full pb-4">
      {/* Subscription Status */}
      <SubscriptionStatus />

      {/* Settings Sections */}
      {settingsSections.map((section) => {
        const Icon = section.icon;
        const isEditing = editingSection === section.title;
        const isAccountSection = section.title === "Account";

        return (
          <NeoCard key={section.title}>
            <NeoCardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-black" />
                  <NeoCardTitle className="text-sm font-bold">{section.title}</NeoCardTitle>
                </div>
                {isAccountSection && isEditing && (
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleSave(section.title)}
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
                {section.items.map((item, idx) => {
                  const currentValue = isEditing && editedValues[section.title]
                    ? editedValues[section.title][item.label] || item.value
                    : item.value;

                  return (
                    <div key={idx} className="flex justify-between items-center py-1.5 border-b-2 border-[#f0f0f0] last:border-0">
                      <Label className="text-xs font-semibold text-[#666]">{item.label}</Label>
                      {isEditing && item.editable ? (
                        <Input
                          value={currentValue}
                          onChange={(e) => handleValueChange(section.title, item.label, e.target.value)}
                          className="h-7 text-xs font-bold text-right max-w-[180px] neo-input"
                        />
                      ) : (
                        <span className="text-xs font-bold">{currentValue}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {isAccountSection && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isEditing ? handleSave(section.title) : handleEdit(section.title)}
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
                      Edit {section.title}
                    </>
                  )}
                </Button>
              )}
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
