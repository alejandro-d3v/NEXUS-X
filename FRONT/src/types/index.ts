export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
}

export enum ActivityType {
  EXAM = 'EXAM',
  SUMMARY = 'SUMMARY',
  LESSON_PLAN = 'LESSON_PLAN',
  QUIZ = 'QUIZ',
  FLASHCARDS = 'FLASHCARDS',
  ESSAY = 'ESSAY',
  PRESENTATION = 'PRESENTATION',
  WORKSHEET = 'WORKSHEET',
  PROJECT = 'PROJECT',
  RUBRIC = 'RUBRIC',
  GAME = 'GAME',
  WRITING_CORRECTION = 'WRITING_CORRECTION',
  SURVEY = 'SURVEY',
  OTHER = 'OTHER'
}

export enum ActivityVisibility {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC'
}

export enum AIProvider {
  OPENAI = 'OPENAI',
  GEMINI = 'GEMINI',
  OLLAMA = 'OLLAMA'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  type: ActivityType;
  content: string;
  visibility: ActivityVisibility;
  aiProvider: AIProvider;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreditHistory {
  id: string;
  userId: string;
  amount: number;
  description: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  subject: string | null;
  grade: string | null;
  institution: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface GenerateActivityRequest {
  title: string;
  description?: string;
  type: ActivityType;
  visibility: ActivityVisibility;
  aiProvider: AIProvider;
  prompt: string;
  subject?: string;
  gradeLevel?: string;
  duration?: string;
  difficulty?: string;
  language?: string;
  additionalInstructions?: string;
}
