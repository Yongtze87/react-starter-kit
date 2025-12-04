import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Textarea } from '~/components/ui/textarea';
import { Label } from '~/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { getDocuments, updateDocumentStatus, formatDocumentStatus, downloadJournalEntries } from '~/lib/utils';
import { FileText, Download, CheckCircle, XCircle, Eye } from 'lucide-react';
import { formatFileSize } from '~/lib/utils';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  status: string;
  fileUrl: string;
  journalEntriesUrl?: string;
  extractedData?: any;
  uploadedAt: string;
  adminNotes?: string;
}

export function DocumentReview() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const result = await getDocuments('pending');
      if (result.success) {
        setDocuments(result.documents);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (doc: Document) => {
    setSelectedDoc(doc);
    setAdminNotes('');
    setReviewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedDoc) return;

    setProcessing(true);
    try {
      const result = await updateDocumentStatus(selectedDoc.id, 'processing', adminNotes || 'Approved');
      if (result.success) {
        // Remove from list
        setDocuments((prev) => prev.filter((d) => d.id !== selectedDoc.id));
        setReviewDialogOpen(false);
        setSelectedDoc(null);
      }
    } catch (error) {
      console.error('Error approving document:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDoc) return;

    setProcessing(true);
    try {
      const result = await updateDocumentStatus(
        selectedDoc.id,
        'rejected',
        adminNotes || 'Rejected by admin'
      );
      if (result.success) {
        // Remove from list
        setDocuments((prev) => prev.filter((d) => d.id !== selectedDoc.id));
        setReviewDialogOpen(false);
        setSelectedDoc(null);
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadEntries = async (doc: Document) => {
    if (!doc.journalEntriesUrl) return;

    try {
      await downloadJournalEntries(doc.journalEntriesUrl, `journal_entries_${doc.name}.xlsx`);
    } catch (error) {
      console.error('Error downloading journal entries:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Document Review</h2>
        <p className="text-muted-foreground">Review and approve pending documents</p>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-12">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No pending documents to review</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => {
            const statusInfo = formatDocumentStatus(doc.status);
            return (
              <Card key={doc.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{doc.name}</CardTitle>
                      <CardDescription>
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()} •{' '}
                        {formatFileSize(doc.size)}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        statusInfo.color === 'yellow'
                          ? 'border-yellow-500 text-yellow-700'
                          : ''
                      }
                    >
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Extracted Data */}
                    {doc.extractedData && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                        <div>
                          <div className="text-sm font-medium">Vendor</div>
                          <div className="text-sm text-muted-foreground">
                            {doc.extractedData.vendor}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Amount</div>
                          <div className="text-sm text-muted-foreground">
                            ${doc.extractedData.amount?.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Date</div>
                          <div className="text-sm text-muted-foreground">
                            {doc.extractedData.date}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Category</div>
                          <div className="text-sm text-muted-foreground">
                            {doc.extractedData.category}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm font-medium">Description</div>
                          <div className="text-sm text-muted-foreground">
                            {doc.extractedData.description}
                          </div>
                        </div>
                        {doc.extractedData.confidence !== undefined && (
                          <div className="col-span-2">
                            <div className="text-sm font-medium">AI Confidence</div>
                            <div className="text-sm text-muted-foreground">
                              {(doc.extractedData.confidence * 100).toFixed(0)}%
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.fileUrl, '_blank')}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Original
                      </Button>
                      {doc.journalEntriesUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadEntries(doc)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Entries
                        </Button>
                      )}
                      <div className="flex-1" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReviewDialog(doc)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openReviewDialog(doc)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
            <DialogDescription>
              {selectedDoc?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Admin Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this document..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={processing}
              className="text-red-600 hover:text-red-700"
            >
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? 'Processing...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
