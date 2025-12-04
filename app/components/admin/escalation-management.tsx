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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { AlertCircle, MessageSquare, CheckCircle2 } from 'lucide-react';

interface Escalation {
  id: string;
  query_text: string;
  ai_confidence: number | null;
  reason: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  user: {
    full_name: string;
    phone_number: string;
  };
}

export function EscalationManagement() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState<'in_progress' | 'resolved' | 'closed'>('in_progress');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadEscalations();
  }, []);

  const loadEscalations = async () => {
    setLoading(true);
    try {
      // TODO: Create escalations API endpoint
      // const response = await fetch('/api/escalations/list?status=open,in_progress');
      // const data = await response.json();
      // setEscalations(data.escalations || []);

      // Mock data for now
      setEscalations([
        {
          id: '1',
          query_text: 'I need help understanding a complex IRS notice I received',
          ai_confidence: 0.45,
          reason: 'Low confidence - requires tax professional expertise',
          status: 'open',
          created_at: new Date().toISOString(),
          user: {
            full_name: 'John Smith',
            phone_number: '+14155551001',
          },
        },
      ]);
    } catch (error) {
      console.error('Error loading escalations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openResponseDialog = (escalation: Escalation) => {
    setSelectedEscalation(escalation);
    setResponse('');
    setNewStatus('in_progress');
    setResponseDialogOpen(true);
  };

  const handleRespond = async () => {
    if (!selectedEscalation) return;

    setProcessing(true);
    try {
      // TODO: Create escalations update API endpoint
      // const result = await updateEscalation(selectedEscalation.id, {
      //   status: newStatus,
      //   admin_response: response,
      // });

      // Remove from list if resolved/closed
      if (newStatus === 'resolved' || newStatus === 'closed') {
        setEscalations((prev) => prev.filter((e) => e.id !== selectedEscalation.id));
      }

      setResponseDialogOpen(false);
      setSelectedEscalation(null);
    } catch (error) {
      console.error('Error responding to escalation:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      open: { label: 'Open', className: 'bg-red-100 text-red-700 border-red-300' },
      in_progress: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      resolved: { label: 'Resolved', className: 'bg-green-100 text-green-700 border-green-300' },
      closed: { label: 'Closed', className: 'bg-gray-100 text-gray-700 border-gray-300' },
    };

    const variant = variants[status as keyof typeof variants] || variants.open;

    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading escalations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Escalation Management</h2>
        <p className="text-muted-foreground">
          Handle queries escalated by the AI assistant
        </p>
      </div>

      {escalations.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground py-12">
              <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No open escalations</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {escalations.map((escalation) => (
            <Card key={escalation.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {escalation.user.full_name}
                    </CardTitle>
                    <CardDescription>
                      {escalation.user.phone_number} •{' '}
                      {new Date(escalation.created_at).toLocaleString()}
                    </CardDescription>
                  </div>
                  {getStatusBadge(escalation.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* User Query */}
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm font-medium mb-2">User Query</div>
                    <div className="text-sm">{escalation.query_text}</div>
                  </div>

                  {/* Escalation Reason */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Reason</div>
                      <div className="text-sm text-muted-foreground">
                        {escalation.reason}
                      </div>
                    </div>
                    {escalation.ai_confidence !== null && (
                      <div>
                        <div className="text-sm font-medium">AI Confidence</div>
                        <div className="text-sm text-muted-foreground">
                          {(escalation.ai_confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => openResponseDialog(escalation)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Respond
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedEscalation(escalation);
                        setNewStatus('resolved');
                        handleRespond();
                      }}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark Resolved
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Escalation</DialogTitle>
            <DialogDescription>
              {selectedEscalation?.user.full_name} ({selectedEscalation?.user.phone_number})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Original Query */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-2">Original Query</div>
              <div className="text-sm">{selectedEscalation?.query_text}</div>
            </div>

            {/* Response */}
            <div className="space-y-2">
              <Label htmlFor="response">Your Response</Label>
              <Textarea
                id="response"
                placeholder="Type your response to the client..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={6}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={(value: any) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResponseDialogOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button onClick={handleRespond} disabled={processing || !response.trim()}>
              {processing ? 'Sending...' : 'Send Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
