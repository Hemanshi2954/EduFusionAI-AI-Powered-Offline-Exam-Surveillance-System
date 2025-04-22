// Mock data for exams
export const mockExams = [
  {
    id: "1",
    title: "Introduction to Computer Science",
    description: "Basic concepts of programming and computer science fundamentals",
    duration: 90, // minutes
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    proctorId: "2",
    status: "scheduled",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
  },
  {
    id: "2",
    title: "Advanced Mathematics",
    description: "Calculus, differential equations, and linear algebra",
    duration: 120, // minutes
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago (active)
    proctorId: "2",
    status: "active",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days ago
  },
  {
    id: "3",
    title: "Database Systems",
    description: "SQL, database design, and data modeling",
    duration: 60, // minutes
    startTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    proctorId: "2",
    status: "completed",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
  },
  {
    id: "4",
    title: "Web Development Fundamentals",
    description: "HTML, CSS, and JavaScript basics",
    duration: 75, // minutes
    startTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(), // 3 days from now
    proctorId: "2",
    status: "scheduled",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  {
    id: "5",
    title: "Data Structures and Algorithms",
    description: "Analysis of algorithms, sorting, searching, and graph algorithms",
    duration: 150, // minutes
    startTime: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
    proctorId: "2",
    status: "scheduled",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
  }
];

// Mock data for student enrollments
export const mockEnrollments = [
  {
    id: "1",
    examId: "1",
    studentId: "1",
    status: "enrolled",
    startedAt: null,
    completedAt: null,
    score: null
  },
  {
    id: "2",
    examId: "2",
    studentId: "1",
    status: "in_progress",
    startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    completedAt: null,
    score: null
  },
  {
    id: "3",
    examId: "3",
    studentId: "1",
    status: "completed",
    startedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    completedAt: new Date(Date.now() - 47 * 60 * 60 * 1000).toISOString(), // 1 hour after start
    score: 85
  },
  {
    id: "4",
    examId: "5",
    studentId: "1",
    status: "enrolled",
    startedAt: null,
    completedAt: null,
    score: null
  }
];

// Mock data for alerts during exams
export const mockAlerts = [
  {
    id: "1",
    examId: "2",
    studentId: "1",
    type: "face_not_visible",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
    status: "pending",
    details: "Student's face is not visible in the camera"
  },
  {
    id: "2",
    examId: "2",
    studentId: "1",
    type: "multiple_faces",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    status: "resolved",
    details: "Multiple faces detected in the camera"
  },
  {
    id: "3",
    examId: "2",
    studentId: "1",
    type: "suspicious_object",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    status: "pending",
    details: "Possible forbidden object detected"
  },
  {
    id: "4",
    examId: "3",
    studentId: "1",
    type: "looking_away",
    timestamp: new Date(Date.now() - 47.5 * 60 * 60 * 1000).toISOString(), // During exam 3
    status: "resolved",
    details: "Student looking away from screen repeatedly"
  }
];

// Mock data for students (in a real app, this would be users with role = student)
export const mockStudents = [
  {
    id: "1",
    name: "John Student",
    email: "student@example.com",
    role: "student"
  },
  {
    id: "3",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "student"
  },
  {
    id: "4",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "student"
  },
  {
    id: "5",
    name: "Emily Davis",
    email: "emily@example.com",
    role: "student"
  }
];

// Mock data for exam questions
export const mockQuestions = [
  {
    id: "1",
    examId: "1",
    text: "What is the time complexity of binary search?",
    type: "multiple_choice",
    options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
    correctAnswer: "O(log n)"
  },
  {
    id: "2",
    examId: "1",
    text: "Which of the following is not a primitive data type in JavaScript?",
    type: "multiple_choice",
    options: ["string", "boolean", "array", "number"],
    correctAnswer: "array"
  },
  {
    id: "3",
    examId: "2",
    text: "Solve the integral: ∫ x² dx",
    type: "text",
    correctAnswer: "x³/3 + C"
  },
  {
    id: "4",
    examId: "2",
    text: "Find the derivative of f(x) = 3x² + 2x - 5",
    type: "text",
    correctAnswer: "f'(x) = 6x + 2"
  },
  {
    id: "5",
    examId: "3",
    text: "Write a SQL query to select all users where age > 18",
    type: "text",
    correctAnswer: "SELECT * FROM users WHERE age > 18;"
  }
];

// Helper function to get enrollment with exam details
export const getEnrollmentWithExamDetails = (enrollmentId) => {
  const enrollment = mockEnrollments.find(e => e.id === enrollmentId);
  if (!enrollment) return null;
  
  const exam = mockExams.find(e => e.id === enrollment.examId);
  if (!exam) return null;
  
  return {
    ...enrollment,
    exam
  };
};

// Helper function to get exam questions
export const getExamQuestions = (examId) => {
  return mockQuestions.filter(q => q.examId === examId);
};

// Helper function to get students for a specific exam
export const getStudentsForExam = (examId) => {
  const enrollments = mockEnrollments.filter(e => e.examId === examId);
  
  return enrollments.map(enrollment => {
    const student = mockStudents.find(s => s.id === enrollment.studentId);
    return {
      ...student,
      enrollmentStatus: enrollment.status,
      startedAt: enrollment.startedAt,
      completedAt: enrollment.completedAt,
      score: enrollment.score
    };
  });
};

// Helper function to get alerts for a student in a specific exam
export const getAlertsForStudentInExam = (examId, studentId) => {
  return mockAlerts.filter(a => a.examId === examId && a.studentId === studentId);
};
