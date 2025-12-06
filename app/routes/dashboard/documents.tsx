import { Upload, FileText, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

// Mock documents data
const documents = [
  {
    id: "1",
    name: "Invoice_2024_Q1.pdf",
    type: "Invoice",
    uploadDate: "2024-03-15",
    status: "processed",
    amount: "$12,450.00",
  },
  {
    id: "2",
    name: "Receipt_Office_Supplies.jpg",
    type: "Receipt",
    uploadDate: "2024-03-14",
    status: "processing",
    amount: "$234.50",
  },
  {
    id: "3",
    name: "Bank_Statement_Feb.pdf",
    type: "Statement",
    uploadDate: "2024-03-10",
    status: "processed",
    amount: "-",
  },
];

const statusConfig = {
  processed: {
    icon: CheckCircle2,
    label: "Processed",
    variant: "default" as const,
    color: "text-green-600",
  },
  processing: {
    icon: Clock,
    label: "Processing",
    variant: "secondary" as const,
    color: "text-yellow-600",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    variant: "destructive" as const,
    color: "text-red-600",
  },
};

export default function Documents() {
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Upload Section */}
      <Card className="py-2 gap-0">
        <CardHeader className="pb-1.5 p-2">
          <CardTitle className="text-sm">Upload Document</CardTitle>
          <CardDescription className="text-xs">
            Upload receipts, invoices, or bank statements
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <Button className="w-full h-9 text-xs">
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Choose File
          </Button>
        </CardContent>
      </Card>

      {/* Documents List */}
      <div className="space-y-1.5">
        <h2 className="text-xs font-semibold text-muted-foreground">
          Recent Documents
        </h2>
        {documents.map((doc) => {
          const StatusIcon = statusConfig[doc.status as keyof typeof statusConfig].icon;
          const statusColor = statusConfig[doc.status as keyof typeof statusConfig].color;

          return (
            <Card key={doc.id} className="cursor-pointer hover:bg-accent transition-colors py-2 gap-0">
              <CardContent className="p-2">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.type} • {doc.uploadDate}
                        </p>
                      </div>
                      {doc.amount !== "-" && (
                        <p className="text-sm font-semibold whitespace-nowrap">
                          {doc.amount}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <StatusIcon className={`w-3 h-3 ${statusColor}`} />
                      <span className={`text-xs ${statusColor}`}>
                        {statusConfig[doc.status as keyof typeof statusConfig].label}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
