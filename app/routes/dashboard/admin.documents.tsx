import { useState, useEffect } from "react";
import { NeoCard, NeoCardContent, NeoCardDescription, NeoCardHeader, NeoCardTitle } from "~/components/ui/neo-card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { FileText, Download, Eye, CheckCircle, AlertCircle, Calendar, DollarSign, Building } from "lucide-react";

// Mock data - TODO: Replace with actual API calls
const mockDocuments = [
  {
    id: "1",
    clientName: "Tan Wei Ming",
    clientCompany: "ABC Restaurant Pte Ltd",
    fileName: "receipt-yakun.jpg",
    fileSize: "247 KB",
    uploadedAt: "2 hours ago",
    fileUrl: "#",
    status: "pending" as const,
    extractedData: {
      vendor: "Ya Kun Kaya Toast",
      date: "2024-01-15",
      amount: 12.50,
      gst: 1.04,
      category: "Meals & Entertainment",
      confidence: 0.94,
    },
    journalEntriesUrl: "#",
  },
  {
    id: "2",
    clientName: "Sarah Lim",
    clientCompany: "XYZ Trading Pte Ltd",
    fileName: "invoice-supplier.pdf",
    fileSize: "1.2 MB",
    uploadedAt: "5 hours ago",
    fileUrl: "#",
    status: "pending" as const,
    extractedData: {
      vendor: "ABC Suppliers Pte Ltd",
      date: "2024-01-10",
      amount: 1000.00,
      gst: 90.00,
      category: "Purchases",
      confidence: 0.68,
    },
    journalEntriesUrl: "#",
  },
  {
    id: "3",
    clientName: "John Tan",
    clientCompany: "Tech Startup Pte Ltd",
    fileName: "receipt-office-supplies.jpg",
    fileSize: "532 KB",
    uploadedAt: "1 day ago",
    fileUrl: "#",
    status: "processed" as const,
    extractedData: {
      vendor: "Popular Bookstore",
      date: "2024-01-14",
      amount: 85.50,
      gst: 7.09,
      category: "Office Expenses",
      confidence: 0.89,
    },
    journalEntriesUrl: "#",
  },
];

export default function AdminDocuments() {
  const [filter, setFilter] = useState<"all" | "pending" | "processed">("pending");
  const [documents, setDocuments] = useState(mockDocuments);

  const filteredDocs = documents.filter((doc) => {
    if (filter === "all") return true;
    return doc.status === filter;
  });

  const pendingCount = documents.filter((d) => d.status === "pending").length;

  const handleDownloadExcel = (doc: typeof mockDocuments[0]) => {
    // TODO: Implement actual download from Supabase storage
    console.log("Downloading Excel for:", doc.fileName);
    window.open(doc.journalEntriesUrl, "_blank");
  };

  const handleViewDocument = (doc: typeof mockDocuments[0]) => {
    // TODO: Open document viewer modal
    console.log("Viewing document:", doc.fileName);
    window.open(doc.fileUrl, "_blank");
  };

  const handleMarkProcessed = (docId: string) => {
    // TODO: Call API to update status
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, status: "processed" as const } : doc
      )
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full pb-4">
      {/* Header with Stats */}
      <NeoCard className="bg-[#fffef5]">
        <NeoCardContent className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Document Management</h2>
              <p className="text-xs font-semibold text-[#666]">Review and process client uploads</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#ff9800]">{pendingCount}</div>
              <div className="text-[10px] font-semibold text-[#666] uppercase">Pending</div>
            </div>
          </div>
        </NeoCardContent>
      </NeoCard>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={() => setFilter("pending")}
          size="sm"
          className={`flex-1 neo-btn font-bold text-xs h-8 ${
            filter === "pending"
              ? "bg-[#ff9800] text-white hover:bg-[#ff9800]/90"
              : "bg-white text-black hover:bg-[#f9f9f9]"
          }`}
        >
          Pending ({pendingCount})
        </Button>
        <Button
          onClick={() => setFilter("processed")}
          size="sm"
          className={`flex-1 neo-btn font-bold text-xs h-8 ${
            filter === "processed"
              ? "bg-[#00d4a1] text-black hover:bg-[#00d4a1]/90"
              : "bg-white text-black hover:bg-[#f9f9f9]"
          }`}
        >
          Processed ({documents.filter((d) => d.status === "processed").length})
        </Button>
        <Button
          onClick={() => setFilter("all")}
          size="sm"
          className={`flex-1 neo-btn font-bold text-xs h-8 ${
            filter === "all"
              ? "bg-black text-white hover:bg-black/90"
              : "bg-white text-black hover:bg-[#f9f9f9]"
          }`}
        >
          All ({documents.length})
        </Button>
      </div>

      {/* Documents List */}
      {filteredDocs.length === 0 ? (
        <NeoCard>
          <NeoCardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 text-[#ccc]" />
            <p className="text-sm font-bold text-[#999]">No {filter} documents</p>
          </NeoCardContent>
        </NeoCard>
      ) : (
        filteredDocs.map((doc) => (
          <NeoCard key={doc.id} className={doc.status === "pending" ? "bg-[#fff9e6]" : ""}>
            <NeoCardHeader className="p-3 pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <NeoCardTitle className="text-sm font-bold">{doc.clientName}</NeoCardTitle>
                    {doc.status === "pending" && (
                      <span className="px-2 py-0.5 bg-[#ff9800] text-white text-[10px] font-bold rounded">
                        PENDING
                      </span>
                    )}
                    {doc.status === "processed" && (
                      <span className="px-2 py-0.5 bg-[#00d4a1] text-black text-[10px] font-bold rounded">
                        PROCESSED
                      </span>
                    )}
                  </div>
                  <NeoCardDescription className="text-xs font-semibold text-[#666]">
                    {doc.clientCompany}
                  </NeoCardDescription>
                </div>
              </div>
            </NeoCardHeader>
            <NeoCardContent className="p-3 pt-0 space-y-3">
              {/* File Info */}
              <div className="flex items-center gap-2 p-2 bg-white border-2 border-black rounded">
                <FileText className="w-4 h-4" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{doc.fileName}</p>
                  <p className="text-[10px] font-semibold text-[#666]">
                    {doc.fileSize} • {doc.uploadedAt}
                  </p>
                </div>
              </div>

              {/* AI Extracted Data */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold">AI Analysis</Label>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      doc.extractedData.confidence >= 0.8
                        ? "bg-[#00d4a1] text-black"
                        : "bg-[#ff9800] text-white"
                    }`}
                  >
                    {(doc.extractedData.confidence * 100).toFixed(0)}% confident
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-white border-2 border-[#e5e5e5] rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <Building className="w-3 h-3 text-[#666]" />
                      <span className="text-[10px] font-bold text-[#666]">VENDOR</span>
                    </div>
                    <p className="font-bold text-xs">{doc.extractedData.vendor}</p>
                  </div>

                  <div className="p-2 bg-white border-2 border-[#e5e5e5] rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <DollarSign className="w-3 h-3 text-[#666]" />
                      <span className="text-[10px] font-bold text-[#666]">AMOUNT</span>
                    </div>
                    <p className="font-bold text-xs">${doc.extractedData.amount.toFixed(2)}</p>
                    {doc.extractedData.gst > 0 && (
                      <p className="text-[10px] text-[#666]">GST: ${doc.extractedData.gst.toFixed(2)}</p>
                    )}
                  </div>

                  <div className="p-2 bg-white border-2 border-[#e5e5e5] rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3 text-[#666]" />
                      <span className="text-[10px] font-bold text-[#666]">DATE</span>
                    </div>
                    <p className="font-bold text-xs">{doc.extractedData.date}</p>
                  </div>

                  <div className="p-2 bg-white border-2 border-[#e5e5e5] rounded">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] font-bold text-[#666]">CATEGORY</span>
                    </div>
                    <p className="font-bold text-xs">{doc.extractedData.category}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDocument(doc)}
                  className="flex-1 neo-btn bg-white hover:bg-[#f9f9f9] font-bold text-xs h-8"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  View
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownloadExcel(doc)}
                  className="flex-1 neo-btn bg-[#00d4a1] hover:bg-[#00d4a1]/90 text-black font-bold text-xs h-8"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Excel
                </Button>
                {doc.status === "pending" && (
                  <Button
                    size="sm"
                    onClick={() => handleMarkProcessed(doc.id)}
                    className="flex-1 neo-btn bg-[#ff9800] hover:bg-[#ff9800]/90 text-white font-bold text-xs h-8"
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1" />
                    Done
                  </Button>
                )}
              </div>

              {/* Low confidence warning */}
              {doc.extractedData.confidence < 0.8 && doc.status === "pending" && (
                <div className="flex items-start gap-2 p-2 bg-[#fff9e6] border-2 border-[#ffc107] rounded">
                  <AlertCircle className="w-4 h-4 text-[#ff9800] flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] font-semibold text-[#ff9800]">
                    Low confidence - Please verify extracted data before processing
                  </p>
                </div>
              )}
            </NeoCardContent>
          </NeoCard>
        ))
      )}
    </div>
  );
}
