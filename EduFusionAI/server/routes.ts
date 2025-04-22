import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertExamSchema, insertEnrollmentSchema, insertAlertSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

// JWT Secret - should be in an environment variable in production
const JWT_SECRET = process.env.JWT_SECRET || "edufusion-secret-key";

// Set up file upload with multer
const storage_dir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(storage_dir)) {
  fs.mkdirSync(storage_dir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storage_dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ 
  storage: fileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG and PNG are allowed.'));
    }
  }
});

// Middleware to verify JWT token
const authenticateToken = (req: Request, res: Response, next: Function) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is a proctor
const isProctor = (req: Request, res: Response, next: Function) => {
  if (req.user && req.user.role === 'proctor') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Proctor role required' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS middleware
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // Authentication Routes
  
  // Register new user
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid data provided', error: error.message });
    }
  });
  
  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      
      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
      
      // Create token
      const token = jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Remove password from response
      const { password: pw, ...userWithoutPassword } = user;
      
      res.status(200).json({
        message: 'Login successful',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Get current user
  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Profile Routes
  
  // Upload profile picture
  app.post('/api/profile/upload', authenticateToken, upload.single('profilePicture'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const profilePicture = `/uploads/${req.file.filename}`;
      
      // Update user with new profile picture
      const updatedUser = await storage.updateUser(req.user.id, { profilePicture });
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json({
        message: 'Profile picture uploaded successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Update profile
  app.put('/api/profile', authenticateToken, async (req, res) => {
    try {
      const { name, email } = req.body;
      
      // Update user
      const updatedUser = await storage.updateUser(req.user.id, { name, email });
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.status(200).json({
        message: 'Profile updated successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Exam Routes
  
  // Create exam (proctor only)
  app.post('/api/exams', authenticateToken, isProctor, async (req, res) => {
    try {
      const examData = insertExamSchema.parse({
        ...req.body,
        proctorId: req.user.id
      });
      
      const exam = await storage.createExam(examData);
      
      res.status(201).json({
        message: 'Exam created successfully',
        exam
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid data provided', error: error.message });
    }
  });
  
  // Get all exams (proctor only)
  app.get('/api/exams', authenticateToken, isProctor, async (req, res) => {
    try {
      const exams = await storage.getExamsByProctor(req.user.id);
      res.status(200).json(exams);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Get active exams (for both roles)
  app.get('/api/exams/active', authenticateToken, async (req, res) => {
    try {
      let exams;
      
      if (req.user.role === 'proctor') {
        // Proctors see their own active exams
        const allExams = await storage.getExamsByProctor(req.user.id);
        exams = allExams.filter(exam => exam.isActive);
      } else {
        // Students see all active exams
        exams = await storage.getActiveExams();
      }
      
      res.status(200).json(exams);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Get exam by ID
  app.get('/api/exams/:id', authenticateToken, async (req, res) => {
    try {
      const exam = await storage.getExam(parseInt(req.params.id));
      
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      res.status(200).json(exam);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Update exam (proctor only)
  app.put('/api/exams/:id', authenticateToken, isProctor, async (req, res) => {
    try {
      const examId = parseInt(req.params.id);
      
      // Verify exam exists and belongs to this proctor
      const exam = await storage.getExam(examId);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      if (exam.proctorId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. You do not own this exam' });
      }
      
      const updatedExam = await storage.updateExam(examId, req.body);
      
      res.status(200).json({
        message: 'Exam updated successfully',
        exam: updatedExam
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Enrollment Routes
  
  // Enroll a student in an exam
  app.post('/api/enrollments', authenticateToken, async (req, res) => {
    try {
      const enrollmentData = insertEnrollmentSchema.parse({
        ...req.body,
        studentId: req.user.id
      });
      
      // Verify exam exists
      const exam = await storage.getExam(enrollmentData.examId);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      // Check if student is already enrolled
      const existingEnrollments = await storage.getEnrollmentsByStudent(req.user.id);
      const alreadyEnrolled = existingEnrollments.some(e => e.examId === enrollmentData.examId);
      
      if (alreadyEnrolled) {
        return res.status(400).json({ message: 'Student already enrolled in this exam' });
      }
      
      const enrollment = await storage.createEnrollment(enrollmentData);
      
      res.status(201).json({
        message: 'Enrolled successfully',
        enrollment
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid data provided', error: error.message });
    }
  });
  
  // Get student enrollments
  app.get('/api/enrollments/student', authenticateToken, async (req, res) => {
    try {
      const enrollments = await storage.getEnrollmentsByStudent(req.user.id);
      
      // Fetch exam details for each enrollment
      const enrollmentsWithExams = await Promise.all(
        enrollments.map(async enrollment => {
          const exam = await storage.getExam(enrollment.examId);
          return {
            ...enrollment,
            exam
          };
        })
      );
      
      res.status(200).json(enrollmentsWithExams);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Get enrollments for an exam (proctor only)
  app.get('/api/enrollments/exam/:examId', authenticateToken, isProctor, async (req, res) => {
    try {
      const examId = parseInt(req.params.examId);
      
      // Verify exam exists and belongs to this proctor
      const exam = await storage.getExam(examId);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      if (exam.proctorId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. You do not own this exam' });
      }
      
      const enrollments = await storage.getEnrollmentsByExam(examId);
      
      // Fetch student details for each enrollment
      const enrollmentsWithStudents = await Promise.all(
        enrollments.map(async enrollment => {
          const student = await storage.getUser(enrollment.studentId);
          // Remove password from student data
          const { password, ...studentWithoutPassword } = student || {};
          return {
            ...enrollment,
            student: studentWithoutPassword
          };
        })
      );
      
      res.status(200).json(enrollmentsWithStudents);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Update enrollment status (start/end exam)
  app.put('/api/enrollments/:id', authenticateToken, async (req, res) => {
    try {
      const enrollmentId = parseInt(req.params.id);
      const { status, startTime, endTime, completionPercentage } = req.body;
      
      // Verify enrollment exists
      const enrollment = await storage.getEnrollment(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({ message: 'Enrollment not found' });
      }
      
      // Students can only update their own enrollments, proctors can update any
      if (req.user.role !== 'proctor' && enrollment.studentId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const updatedEnrollment = await storage.updateEnrollment(enrollmentId, {
        status,
        startTime,
        endTime,
        completionPercentage
      });
      
      res.status(200).json({
        message: 'Enrollment updated successfully',
        enrollment: updatedEnrollment
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Alert Routes
  
  // Create alert (from ML model)
  app.post('/api/alerts', async (req, res) => {
    try {
      const alertData = insertAlertSchema.parse(req.body);
      
      const alert = await storage.createAlert(alertData);
      
      res.status(201).json({
        message: 'Alert created successfully',
        alert
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid data provided', error: error.message });
    }
  });
  
  // Get alerts for an exam (proctor only)
  app.get('/api/alerts/exam/:examId', authenticateToken, isProctor, async (req, res) => {
    try {
      const examId = parseInt(req.params.examId);
      
      // Verify exam exists and belongs to this proctor
      const exam = await storage.getExam(examId);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }
      
      if (exam.proctorId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. You do not own this exam' });
      }
      
      const alerts = await storage.getAlertsByExam(examId);
      
      // Fetch student details for each alert
      const alertsWithStudents = await Promise.all(
        alerts.map(async alert => {
          const student = await storage.getUser(alert.studentId);
          // Remove password from student data
          const { password, ...studentWithoutPassword } = student || {};
          return {
            ...alert,
            student: studentWithoutPassword
          };
        })
      );
      
      res.status(200).json(alertsWithStudents);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Update alert status (proctor only)
  app.put('/api/alerts/:id', authenticateToken, isProctor, async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      const { status } = req.body;
      
      // Verify alert exists
      const alert = await storage.getAlert(alertId);
      if (!alert) {
        return res.status(404).json({ message: 'Alert not found' });
      }
      
      // Verify proctor owns the exam
      const exam = await storage.getExam(alert.examId);
      if (exam?.proctorId !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. You do not own this exam' });
      }
      
      const updatedAlert = await storage.updateAlert(alertId, { status });
      
      res.status(200).json({
        message: 'Alert updated successfully',
        alert: updatedAlert
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // ML Model Integration Route
  
  // Endpoint for ML model to post proctoring results
  app.post('/api/ml/proctoring', async (req, res) => {
    try {
      const { examId, studentId, type, details } = req.body;
      
      // Create an alert based on the ML model's findings
      const alert = await storage.createAlert({
        examId,
        studentId,
        type,
        details,
        status: 'new'
      });
      
      res.status(201).json({
        message: 'Proctoring alert created',
        alert
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid data provided', error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
