import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: Joi.string().valid('ADMIN', 'TEACHER', 'STUDENT').optional(),
  subject: Joi.string().optional(),
  grade: Joi.string().optional(),
  institution: Joi.string().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const generateActivitySchema = Joi.object({
  prompt: Joi.string().optional().allow(''),
  provider: Joi.string().valid('OPENAI', 'GEMINI', 'OLLAMA').required(),
  type: Joi.string().valid(
    'EXAM',
    'QUIZ',
    'SUMMARY',
    'PRESENTATION',
    'EMAIL',
    'SURVEY',
    'RUBRIC',
    'LESSON_PLAN',
    'GAME',
    'CHATBOT',
    'WRITING_CORRECTION',
    'FLASHCARDS',
    'ESSAY'
  ).required(),
  subject: Joi.string().optional().allow(''),
  grade: Joi.string().optional().allow(''),
  title: Joi.string().optional(),
  description: Joi.string().optional().allow(''),
  visibility: Joi.string().valid('PRIVATE', 'PUBLIC').optional(),
  additionalParams: Joi.object({
    titulo: Joi.string().optional(),
    descripcion: Joi.string().optional(),
    materia: Joi.string().optional(),
    nivelEducativo: Joi.string().optional(),
    idioma: Joi.string().optional(),
    duracion: Joi.number().optional(),
    dificultad: Joi.string().optional(),
    cantidadPreguntas: Joi.number().optional(),
    cantidadOM: Joi.number().optional(),
    cantidadVF: Joi.number().optional(),
    instruccionesAdicionales: Joi.string().optional(),
    // Summary-specific fields
    longitud: Joi.string().optional(),
    enfoque: Joi.string().optional(),
    // Rubric-specific fields
    numeroCriterios: Joi.number().optional(),
    numeroNiveles: Joi.number().optional(),
    puntajeMaximo: Joi.number().optional(),
    // Flashcards-specific fields
    cantidadTarjetas: Joi.number().optional(),
    tipo: Joi.string().optional(),
    estilo: Joi.string().optional(),
    // Essay-specific fields
    tema: Joi.string().optional(),
    numeroPaginas: Joi.number().optional(),
    tipoEnsayo: Joi.string().optional(),
    formatoCitas: Joi.string().optional(),
    // Game-specific fields
    tipoJuego: Joi.string().optional(),
    numeroPalabras: Joi.number().optional(),
  }).optional(),
});

export const updateActivitySchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  visibility: Joi.string().valid('PRIVATE', 'PUBLIC').optional(),
});

export const addCreditsSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  subject: Joi.string().optional(),
  grade: Joi.string().optional(),
  institution: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});
