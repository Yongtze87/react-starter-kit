import { useState } from "react";
import { NeoCard, NeoCardContent, NeoCardDescription, NeoCardHeader, NeoCardTitle } from "~/components/ui/neo-card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Users, Building2, Mail, Phone, Crown, Star, Zap, Search, List, LayoutGrid } from "lucide-react";

// Mock data
const mockClients = [
  {
    id: "1",
    name: "Tan Wei Ming",
    email: "wm.tan@example.com.sg",
    phone: "+65 9123 4567",
    company: "ABC Restaurant Pte Ltd",
    tier: "premium" as const,
    lastActive: "2 hours ago",
    documentsUploaded: 12,
    queriesResolved: 8,
  },
  {
    id: "2",
    name: "Sarah Lim",
    email: "sarah@xyztrading.com.sg",
    phone: "+65 8234 5678",
    company: "XYZ Trading Pte Ltd",
    tier: "basic" as const,
    lastActive: "1 day ago",
    documentsUploaded: 5,
    queriesResolved: 3,
  },
  {
    id: "3",
    name: "John Tan",
    email: "john@techstartup.sg",
    phone: "+65 9345 6789",
    company: "Tech Startup Pte Ltd",
    tier: "enterprise" as const,
    lastActive: "3 hours ago",
    documentsUploaded: 24,
    queriesResolved: 15,
  },
];

const tierConfig = {
  basic: { label: "Basic", color: "bg-[#e5e5e5] text-black", icon: Zap },
  premium: { label: "Premium", color: "bg-[#00d4a1] text-black", icon: Star },
  enterprise: { label: "Enterprise", color: "bg-[#ff9800] text-white", icon: Crown },
};

export default function AdminClients() {
  const [viewMode, setViewMode] = useState<"detailed" | "list">("detailed");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter clients based on search query
  const filteredClients = mockClients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.company.toLowerCase().includes(query) ||
      client.phone.includes(query)
    );
  });

  return (
    <div className="flex flex-col gap-3 w-full pb-4">
      {/* Header */}
      <NeoCard className="bg-[#fffef5]">
        <NeoCardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Client Management</h2>
              <p className="text-xs font-semibold text-[#666]">Manage accounts and subscriptions</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{mockClients.length}</div>
              <div className="text-[10px] font-semibold text-[#666] uppercase">Active Clients</div>
            </div>
          </div>
        </NeoCardContent>
      </NeoCard>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
        <Input
          type="text"
          placeholder="Search by name, email, company, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 neo-input h-10 text-sm font-semibold"
        />
      </div>

      {/* View Toggle and Add Button */}
      <div className="flex gap-2">
        <div className="flex gap-1 flex-1">
          <Button
            onClick={() => setViewMode("detailed")}
            size="sm"
            className={`flex-1 neo-btn font-bold text-xs h-9 ${
              viewMode === "detailed"
                ? "bg-[#00d4a1] text-black hover:bg-[#00d4a1]/90"
                : "bg-white text-black hover:bg-[#f9f9f9]"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 mr-1" />
            Detailed
          </Button>
          <Button
            onClick={() => setViewMode("list")}
            size="sm"
            className={`flex-1 neo-btn font-bold text-xs h-9 ${
              viewMode === "list"
                ? "bg-[#00d4a1] text-black hover:bg-[#00d4a1]/90"
                : "bg-white text-black hover:bg-[#f9f9f9]"
            }`}
          >
            <List className="w-3.5 h-3.5 mr-1" />
            List
          </Button>
        </div>
        <Button className="neo-btn bg-[#ff9800] hover:bg-[#ff9800]/90 text-white font-bold text-xs h-9 px-4">
          + Add
        </Button>
      </div>

      {/* Clients Display */}
      {filteredClients.length === 0 ? (
        <NeoCard>
          <NeoCardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-[#ccc]" />
            <p className="text-sm font-bold text-[#999]">
              {searchQuery ? "No clients found" : "No clients yet"}
            </p>
            <p className="text-xs font-semibold text-[#999] mt-1">
              {searchQuery ? "Try a different search term" : "Add your first client to get started"}
            </p>
          </NeoCardContent>
        </NeoCard>
      ) : viewMode === "detailed" ? (
        // Detailed View
        filteredClients.map((client) => {
          const tierInfo = tierConfig[client.tier];
          const TierIcon = tierInfo.icon;

          return (
            <NeoCard key={client.id}>
              <NeoCardHeader className="p-3 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <NeoCardTitle className="text-sm font-bold">{client.name}</NeoCardTitle>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 ${tierInfo.color}`}>
                        <TierIcon className="w-3 h-3" />
                        {tierInfo.label}
                      </span>
                    </div>
                    <NeoCardDescription className="text-xs font-semibold text-[#666] flex items-center gap-1 mt-1">
                      <Building2 className="w-3 h-3" />
                      {client.company}
                    </NeoCardDescription>
                  </div>
                </div>
              </NeoCardHeader>
              <NeoCardContent className="p-3 pt-0 space-y-3">
                {/* Contact Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <Mail className="w-3.5 h-3.5 text-[#666]" />
                    <span className="font-semibold text-[#666]">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Phone className="w-3.5 h-3.5 text-[#666]" />
                    <span className="font-semibold text-[#666]">{client.phone}</span>
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 bg-[#f9f9f9] border-2 border-[#e5e5e5] rounded text-center">
                    <div className="text-lg font-bold">{client.documentsUploaded}</div>
                    <div className="text-[10px] font-semibold text-[#666]">Documents</div>
                  </div>
                  <div className="p-2 bg-[#f9f9f9] border-2 border-[#e5e5e5] rounded text-center">
                    <div className="text-lg font-bold">{client.queriesResolved}</div>
                    <div className="text-[10px] font-semibold text-[#666]">Queries</div>
                  </div>
                  <div className="p-2 bg-[#f9f9f9] border-2 border-[#e5e5e5] rounded text-center">
                    <div className="text-[10px] font-bold text-[#666] mb-1">LAST SEEN</div>
                    <div className="text-[10px] font-semibold">{client.lastActive}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 neo-btn bg-white hover:bg-[#f9f9f9] font-bold text-xs h-8"
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 neo-btn bg-white hover:bg-[#f9f9f9] font-bold text-xs h-8"
                  >
                    Change Tier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="neo-btn bg-white hover:bg-[#f9f9f9] font-bold text-xs h-8"
                  >
                    Reset Password
                  </Button>
                </div>
              </NeoCardContent>
            </NeoCard>
          );
        })
      ) : (
        // List View (Concise)
        <NeoCard>
          <NeoCardContent className="p-0">
            {filteredClients.map((client, index) => {
              const tierInfo = tierConfig[client.tier];
              const TierIcon = tierInfo.icon;
              const isLast = index === filteredClients.length - 1;

              return (
                <div
                  key={client.id}
                  className={`p-3 flex items-center justify-between ${!isLast ? "border-b-2 border-[#e5e5e5]" : ""}`}
                >
                  {/* Left: Client Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold truncate">{client.name}</span>
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded flex items-center gap-0.5 flex-shrink-0 ${tierInfo.color}`}>
                        <TierIcon className="w-2.5 h-2.5" />
                        {tierInfo.label.charAt(0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3 text-[#999] flex-shrink-0" />
                      <span className="text-[10px] font-semibold text-[#999] truncate">{client.company}</span>
                    </div>
                  </div>

                  {/* Right: Quick Stats & Action */}
                  <div className="flex items-center gap-2 ml-2">
                    <div className="text-right">
                      <div className="text-xs font-bold">{client.documentsUploaded} docs</div>
                      <div className="text-[9px] font-semibold text-[#999]">{client.lastActive}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="neo-btn bg-white hover:bg-[#f9f9f9] font-bold text-[10px] h-7 px-2"
                    >
                      View
                    </Button>
                  </div>
                </div>
              );
            })}
          </NeoCardContent>
        </NeoCard>
      )}
    </div>
  );
}
