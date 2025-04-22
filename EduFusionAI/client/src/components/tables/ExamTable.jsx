import { useState } from "react";
import { format } from "date-fns";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cloneElement } from "react";

const statusColors = {
  "in-progress": "bg-green-100 text-green-800",
  "completed": "bg-blue-100 text-blue-800",
  "upcoming": "bg-amber-100 text-amber-800",
  "expired": "bg-red-100 text-red-800",
  "enrolled": "bg-purple-100 text-purple-800",
};

const ExamTable = ({ 
  exams = [], 
  actionButton, 
  onAction, 
  showProgress = false, 
  showDate = false 
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);
  
  const handleAction = (examId) => {
    if (onAction) {
      onAction(examId);
    }
  };
  
  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ""}`;
    }
    
    return `${mins}m`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy · h:mm a');
    } catch (error) {
      return dateString;
    }
  };
  
  if (exams.length === 0) {
    return <div className="text-center py-6 bg-gray-50 rounded-lg">No exams available</div>;
  }
  
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Exam Title</TableHead>
            {showDate && <TableHead>Date</TableHead>}
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            {showProgress && <TableHead>Progress</TableHead>}
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map((exam) => (
            <TableRow 
              key={exam.id} 
              onMouseEnter={() => setHoveredRow(exam.id)}
              onMouseLeave={() => setHoveredRow(null)}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleAction(exam.id)}
            >
              <TableCell className="font-medium">{exam.title}</TableCell>
              
              {showDate && (
                <TableCell>{formatDate(exam.date)}</TableCell>
              )}
              
              <TableCell>{formatDuration(exam.duration)}</TableCell>
              
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={statusColors[exam.status?.toLowerCase()] || "bg-gray-100 text-gray-800"}
                >
                  {exam.status}
                </Badge>
              </TableCell>
              
              {showProgress && (
                <TableCell>
                  <div className="w-full max-w-[180px]">
                    <Progress value={exam.progress || 0} className="h-2" />
                    <span className="text-xs text-gray-500 mt-1 inline-block">
                      {exam.progress || 0}% completed
                    </span>
                  </div>
                </TableCell>
              )}
              
              <TableCell className="text-right">
                {actionButton && cloneElement(actionButton, {
                  onClick: (e) => {
                    e.stopPropagation();
                    handleAction(exam.id);
                  },
                  className: `${actionButton.props.className} ${hoveredRow === exam.id ? 'opacity-100' : 'opacity-70'}`
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExamTable;
