import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Report, ReportFilters, User } from '@/types';
import { reportApi, userApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FileText, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentRole } = useAuth();
  
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  
  const [filters, setFilters] = useState<ReportFilters>({
    type: 'all',
    userId: 'all',
  });

  useEffect(() => {
    loadData();
  }, [filters, currentUser, currentRole]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reportsRes, usersRes] = await Promise.all([
        reportApi.getAll(filters),
        userApi.getAll(),
      ]);
      
      if (reportsRes.success) {
        let reportData = reportsRes.data;
        // For employees, only show their reports
        if (currentRole === 'employee' && currentUser) {
          reportData = reportData.filter(r => r.userId === currentUser.id);
        }
        setReports(reportData);
      }
      if (usersRes.success) setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports</h2>
          <p className="text-muted-foreground">
            {currentRole === 'employee' ? 'Your submitted reports' : 'View all submitted reports'}
          </p>
        </div>
        <Button onClick={() => navigate('/reports/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Submit Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <Select 
              value={filters.type || 'all'} 
              onValueChange={(value) => setFilters({ ...filters, type: value as any })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>

            {currentRole !== 'employee' && (
              <Select 
                value={filters.userId || 'all'} 
                onValueChange={(value) => setFilters({ ...filters, userId: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Submitted By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead className="w-[40%]">Summary</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No reports found</p>
                    <Button 
                      variant="link" 
                      onClick={() => navigate('/reports/new')}
                      className="mt-2"
                    >
                      Submit your first report
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => (
                <TableRow key={report.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(report.createdAt), 'MMM d, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {report.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={report.user?.avatar} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {getInitials(report.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{report.user?.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {report.description}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Report Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {selectedReport?.type}
              </Badge>
              Report
            </DialogTitle>
            <DialogDescription>
              Submitted on {selectedReport && format(new Date(selectedReport.createdAt), 'MMMM d, yyyy \'at\' h:mm a')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Avatar>
                <AvatarImage src={selectedReport?.user?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(selectedReport?.user?.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedReport?.user?.name}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {selectedReport?.user?.role}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Report Content</h4>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {selectedReport?.description}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
