import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  jwt: {
    secret: (process.env.JWT_SECRET as string) || 'default-secret-change-this',
    expiresIn: (process.env.JWT_EXPIRES_IN as string) || '7d',
  },
  
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
    },
    ollama: {
      baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      model: process.env.OLLAMA_MODEL || 'llama2',
    },
  },
  
  credits: {
    default: parseInt(process.env.DEFAULT_CREDITS || '500'),
    costs: {
      openai: parseInt(process.env.CREDIT_COST_OPENAI || '10'),
      gemini: parseInt(process.env.CREDIT_COST_GEMINI || '8'),
      ollama: parseInt(process.env.CREDIT_COST_OLLAMA || '0'),
    },
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
};
