import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface AdminStats {
  pendingDocuments: number;
  processingDocuments: number;
  completedDocuments: number;
  openEscalations: number;
  totalClients: number;
  recentActivity: Array<{
    id: string;
    type: 'document' | 'escalation';
    message: string;
    timestamp: string;
  }>;
}

export function AdminOverview() {
  const [stats, setStats] = useState<AdminStats>({
    pendingDocuments: 0,
    processingDocuments: 0,
    completedDocuments: 0,
    openEscalations: 0,
    totalClients: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      // Fetch pending documents
      const docsResponse = await fetch('/api/documents/list?status=pending');
      const docsData = await docsResponse.json();

      // Fetch processing documents
      const processingResponse = await fetch('/api/documents/list?status=processing');
      const processingData = await processingResponse.json();

      // Fetch completed documents (last 7 days)
      const completedResponse = await fetch('/api/documents/list?status=completed');
      const completedData = await completedResponse.json();

      // TODO: Fetch escalations when API is ready
      // const escalationsResponse = await fetch('/api/escalations/list?status=open');
      // const escalationsData = await escalationsResponse.json();

      setStats({
        pendingDocuments: docsData.count || 0,
        processingDocuments: processingData.count || 0,
        completedDocuments: completedData.count || 0,
        openEscalations: 0, // TODO: Update when escalations API is ready
        totalClients: 4, // From mock data
        recentActivity: [],
      });
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground">
          Manage documents, escalations, and client data
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingDocuments}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processingDocuments}</div>
            <p className="text-xs text-muted-foreground">Ready for posting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedDocuments}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Escalations</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openEscalations}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/dashboard/admin/documents"
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="font-medium">Review Documents</div>
              <div className="text-sm text-muted-foreground">
                {stats.pendingDocuments} pending review
              </div>
            </a>
            <a
              href="/dashboard/admin/escalations"
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="font-medium">Manage Escalations</div>
              <div className="text-sm text-muted-foreground">
                {stats.openEscalations} open escalations
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-2">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="text-sm">
                    <Badge variant="outline" className="mr-2">
                      {activity.type}
                    </Badge>
                    {activity.message}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
