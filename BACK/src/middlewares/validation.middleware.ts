import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Parse additionalParams if it's a JSON string (from FormData)
    if (req.body.additionalParams && typeof req.body.additionalParams === 'string') {
      try {
        req.body.additionalParams = JSON.parse(req.body.additionalParams);
      } catch (e) {
        // If parsing fails, leave it as is and let validation handle it
      }
    }

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      console.log('❌ VALIDATION ERROR:', error.details);
      console.log('📦 Request body:', req.body);
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message),
      });
    }

    return next();
  };
};
