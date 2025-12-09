import { NeoCard, NeoCardContent, NeoCardDescription, NeoCardHeader, NeoCardTitle } from "~/components/ui/neo-card";
import { Button } from "~/components/ui/button";
import { Inbox, MessageSquare, Clock, User } from "lucide-react";

// Mock data
const mockQueries = [
  {
    id: "1",
    clientName: "Tan Wei Ming",
    clientCompany: "ABC Restaurant Pte Ltd",
    query: "What's my GST liability for Q4 2024?",
    timestamp: "1 hour ago",
    status: "unresolved" as const,
  },
  {
    id: "2",
    clientName: "Sarah Lim",
    clientCompany: "XYZ Trading Pte Ltd",
    query: "Can I claim this expense for tax purposes?",
    timestamp: "3 hours ago",
    status: "unresolved" as const,
  },
];

export default function AdminQueries() {
  const unresolvedCount = mockQueries.filter((q) => q.status === "unresolved").length;

  return (
    <div className="flex flex-col gap-3 w-full pb-4">
      {/* Header */}
      <NeoCard className="bg-[#fffef5]">
        <NeoCardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Client Queries</h2>
              <p className="text-xs font-semibold text-[#666]">AI couldn't answer these questions</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#ff9800]">{unresolvedCount}</div>
              <div className="text-[10px] font-semibold text-[#666] uppercase">Unresolved</div>
            </div>
          </div>
        </NeoCardContent>
      </NeoCard>

      {/* Queries List */}
      {mockQueries.map((query) => (
        <NeoCard key={query.id} className="bg-[#fff9e6]">
          <NeoCardHeader className="p-3 pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#666]" />
                  <NeoCardTitle className="text-sm font-bold">{query.clientName}</NeoCardTitle>
                  <span className="px-2 py-0.5 bg-[#ff9800] text-white text-[10px] font-bold rounded">
                    NEW
                  </span>
                </div>
                <NeoCardDescription className="text-xs font-semibold text-[#666]">
                  {query.clientCompany}
                </NeoCardDescription>
              </div>
            </div>
          </NeoCardHeader>
          <NeoCardContent className="p-3 pt-0 space-y-3">
            {/* Query Message */}
            <div className="p-3 bg-white border-2 border-black rounded">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-[#666] flex-shrink-0 mt-0.5" />
                <p className="text-xs font-semibold">{query.query}</p>
              </div>
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-1 text-[10px] font-semibold text-[#666]">
              <Clock className="w-3 h-3" />
              {query.timestamp}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 neo-btn bg-[#00d4a1] hover:bg-[#00d4a1]/90 text-black font-bold text-xs h-8"
              >
                Reply to Client
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="neo-btn bg-white hover:bg-[#f9f9f9] font-bold text-xs h-8"
              >
                View Chat History
              </Button>
            </div>
          </NeoCardContent>
        </NeoCard>
      ))}

      {mockQueries.length === 0 && (
        <NeoCard>
          <NeoCardContent className="p-8 text-center">
            <Inbox className="w-12 h-12 mx-auto mb-3 text-[#ccc]" />
            <p className="text-sm font-bold text-[#999]">No unresolved queries</p>
            <p className="text-xs font-semibold text-[#999] mt-1">AI is handling all client questions</p>
          </NeoCardContent>
        </NeoCard>
      )}
    </div>
  );
}
