import { useState } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Clock, Calendar } from "lucide-react";

const getStatusBadge = (status) => {
  switch (status.toLowerCase()) {
    case "scheduled":
      return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Scheduled</Badge>;
    case "in_progress":
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">In Progress</Badge>;
    case "completed":
      return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Completed</Badge>;
    case "canceled":
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Canceled</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const ExamTable = ({ exams = [], title = "Recent Exams", userRole = "student" }) => {
  const [, setLocation] = useLocation();
  const [displayCount, setDisplayCount] = useState(5);
  
  const handleViewAll = () => {
    setLocation("/exams");
  };
  
  const handleViewExam = (examId) => {
    if (userRole === "student") {
      setLocation(`/exam/${examId}`);
    } else {
      setLocation(`/exam/${examId}/monitor`);
    }
  };
  
  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 5);
  };
  
  if (!exams.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Calendar className="h-12 w-12 text-gray-300" />
            <p className="text-gray-500">No exams to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleViewAll}>View All</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.slice(0, displayCount).map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">{exam.title}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span className="text-sm">{format(new Date(exam.date), 'dd MMM yyyy')}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Clock className="mr-1 h-3 w-3" />
                    <span className="text-sm text-gray-500">{exam.duration} min</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(exam.status)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewExam(exam.id)}
                    disabled={userRole === "student" && exam.status !== "in_progress"}
                  >
                    <span className="sr-only">View</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {exams.length > displayCount && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm" onClick={handleLoadMore}>
              Load More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExamTable;
