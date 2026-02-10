import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Task, ReportType } from '@/types';
import { reportApi, taskApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Send, FileText, Upload, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const ReportForm: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    type: 'daily' as ReportType,
    description: '',
    taskIds: [] as string[],
    attachments: [] as File[],
  });

  useEffect(() => {
    loadTasks();
  }, [currentUser]);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const res = await taskApi.getAll();
      if (res.success) {
        // Get user's tasks that are in-progress or recently completed
        const userTasks = res.data.filter(t =>
          t.assignedTo === currentUser?.id &&
          (t.status === 'in-progress' || t.status === 'completed')
        );
        setTasks(userTasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskToggle = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      taskIds: prev.taskIds.includes(taskId)
        ? prev.taskIds.filter(id => id !== taskId)
        : [...prev.taskIds, taskId],
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a PDF file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast({
        title: 'File Too Large',
        description: 'File size must be less than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, file],
    }));

    // Reset input
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a report description.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const result = await reportApi.create({
        type: formData.type,
        description: formData.description.trim(),
        userId: currentUser?.id || 'user-1',
        taskIds: formData.taskIds.length > 0 ? formData.taskIds : undefined,
      });

      if (result.success) {
        toast({
          title: 'Report Submitted',
          description: 'Your report has been submitted successfully.',
        });
        navigate('/reports');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit report.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getReportPlaceholder = () => {
    if (formData.type === 'daily') {
      return `What did you accomplish today?\n\nExample:\n- Completed user authentication feature\n- Fixed 3 bugs in the dashboard\n- Started working on API integration\n\nAny blockers or issues?`;
    }
    return `Summary of your week:\n\nExample:\n- Completed: [list of completed tasks]\n- In Progress: [ongoing work]\n- Planned for next week: [upcoming tasks]\n- Challenges faced: [any blockers]`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/reports')}
        className="gap-2 -ml-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Reports
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Submit Report</CardTitle>
              <CardDescription>
                Share your progress and updates
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Report Type */}
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: ReportType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.type === 'daily'
                  ? 'A brief summary of today\'s work'
                  : 'A comprehensive summary of the week\'s progress'
                }
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Report Description *</Label>
              <Textarea
                id="description"
                placeholder={getReportPlaceholder()}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isSaving}
                rows={10}
                className="resize-none"
              />
            </div>

            {/* Related Tasks */}
            {tasks.length > 0 && (
              <div className="space-y-3">
                <Label>Related Tasks (Optional)</Label>
                <p className="text-xs text-muted-foreground">
                  Select tasks you worked on for this report
                </p>
                <ScrollArea className="h-[150px] rounded-md border border-input p-3">
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center space-x-3 py-2 px-2 rounded-md hover:bg-muted/50"
                      >
                        <Checkbox
                          id={task.id}
                          checked={formData.taskIds.includes(task.id)}
                          onCheckedChange={() => handleTaskToggle(task.id)}
                        />
                        <label
                          htmlFor={task.id}
                          className="text-sm cursor-pointer flex-1"
                        >
                          <span className="font-medium">{task.title}</span>
                          <span className="text-muted-foreground ml-2 text-xs capitalize">
                            ({task.status.replace('-', ' ')})
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* PDF Upload */}
            <div className="space-y-3">
              <Label>Attach PDF Files (Optional)</Label>
              <p className="text-xs text-muted-foreground">
                Upload supporting documents (PDF only, max 10MB per file)
              </p>

              {/* File Input */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="pdf-upload"
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-input p-4 hover:border-primary hover:bg-primary/5 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload PDF
                    </span>
                  </div>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSaving}
                  />
                </label>
              </div>

              {/* Uploaded Files List */}
              {formData.attachments.length > 0 && (
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/30"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-10 w-10 rounded bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(index)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/reports')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportForm;
