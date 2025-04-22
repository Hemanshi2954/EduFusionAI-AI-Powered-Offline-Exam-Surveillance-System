import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Menu, BookOpen, AlertTriangle, Clock } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import MobileSidebar from "@/components/layout/MobileSidebar";
import { mockExams, mockEnrollments } from "@/mock/mockData";

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
const ExamRow = ({ exam, enrollment }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'enrolled':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Enrolled</span>;
      case 'in_progress':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">In Progress</span>;
      case 'completed':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Completed</span>;
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

  const getActionButton = (enrollment) => {
    if (!enrollment) return null;
    
    switch (enrollment.status) {
      case 'enrolled':
      case 'in_progress':
        return (
          <Link href={`/exam/${enrollment.id}`}>
            <Button size="sm">Take Exam</Button>
          </Link>
        );
      case 'completed':
        return (
          <Link href={`/exam/${enrollment.id}`}>
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
      <td className="px-4 py-4">{getStatusBadge(enrollment.status)}</td>
      <td className="px-4 py-4 text-right">
        {getActionButton(enrollment)}
      </td>
    </tr>
  );
};

const StudentDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    activeExams: 0,
    completedExams: 0,
    alerts: 0
  });
  const [exams, setExams] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate API call to get dashboard data
    const fetchDashboardData = () => {
      // Get enrollments for the current student
      const studentEnrollments = mockEnrollments.filter(e => e.studentId === user.id);
      
      // Get exams data using enrollments
      const examData = studentEnrollments.map(enrollment => {
        const exam = mockExams.find(e => e.id === enrollment.examId);
        return { exam, enrollment };
      });
      
      // Calculate stats
      const active = examData.filter(({ enrollment }) => 
        enrollment.status === 'in_progress' || enrollment.status === 'enrolled'
      ).length;
      const completed = examData.filter(({ enrollment }) => enrollment.status === 'completed').length;
      
      setStats({
        activeExams: active,
        completedExams: completed,
        alerts: 0
      });
      
      // Sort exams by status
      const sortedExams = examData.sort((a, b) => {
        const statusOrder = { in_progress: 0, enrolled: 1, completed: 2 };
        return statusOrder[a.enrollment.status] - statusOrder[b.enrollment.status];
      });
      
      setExams(sortedExams);
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
              <h1 className="text-xl font-semibold ml-2">Student Dashboard</h1>
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
              icon={<BookOpen className="h-5 w-5 text-blue-600" />}
              label="Active Exams"
              value={stats.activeExams}
              color="bg-blue-100"
            />
            <StatCard 
              icon={<Clock className="h-5 w-5 text-purple-600" />}
              label="Completed Exams"
              value={stats.completedExams}
              color="bg-purple-100"
            />
            <StatCard 
              icon={<AlertTriangle className="h-5 w-5 text-yellow-600" />}
              label="Active Alerts"
              value={stats.alerts}
              color="bg-yellow-100"
            />
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Exams</h2>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-3 text-sm font-medium text-gray-500">Exam</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-sm font-medium text-gray-500"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.length > 0 ? (
                      exams.map(({ exam, enrollment }) => (
                        <ExamRow 
                          key={exam.id} 
                          exam={exam} 
                          enrollment={enrollment} 
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                          You're not enrolled in any exams yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
