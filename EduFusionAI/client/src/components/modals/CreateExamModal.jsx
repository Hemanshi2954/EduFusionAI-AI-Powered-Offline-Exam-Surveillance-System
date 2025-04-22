import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/utils/api";

const CreateExamModal = ({ isOpen, onClose, onExamCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    course: "",
    date: "",
    time: "",
    duration: 60,
    totalQuestions: 10,
    description: "",
    enableProctoring: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.course || !formData.date || !formData.time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format date and time for API
      const examDateTime = new Date(`${formData.date}T${formData.time}`);
      
      const examData = {
        name: formData.name,
        course: formData.course,
        description: formData.description,
        date: examDateTime.toISOString(),
        duration: parseInt(formData.duration),
        totalQuestions: parseInt(formData.totalQuestions),
        isActive: true, // New exams are active by default
      };
      
      const response = await apiRequest("/exams", "POST", examData);
      
      toast({
        title: "Success",
        description: "Exam created successfully",
      });
      
      // Clear form and close modal
      setFormData({
        name: "",
        course: "",
        date: "",
        time: "",
        duration: 60,
        totalQuestions: 10,
        description: "",
        enableProctoring: true,
      });
      
      onClose();
      
      // Refresh the exam list
      if (onExamCreated) {
        onExamCreated(response);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create exam",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Create New Exam</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam-name">Exam Name</Label>
              <Input
                id="exam-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Midterm Examination"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="e.g. Computer Science 101"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="15"
                  step="5"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalQuestions">Total Questions</Label>
                <Input
                  id="totalQuestions"
                  name="totalQuestions"
                  type="number"
                  min="1"
                  value={formData.totalQuestions}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description about the exam"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="enableProctoring"
                name="enableProctoring"
                checked={formData.enableProctoring}
                onCheckedChange={(checked) => 
                  setFormData({...formData, enableProctoring: checked})
                }
              />
              <div className="space-y-1">
                <Label htmlFor="enableProctoring" className="font-medium text-gray-700">
                  Enable AI Proctoring
                </Label>
                <p className="text-sm text-gray-500">
                  Students will be monitored using webcam and AI detection during the exam.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-6 flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create Exam"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExamModal;
