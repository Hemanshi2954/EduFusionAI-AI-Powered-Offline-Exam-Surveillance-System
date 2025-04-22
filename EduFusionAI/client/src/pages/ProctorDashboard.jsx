import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Menu, BookOpen, Users, AlertTriangle, Clock } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import { mockExams, mockEnrollments, mockAlerts, mockStudents } from "@/mock/mockData";

// StatCard component for dashboard statistics
const StatCard = ({ icon, label, value, color }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`rounded-full p-3 mr-4 ${color}`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <h4 className="text-2xl font-bold">{value}</h4>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Exam list table row component
const ExamRow = ({ exam }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Scheduled</span>;
      case 'active':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Active</span>;
      case 'completed':
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Completed</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get enrollment count for this exam
  const enrollmentCount = mockEnrollments.filter(e => e.examId === exam.id).length;

  // Get action button based on exam status
  const getActionButton = (status) => {
    switch (status) {
      case 'active':
        return (
          <Link href={`/monitor/${exam.id}`}>
            <Button size="sm">Monitor</Button>
          </Link>
        );
      case 'completed':
        return (
          <Link href={`/monitor/${exam.id}`}>
            <Button size="sm" variant="outline">View Results</Button>
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-4">
        <div>
          <p className="font-medium">{exam.title}</p>
          <p className="text-sm text-gray-500">{exam.description}</p>
        </div>
      </td>
      <td className="px-4 py-4 text-sm">{formatDate(exam.startTime)}</td>
      <td className="px-4 py-4 text-sm">{enrollmentCount} students</td>
      <td className="px-4 py-4">{getStatusBadge(exam.status)}</td>
      <td className="px-4 py-4 text-right">
        {getActionButton(exam.status)}
      </td>
    </tr>
  );
};

// Alert component for recent alerts
const AlertItem = ({ alert }) => {
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('default', {
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  // Find student name
  const student = mockStudents.find(s => s.id === alert.studentId);
  const studentName = student ? student.name : 'Unknown Student';

  return (
    <div className="flex items-start space-x-4 p-4 border-b last:border-0">
      <div className="bg-red-100 p-2 rounded-full">
        <AlertTriangle className="h-4 w-4 text-red-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{studentName}</p>
        <p className="text-sm text-gray-500">{alert.details}</p>
        <span className="text-xs text-gray-500">{formatTime(alert.timestamp)}</span>
      </div>
    </div>
  );
};

const ProctorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    activeExams: 0,
    totalStudents: 0,
    pendingAlerts: 0
  });
  const [exams, setExams] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate API call to get dashboard data
    const fetchDashboardData = () => {
      // Get exams for the current proctor
      const proctorExams = mockExams.filter(e => e.proctorId === user.id);
      
      // Calculate stats
      const activeExams = proctorExams.filter(e => e.status === 'active').length;
      
      // Get all enrollments for proctor's exams
      const examIds = proctorExams.map(e => e.id);
      const relevantEnrollments = mockEnrollments.filter(e => examIds.includes(e.examId));
      const totalStudents = new Set(relevantEnrollments.map(e => e.studentId)).size;
      
      // Get alerts for proctor's exams
      const relevantAlerts = mockAlerts.filter(a => examIds.includes(a.examId));
      const pendingAlerts = relevantAlerts.filter(a => a.status === 'pending').length;
      
      setStats({
        activeExams,
        totalStudents,
        pendingAlerts
      });
      
      // Sort exams by status: active first, then scheduled, then completed
      const sortedExams = [...proctorExams].sort((a, b) => {
        const statusOrder = { active: 0, scheduled: 1, completed: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      });
      
      setExams(sortedExams);
      
      // Sort alerts by timestamp (most recent first) and limit to 3
      const sortedAlerts = [...relevantAlerts].sort((a, b) => 
        new Date(b.timestamp) - new Date(a.timestamp)
      ).slice(0, 3);
      
      setAlerts(sortedAlerts);
    };
    
    fetchDashboardData();
  }, [user]);

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
              <h1 className="text-xl font-semibold ml-2">Proctor Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium">
                Welcome, {user?.name}
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard 
              icon={<BookOpen className="h-5 w-5 text-green-600" />}
              label="Active Exams"
              value={stats.activeExams}
              color="bg-green-100"
            />
            <StatCard 
              icon={<Users className="h-5 w-5 text-blue-600" />}
              label="Total Students"
              value={stats.totalStudents}
              color="bg-blue-100"
            />
            <StatCard 
              icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
              label="Pending Alerts"
              value={stats.pendingAlerts}
              color="bg-red-100"
            />
          </div>
          
          <div className="grid gap-6 mt-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Your Exams</h2>
              </div>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Exam</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Date</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Students</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                        <th className="px-4 py-3 text-sm font-medium text-gray-500"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.length > 0 ? (
                        exams.slice(0, 5).map((exam) => (
                          <ExamRow key={exam.id} exam={exam} />
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                            You haven't created any exams yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Recent Alerts</h2>
              </div>
              
              <div className="bg-white rounded-lg shadow">
                {alerts.length > 0 ? (
                  <div>
                    {alerts.map((alert) => (
                      <AlertItem key={alert.id} alert={alert} />
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No recent alerts.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProctorDashboard;
