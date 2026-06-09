import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, FieldValidationError } from 'express-validator';

export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    for (const validation of validations) {
      await validation.run(req);
    }

    const errors = validationResult(req).array() as FieldValidationError[];
    if (errors.length > 0) {
      res.status(400).json({
        error: 'validation failed',
        statusCode: 400,
        details: errors.map((e) => ({ field: e.path, message: e.msg })),
      });
      return;
    }

    next();
  };
}
