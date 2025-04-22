import { 
  users, type User, type InsertUser,
  exams, type Exam, type InsertExam,
  enrollments, type Enrollment, type InsertEnrollment,
  alerts, type Alert, type InsertAlert
} from "@shared/schema";
import { MongoClient, ObjectId } from "mongodb";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, update: Partial<User>): Promise<User | undefined>;
  
  // Exam operations
  getExam(id: number): Promise<Exam | undefined>;
  getExams(): Promise<Exam[]>;
  getExamsByProctor(proctorId: number): Promise<Exam[]>;
  getActiveExams(): Promise<Exam[]>;
  createExam(exam: InsertExam): Promise<Exam>;
  updateExam(id: number, update: Partial<Exam>): Promise<Exam | undefined>;
  
  // Enrollment operations
  getEnrollment(id: number): Promise<Enrollment | undefined>;
  getEnrollmentsByStudent(studentId: number): Promise<Enrollment[]>;
  getEnrollmentsByExam(examId: number): Promise<Enrollment[]>;
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: number, update: Partial<Enrollment>): Promise<Enrollment | undefined>;
  
  // Alert operations
  getAlert(id: number): Promise<Alert | undefined>;
  getAlertsByExam(examId: number): Promise<Alert[]>;
  getAlertsByStudent(studentId: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, update: Partial<Alert>): Promise<Alert | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private exams: Map<number, Exam>;
  private enrollments: Map<number, Enrollment>;
  private alerts: Map<number, Alert>;
  private userIdCounter: number;
  private examIdCounter: number;
  private enrollmentIdCounter: number;
  private alertIdCounter: number;

  constructor() {
    this.users = new Map();
    this.exams = new Map();
    this.enrollments = new Map();
    this.alerts = new Map();
    this.userIdCounter = 1;
    this.examIdCounter = 1;
    this.enrollmentIdCounter = 1;
    this.alertIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, update: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...update };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Exam operations
  async getExam(id: number): Promise<Exam | undefined> {
    return this.exams.get(id);
  }

  async getExams(): Promise<Exam[]> {
    return Array.from(this.exams.values());
  }

  async getExamsByProctor(proctorId: number): Promise<Exam[]> {
    return Array.from(this.exams.values()).filter(exam => exam.proctorId === proctorId);
  }

  async getActiveExams(): Promise<Exam[]> {
    return Array.from(this.exams.values()).filter(exam => exam.isActive);
  }

  async createExam(insertExam: InsertExam): Promise<Exam> {
    const id = this.examIdCounter++;
    const createdAt = new Date();
    const exam: Exam = { ...insertExam, id, createdAt };
    this.exams.set(id, exam);
    return exam;
  }

  async updateExam(id: number, update: Partial<Exam>): Promise<Exam | undefined> {
    const exam = await this.getExam(id);
    if (!exam) return undefined;
    
    const updatedExam = { ...exam, ...update };
    this.exams.set(id, updatedExam);
    return updatedExam;
  }

  // Enrollment operations
  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    return this.enrollments.get(id);
  }

  async getEnrollmentsByStudent(studentId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      enrollment => enrollment.studentId === studentId
    );
  }

  async getEnrollmentsByExam(examId: number): Promise<Enrollment[]> {
    return Array.from(this.enrollments.values()).filter(
      enrollment => enrollment.examId === examId
    );
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const id = this.enrollmentIdCounter++;
    const enrollment: Enrollment = { ...insertEnrollment, id };
    this.enrollments.set(id, enrollment);
    return enrollment;
  }

  async updateEnrollment(id: number, update: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const enrollment = await this.getEnrollment(id);
    if (!enrollment) return undefined;
    
    const updatedEnrollment = { ...enrollment, ...update };
    this.enrollments.set(id, updatedEnrollment);
    return updatedEnrollment;
  }

  // Alert operations
  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async getAlertsByExam(examId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(
      alert => alert.examId === examId
    );
  }

  async getAlertsByStudent(studentId: number): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(
      alert => alert.studentId === studentId
    );
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.alertIdCounter++;
    const timestamp = new Date();
    const alert: Alert = { ...insertAlert, id, timestamp };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateAlert(id: number, update: Partial<Alert>): Promise<Alert | undefined> {
    const alert = await this.getAlert(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, ...update };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }
}

// MongoDB Storage implementation
export class MongoStorage implements IStorage {
  private client: MongoClient | null = null;
  private dbName = "edufusion";

  constructor(private uri: string) {}

  // Connect to MongoDB
  async connect() {
    if (!this.client) {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
    }
    return this.client.db(this.dbName);
  }

  // Helper to transform MongoDB _id to id for our interface
  private transformFromMongo(doc: any): any {
    if (!doc) return null;
    const { _id, ...rest } = doc;
    return { id: _id.toString(), ...rest };
  }

  // Helper to transform our id to MongoDB _id
  private transformToMongo(doc: any): any {
    if (!doc) return null;
    const { id, ...rest } = doc;
    return id ? { _id: new ObjectId(id), ...rest } : rest;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const db = await this.connect();
    const result = await db.collection("users").findOne({ _id: id });
    return result ? this.transformFromMongo(result) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const db = await this.connect();
    const result = await db.collection("users").findOne({ email });
    return result ? this.transformFromMongo(result) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await this.connect();
    const userToInsert = {
      ...insertUser,
      createdAt: new Date()
    };
    const result = await db.collection("users").insertOne(userToInsert);
    return {
      ...userToInsert,
      id: result.insertedId.toString()
    } as User;
  }

  async updateUser(id: number, update: Partial<User>): Promise<User | undefined> {
    const db = await this.connect();
    await db.collection("users").updateOne(
      { _id: id },
      { $set: update }
    );
    return this.getUser(id);
  }

  // Exam operations
  async getExam(id: number): Promise<Exam | undefined> {
    const db = await this.connect();
    const result = await db.collection("exams").findOne({ _id: id });
    return result ? this.transformFromMongo(result) : undefined;
  }

  async getExams(): Promise<Exam[]> {
    const db = await this.connect();
    const results = await db.collection("exams").find().toArray();
    return results.map(result => this.transformFromMongo(result));
  }

  async getExamsByProctor(proctorId: number): Promise<Exam[]> {
    const db = await this.connect();
    const results = await db.collection("exams").find({ proctorId }).toArray();
    return results.map(result => this.transformFromMongo(result));
  }

  async getActiveExams(): Promise<Exam[]> {
    const db = await this.connect();
    const results = await db.collection("exams").find({ isActive: true }).toArray();
    return results.map(result => this.transformFromMongo(result));
  }

  async createExam(insertExam: InsertExam): Promise<Exam> {
    const db = await this.connect();
    const examToInsert = {
      ...insertExam,
      createdAt: new Date()
    };
    const result = await db.collection("exams").insertOne(examToInsert);
    return {
      ...examToInsert,
      id: result.insertedId.toString()
    } as Exam;
  }

  async updateExam(id: number, update: Partial<Exam>): Promise<Exam | undefined> {
    const db = await this.connect();
    await db.collection("exams").updateOne(
      { _id: id },
      { $set: update }
    );
    return this.getExam(id);
  }

  // Enrollment operations
  async getEnrollment(id: number): Promise<Enrollment | undefined> {
    const db = await this.connect();
    const result = await db.collection("enrollments").findOne({ _id: id });
    return result ? this.transformFromMongo(result) : undefined;
  }

  async getEnrollmentsByStudent(studentId: number): Promise<Enrollment[]> {
    const db = await this.connect();
    const results = await db.collection("enrollments").find({ studentId }).toArray();
    return results.map(result => this.transformFromMongo(result));
  }

  async getEnrollmentsByExam(examId: number): Promise<Enrollment[]> {
    const db = await this.connect();
    const results = await db.collection("enrollments").find({ examId }).toArray();
    return results.map(result => this.transformFromMongo(result));
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const db = await this.connect();
    const result = await db.collection("enrollments").insertOne(insertEnrollment);
    return {
      ...insertEnrollment,
      id: result.insertedId.toString()
    } as Enrollment;
  }

  async updateEnrollment(id: number, update: Partial<Enrollment>): Promise<Enrollment | undefined> {
    const db = await this.connect();
    await db.collection("enrollments").updateOne(
      { _id: id },
      { $set: update }
    );
    return this.getEnrollment(id);
  }

  // Alert operations
  async getAlert(id: number): Promise<Alert | undefined> {
    const db = await this.connect();
    const result = await db.collection("alerts").findOne({ _id: id });
    return result ? this.transformFromMongo(result) : undefined;
  }

  async getAlertsByExam(examId: number): Promise<Alert[]> {
    const db = await this.connect();
    const results = await db.collection("alerts").find({ examId }).toArray();
    return results.map(result => this.transformFromMongo(result));
  }

  async getAlertsByStudent(studentId: number): Promise<Alert[]> {
    const db = await this.connect();
    const results = await db.collection("alerts").find({ studentId }).toArray();
    return results.map(result => this.transformFromMongo(result));
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const db = await this.connect();
    const alertToInsert = {
      ...insertAlert,
      timestamp: new Date()
    };
    const result = await db.collection("alerts").insertOne(alertToInsert);
    return {
      ...alertToInsert,
      id: result.insertedId.toString()
    } as Alert;
  }

  async updateAlert(id: number, update: Partial<Alert>): Promise<Alert | undefined> {
    const db = await this.connect();
    await db.collection("alerts").updateOne(
      { _id: id },
      { $set: update }
    );
    return this.getAlert(id);
  }
}

// Initialize memory storage for development
export const storage = new MemStorage();

// To use MongoDB, uncomment the following lines and set the MongoDB URI:
/*
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/edufusion";
export const storage = new MongoStorage(MONGODB_URI);
*/
