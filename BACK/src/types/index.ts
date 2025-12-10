export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export enum ActivityType {
  EXAM = 'EXAM',
  QUIZ = 'QUIZ',
  SUMMARY = 'SUMMARY',
  PRESENTATION = 'PRESENTATION',
  EMAIL = 'EMAIL',
  SURVEY = 'SURVEY',
  RUBRIC = 'RUBRIC',
  LESSON_PLAN = 'LESSON_PLAN',
  GAME = 'GAME',
  CHATBOT = 'CHATBOT',
  WRITING_CORRECTION = 'WRITING_CORRECTION',
  FLASHCARDS = 'FLASHCARDS',
  ESSAY = 'ESSAY',
  WORKSHEET = 'WORKSHEET',
  PROJECT = 'PROJECT',
  WORD_SEARCH = 'WORD_SEARCH',
}

export enum ActivityVisibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

export enum AIProvider {
  OPENAI = 'OPENAI',
  GEMINI = 'GEMINI',
  OLLAMA = 'OLLAMA',
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  credits: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Institution {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Grade {
  id: string;
  name: string;
  description?: string;
  subject?: string;
  level?: string;
  isActive: boolean;
  institutionId: string;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentProfile {
  id: string;
  userId: string;
  institutionId: string;
  gradeId: string;
  enrollmentDate: Date;
  studentId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  institutionId: string;
  subject?: string;
  employmentDate: Date;
  title?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvitationCode {
  id: string;
  code: string;
  gradeId: string;
  institutionId: string;
  createdBy: string;
  description?: string;
  maxUses?: number;
  usedCount: number;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  type: ActivityType;
  visibility: ActivityVisibility;
  content: any;
  subject: string;
  gradeLevel?: string; // Educational level metadata (e.g., "Secundaria", "Primaria")
  aiProvider: AIProvider;
  creditCost: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreditHistory {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string;
  aiProvider?: AIProvider;
  createdAt: Date;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AIGenerationRequest {
  prompt: string;
  provider: AIProvider;
  type: ActivityType;
  subject: string;
  grade?: string; // Now optional
  additionalParams?: ExamParams | Record<string, any>;
  pdfContext?: string;
  pdfFileName?: string;
}

export interface ExamParams {
  titulo?: string;
  descripcion?: string;
  materia?: string;
  nivelEducativo?: string;
  idioma?: string;
  duracion?: number;
  dificultad?: string;
  cantidadPreguntas?: number;
  cantidadOM?: number;
  cantidadVF?: number;
  instruccionesAdicionales?: string;
}

export interface AIGenerationResponse {
  content: any;
  tokensUsed?: number;
  provider: AIProvider;
}

