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
  subject?: string;
  grade?: string;
  institution?: string;
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
  grade: string;
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
  grade: string;
  additionalParams?: ExamParams | FlashcardParams | Record<string, any>;
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

export interface FlashcardParams {
  titulo?: string;
  descripcion?: string;
  nivelEducativo?: string;
  cantidadTarjetas?: number;
  tipo?: string;
  estilo?: string;
}

export interface AIGenerationResponse {
  content: any;
  tokensUsed?: number;
  provider: AIProvider;
}
