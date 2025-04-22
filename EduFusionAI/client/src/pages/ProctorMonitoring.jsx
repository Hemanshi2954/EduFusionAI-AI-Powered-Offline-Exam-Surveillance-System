import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu, RefreshCw, Filter, Eye, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import { fetchExams, getAlertsForExam, updateAlertStatus } from "@/utils/api";

const AlertDialog = ({ alert, isOpen, onClose, onStatusChange }) => {
  if (!alert) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alert Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Alert Type</p>
            <p className="text-lg font-semibold">{alert.type?.replace(/_/g, ' ')}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Description</p>
            <p>{alert.description}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Student</p>
            <p>{alert.student?.name || "Unknown"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Timestamp</p>
            <p>{format(new Date(alert.timestamp), "PPpp")}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Status</p>
            <div>
              {alert.status === "pending" ? (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>
              ) : alert.status === "reviewed" ? (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Reviewed</Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Dismissed</Badge>
              )}
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Evidence</p>
            <div className="bg-gray-100 rounded p-2 text-center text-gray-500">
              <p>Evidence image would be displayed here</p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex space-x-2 justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onStatusChange(alert.id, "dismissed")}
            disabled={alert.status !== "pending"}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Dismiss
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => onStatusChange(alert.id, "reviewed")}
            disabled={alert.status !== "pending"}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark as Reviewed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ProctorMonitoring = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exams, setExams] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  
  useEffect(() => {
    const loadExams = async () => {
      try {
        const examData = await fetchExams();
        // Filter only active exams
        const activeExams = examData.filter(exam => exam.status === "in_progress");
        setExams(activeExams);
        
        // If we have active exams, select the first one by default
        if (activeExams.length > 0 && !selectedExam) {
          setSelectedExam(activeExams[0].id);
        }
      } catch (error) {
        console.error("Error fetching exams:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadExams();
  }, []);
  
  useEffect(() => {
    if (selectedExam) {
      loadAlerts(selectedExam);
    }
  }, [selectedExam]);
  
  const loadAlerts = async (examId) => {
    try {
      setIsRefreshing(true);
      const alertsData = await getAlertsForExam(examId);
      setAlerts(alertsData);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast({
        title: "Error",
        description: "Failed to load alerts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    if (selectedExam) {
      loadAlerts(selectedExam);
    }
  };
  
  const handleViewAlert = (alert) => {
    setSelectedAlert(alert);
    setAlertDialogOpen(true);
  };
  
  const handleStatusChange = async (alertId, newStatus) => {
    try {
      const updatedAlert = await updateAlertStatus(alertId, newStatus);
      
      // Update the alerts list
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId ? { ...alert, status: newStatus } : alert
        )
      );
      
      setAlertDialogOpen(false);
      
      toast({
        title: "Status Updated",
        description: `Alert has been marked as ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Filter alerts by status
  const filteredAlerts = statusFilter === "all" 
    ? alerts 
    : alerts.filter(alert => alert.status === statusFilter);
  
  // Get current exam details
  const currentExam = exams.find(exam => exam.id === selectedExam);
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold ml-2">Exam Monitoring</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing || !selectedExam}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </header>
        
        <div className="bg-white p-4 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="w-full md:w-1/3">
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an exam to monitor" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {currentExam && (
            <div className="mt-4 text-sm text-gray-500">
              Monitoring: <span className="font-medium text-gray-900">{currentExam.title}</span>
              <span className="mx-2">•</span>
              <span>{format(new Date(currentExam.date), "PPp")}</span>
              <span className="mx-2">•</span>
              <span>Duration: {currentExam.duration} minutes</span>
            </div>
          )}
        </div>
        
        <main className="flex-1 overflow-y-auto p-4">
          {!selectedExam ? (
            <div className="flex items-center justify-center h-full">
              <Card className="w-full max-w-md">
                <CardContent className="pt-6 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Eye className="h-12 w-12 text-gray-300" />
                    <p className="text-gray-500">Select an exam to start monitoring</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Alerts</CardTitle>
                <CardDescription>
                  No alerts found for the selected criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-6">
                <p className="text-gray-500">
                  {statusFilter !== "all" 
                    ? `No ${statusFilter} alerts found for this exam.` 
                    : "No alerts have been generated for this exam yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Alerts</CardTitle>
                <CardDescription>
                  Showing {filteredAlerts.length} {statusFilter !== "all" ? statusFilter : ""} alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">
                          {alert.type.replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell>{alert.student?.name || "Unknown"}</TableCell>
                        <TableCell>{format(new Date(alert.timestamp), "pp")}</TableCell>
                        <TableCell>
                          {alert.status === "pending" ? (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>
                          ) : alert.status === "reviewed" ? (
                            <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Reviewed</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Dismissed</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewAlert(alert)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
      
      <AlertDialog 
        alert={selectedAlert}
        isOpen={alertDialogOpen}
        onClose={() => setAlertDialogOpen(false)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default ProctorMonitoring;
