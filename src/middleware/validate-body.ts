import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ValidationError } from "../types/app-error";

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success){
      throw new ValidationError(
        'Payload Validation Failed',
        result.error.issues
      );
    }
    req.body = result.data;
    next()
  }
}