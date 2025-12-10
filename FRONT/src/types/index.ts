export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN'
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

// Updated User interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  credits: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  studentProfile?: StudentProfile;
  teacherProfile?: TeacherProfile;
}

// New model interfaces
export interface Institution {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    grades: number;
    students: number;
    teachers: number;
  };
}

export interface Grade {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  institutionId: string;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  institution?: {
    id: string;
    name: string;
  };
  teacher?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  _count?: {
    students: number;
  };
}

export interface StudentProfile {
  id: string;
  userId: string;
  institutionId: string;
  gradeId: string;
  enrollmentDate: string;
  studentId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  institution?: Institution;
  grade?: Grade; // Legacy single grade
  grades?: Array<{  // New many-to-many grades
    enrolledAt: string;
    isActive: boolean;
    grade: Grade;
  }>;
  user?: User;
}

export interface TeacherProfile {
  id: string;
  userId: string;
  institutionId: string;
  subject?: string;
  employmentDate: string;
  title?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  institution?: Institution;
  gradesInCharge?: Grade[];
  user?: User;
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
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  grade?: {
    id: string;
    name: string;
  };
  institution?: {
    id: string;
    name: string;
  };
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  type: ActivityType;
  content: any;
  visibility: ActivityVisibility;
  subject: string;
  gradeLevel?: string;
  aiProvider: AIProvider;
  creditCost?: number;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
  activityGrades?: Array<{
    grade: {
      id: string;
      name: string;
    };
  }>;
}

export interface CreditHistory {
  id: string;
  userId: string;
  amount: number;
  description: string;
  createdAt: string;
}

// Auth requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface RegisterWithCodeRequest {
  code: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  studentId?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// API requests
export interface CreateInstitutionRequest {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface CreateGradeRequest {
  name: string;
  description?: string;
  institutionId: string;
  teacherId: string;
}

export interface CreateTeacherRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  institutionId: string;
  subject?: string;
  title?: string;
  notes?: string;
}

export interface CreateStudentRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  institutionId: string;
  gradeId: string;
  notes?: string;
}

export interface GenerateCodeRequest {
  gradeId: string;
  description?: string;
  maxUses?: number;
  expiresAt?: string;
}

export interface GenerateActivityRequest {
  title: string;
  description?: string;
  type: ActivityType;
  visibility: ActivityVisibility;
  provider: AIProvider;
  prompt: string;
  subject?: string;
  gradeLevel?: string;
  duration?: string;
  difficulty?: string;
  language?: string;
  additionalInstructions?: string;
  additionalParams?: {
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
    // Word search specific
    tema?: string;
    cantidadPalabras?: number;
    gridSize?: number;
  };
}
