import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  Shield,
  UserX,
  Unlock,
  Activity
} from "lucide-react";
import { toast } from "sonner";

interface SuspendedUsersPanelProps {
  adminId: number;
}

export function SuspendedUsersPanel({ adminId }: SuspendedUsersPanelProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [unsuspendDialogOpen, setUnsuspendDialogOpen] = useState(false);

  const { data: suspiciousUsers, isLoading, refetch } = trpc.admin.getSuspiciousUsers.useQuery();
  
  const unsuspendMutation = trpc.admin.unsuspendUser.useMutation({
    onSuccess: () => {
      toast.success("User entsperrt", {
        description: "Der Account wurde erfolgreich entsperrt."
      });
      setUnsuspendDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Fehler beim Entsperren", {
        description: error.message
      });
    }
  });

  const { data: userActivity } = trpc.admin.getUserActivityAbuse.useQuery(
    { userId: selectedUser?.id || 0 },
    { enabled: !!selectedUser?.id && detailsDialogOpen }
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Kritisch</Badge>;
      case 'high':
        return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 gap-1"><AlertTriangle className="h-3 w-3" /> Hoch</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1"><Clock className="h-3 w-3" /> Mittel</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Shield className="h-3 w-3" /> Niedrig</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'suspended':
        return <Badge variant="destructive" className="gap-1"><Ban className="h-3 w-3" /> Gesperrt</Badge>;
      case 'warned':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1"><AlertTriangle className="h-3 w-3" /> Verwarnt</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><CheckCircle className="h-3 w-3" /> Aktiv</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const suspendedUsers = suspiciousUsers?.filter(u => u.status === 'suspended') || [];
  const warnedUsers = suspiciousUsers?.filter(u => u.status === 'warned') || [];
  const watchList = suspiciousUsers?.filter(u => u.status === 'active' && u.severity !== 'low') || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gesperrte Accounts</p>
                <p className="text-3xl font-bold text-red-400">{suspendedUsers.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Ban className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verwarnungen</p>
                <p className="text-3xl font-bold text-yellow-400">{warnedUsers.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Watchlist</p>
                <p className="text-3xl font-bold text-orange-400">{watchList.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Eye className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suspended Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-red-400" />
                Gesperrte Benutzer
              </CardTitle>
              <CardDescription>
                Accounts, die wegen verdächtiger Aktivitäten gesperrt wurden
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Aktualisieren
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {suspendedUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Grund</TableHead>
                  <TableHead>Schweregrad</TableHead>
                  <TableHead>Gesperrt am</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suspendedUsers.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name || 'Unbekannt'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm max-w-[200px] truncate">{user.reason || 'Übermäßige API-Nutzung'}</p>
                    </TableCell>
                    <TableCell>{getSeverityBadge(user.severity || 'low')}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.suspendedAt ? formatDate(user.suspendedAt) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setDetailsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-green-400 border-green-500/30 hover:bg-green-500/10"
                          onClick={() => {
                            setSelectedUser(user);
                            setUnsuspendDialogOpen(true);
                          }}
                        >
                          <Unlock className="h-4 w-4 mr-1" />
                          Entsperren
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-400 mb-4" />
              <p className="text-muted-foreground">Keine gesperrten Accounts</p>
              <p className="text-sm text-muted-foreground mt-1">Alle Benutzer verhalten sich ordnungsgemäß</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Watchlist */}
      {watchList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-orange-400" />
              Watchlist - Verdächtige Aktivitäten
            </CardTitle>
            <CardDescription>
              Accounts mit ungewöhnlichem Verhalten, die beobachtet werden sollten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Schweregrad</TableHead>
                  <TableHead>Analysen (24h)</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchList.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name || 'Unbekannt'}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status || 'active')}</TableCell>
                    <TableCell>{getSeverityBadge(user.severity || 'low')}</TableCell>
                    <TableCell>
                      <span className={user.requestsToday > 30 ? 'text-red-400 font-bold' : ''}>
                        {user.requestsToday}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setDetailsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* User Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Benutzer-Aktivität: {selectedUser?.name || selectedUser?.email}
            </DialogTitle>
            <DialogDescription>
              Detaillierte Übersicht der Benutzeraktivitäten
            </DialogDescription>
          </DialogHeader>
          
          {userActivity ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Letzte Stunde</p>
                  <p className="text-2xl font-bold">{userActivity.requestsLastHour}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Heute</p>
                  <p className="text-2xl font-bold">{userActivity.requestsToday}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Letzte Minute</p>
                  <p className="text-2xl font-bold">{userActivity.requestsLastMinute}</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="text-2xl font-bold capitalize">{userActivity.plan}</p>
                </div>
              </div>

              {userActivity.isSuspicious && userActivity.suspiciousReasons.length > 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm font-medium text-red-400 mb-2">Verdächtige Aktivitäten</p>
                  <ul className="space-y-1">
                    {userActivity.suspiciousReasons.map((reason, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3 text-red-400" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Unsuspend Dialog */}
      <Dialog open={unsuspendDialogOpen} onOpenChange={setUnsuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account entsperren</DialogTitle>
            <DialogDescription>
              Möchtest du den Account von {selectedUser?.name || selectedUser?.email} wirklich entsperren?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Der Benutzer kann nach dem Entsperren wieder alle Funktionen nutzen.
              Die Rate-Limits werden zurückgesetzt.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUnsuspendDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => {
                if (selectedUser) {
                  unsuspendMutation.mutate({ userId: selectedUser.id, adminId });
                }
              }}
              disabled={unsuspendMutation.isPending}
            >
              {unsuspendMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Unlock className="h-4 w-4 mr-2" />
              )}
              Entsperren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
