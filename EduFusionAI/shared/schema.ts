import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
  role: true,
  profilePicture: true
});

// Exam schema
export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  course: text("course").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(), // in minutes
  totalQuestions: integer("total_questions").notNull(),
  isActive: boolean("is_active").default(false),
  proctorId: integer("proctor_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertExamSchema = createInsertSchema(exams).pick({
  name: true,
  course: true,
  description: true,
  date: true,
  duration: true,
  totalQuestions: true,
  isActive: true,
  proctorId: true
});

// Exam enrollment schema
export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").notNull(),
  studentId: integer("student_id").notNull(),
  status: text("status").notNull().default("enrolled"), // enrolled, in-progress, completed
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  completionPercentage: integer("completion_percentage").default(0)
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).pick({
  examId: true,
  studentId: true,
  status: true,
  startTime: true,
  endTime: true,
  completionPercentage: true
});

// Proctoring alerts schema
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").notNull(),
  studentId: integer("student_id").notNull(),
  type: text("type").notNull(), // face-not-visible, multiple-faces, phone-detected, etc.
  timestamp: timestamp("timestamp").defaultNow(),
  details: jsonb("details"),
  status: text("status").notNull().default("new") // new, reviewed, flagged, resolved
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  examId: true,
  studentId: true,
  type: true,
  details: true,
  status: true
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof exams.$inferSelect;

export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
