import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Clock, AlertTriangle, Camera, CheckSquare } from "lucide-react";
import { getQuestionsForExam, startExam, completeExam } from "@/utils/api";

const StudentExam = () => {
  const { id: examId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const webcamRef = useRef(null);
  const timerRef = useRef(null);
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [examStatus, setExamStatus] = useState("loading"); // loading, starting, in_progress, submitting, completed
  const [enrollment, setEnrollment] = useState(null);
  const [webcamActive, setWebcamActive] = useState(false);
  const [showWarnDialog, setShowWarnDialog] = useState(false);
  const [examEndTime, setExamEndTime] = useState(null);
  
  useEffect(() => {
    const loadExamData = async () => {
      try {
        // Load questions for the exam
        const questionsData = await getQuestionsForExam(examId);
        setQuestions(questionsData);
        
        // Start the exam
        setExamStatus("starting");
        const enrollmentData = {
          id: `enrollment-${examId}-${user?.id}`, // This is for demo, real app would get this from the backend
          examId: examId,
          studentId: user?.id || 1,
          status: "in_progress",
          startTime: new Date().toISOString(),
          exam: {
            duration: 90 // Example duration in minutes
          }
        };
        
        setEnrollment(enrollmentData);
        
        // Calculate end time
        const endTime = new Date();
        endTime.setMinutes(endTime.getMinutes() + enrollmentData.exam.duration);
        setExamEndTime(endTime);
        
        // Set time remaining
        const durationInSeconds = enrollmentData.exam.duration * 60;
        setTimeRemaining(durationInSeconds);
        
        // Set initial blank answers
        const initialAnswers = {};
        questionsData.forEach(question => {
          initialAnswers[question.id] = null;
        });
        setSelectedAnswers(initialAnswers);
        
        setExamStatus("in_progress");
      } catch (error) {
        console.error("Error loading exam:", error);
        toast({
          title: "Error",
          description: "Failed to load the exam. Please try again.",
          variant: "destructive",
        });
        setLocation("/");
      }
    };
    
    loadExamData();
    
    // Cleanup on component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopWebcam();
    };
  }, [examId]);
  
  useEffect(() => {
    // Only start the timer when exam is in progress
    if (examStatus === "in_progress" && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [examStatus, timeRemaining]);
  
  // Format the time remaining
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        setWebcamActive(true);
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      toast({
        title: "Webcam Error",
        description: "Could not access webcam. Please ensure it is connected and permissions are granted.",
        variant: "destructive",
      });
      setShowWarnDialog(true);
    }
  };
  
  const stopWebcam = () => {
    if (webcamRef.current && webcamRef.current.srcObject) {
      const tracks = webcamRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      webcamRef.current.srcObject = null;
      setWebcamActive(false);
    }
  };
  
  const handleWebcamSetup = () => {
    startWebcam();
  };
  
  const handleAnswerSelect = (questionId, optionId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  const handleSubmitExam = async () => {
    try {
      setExamStatus("submitting");
      
      // Calculate completion percentage
      const answeredQuestions = Object.values(selectedAnswers).filter(answer => answer !== null).length;
      const completionPercentage = Math.round((answeredQuestions / questions.length) * 100);
      
      // Submit exam
      await completeExam(enrollment.id, completionPercentage);
      
      // Cleanup
      stopWebcam();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      setExamStatus("completed");
      
      toast({
        title: "Exam Completed",
        description: "Your exam has been submitted successfully.",
      });
      
      // Immediately redirect to dashboard
      setLocation("/");
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast({
        title: "Error",
        description: "Failed to submit the exam. Please try again.",
        variant: "destructive",
      });
      setExamStatus("in_progress");
    }
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  const totalAnswered = Object.values(selectedAnswers).filter(answer => answer !== null).length;
  const progressPercentage = questions.length ? Math.round((totalAnswered / questions.length) * 100) : 0;
  
  if (examStatus === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading exam...</p>
        </div>
      </div>
    );
  }
  
  if (examStatus === "starting") {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Preparing Your Exam</CardTitle>
            <CardDescription>Please wait while we set up your exam environment.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (examStatus === "completed") {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Exam Submitted</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-6">
            <CheckSquare className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-gray-500 mb-4">
              Your exam has been submitted successfully. You will be redirected to the dashboard.
            </p>
            <Progress value={100} className="mb-2" />
            <p className="text-sm text-gray-500">
              Completion: 100%
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setLocation("/")}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Exam Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <h1 className="text-xl font-semibold">Exam in Progress</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-1 text-orange-500" />
                <span className="font-mono text-lg font-bold">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                In Progress
              </Badge>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowWarnDialog(true)}
              >
                End Exam
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Main Content - Questions */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto max-w-5xl">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm text-gray-500">
                  {totalAnswered} of {questions.length} answered
                </span>
              </div>
              <Progress value={progressPercentage} />
            </div>
            
            {/* Current Question */}
            {currentQuestion ? (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Question {currentQuestionIndex + 1}
                  </CardTitle>
                  <CardDescription>
                    {currentQuestion.text}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup 
                    value={selectedAnswers[currentQuestion.id] || ""} 
                    onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button 
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="mb-6">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500">No questions available</p>
                </CardContent>
              </Card>
            )}
            
            {/* Submit button */}
            <div className="flex justify-center">
              <Button 
                size="lg" 
                variant={progressPercentage === 100 ? "default" : "outline"}
                onClick={handleSubmitExam}
                disabled={examStatus === "submitting"}
              >
                {examStatus === "submitting" 
                  ? "Submitting..." 
                  : `Submit Exam${progressPercentage < 100 ? ' (' + progressPercentage + '% Complete)' : ''}`
                }
              </Button>
            </div>
          </div>
        </div>
        
        {/* Sidebar - Webcam */}
        <div className="md:w-80 border-t md:border-t-0 md:border-l bg-white">
          <div className="p-4">
            <h3 className="font-medium mb-3">Proctoring Camera</h3>
            
            {webcamActive ? (
              <div className="space-y-4">
                <div className="bg-black rounded-lg overflow-hidden aspect-video">
                  <video 
                    ref={webcamRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Important</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Keep your face visible at all times. Any suspicious activity may be flagged.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                  <div className="text-center p-4">
                    <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Camera not active</p>
                  </div>
                </div>
                <Button onClick={handleWebcamSetup} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Enable Camera
                </Button>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Warning</p>
                      <p className="text-sm text-red-700 mt-1">
                        Webcam is required for this exam. Please enable your camera to continue.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Warning Dialog */}
      <AlertDialog open={showWarnDialog} onOpenChange={setShowWarnDialog}>
        <AlertDialogContent>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {!webcamActive 
              ? "The webcam is required for this exam. Without it, your progress may not be saved correctly."
              : "Are you sure you want to end this exam? Your current progress will be submitted."
            }
          </AlertDialogDescription>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowWarnDialog(false)}>
              Cancel
            </Button>
            {!webcamActive ? (
              <Button onClick={handleWebcamSetup}>
                Enable Camera
              </Button>
            ) : (
              <Button variant="destructive" onClick={handleSubmitExam}>
                End Exam
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentExam;
