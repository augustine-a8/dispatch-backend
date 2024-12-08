import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

export const validateRequest = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false }); // abortEarly=false for detailed error messages
    if (error) {
      res.status(400).json({
        errors: error.details.map((detail) => detail.message),
      });
      return;
    }
    next();
  };
};
