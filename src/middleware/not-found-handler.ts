import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

export const notFoundHandler = (
  req: Request,
  res: Response,
) => {
  res.status(StatusCodes.NOT_FOUND).json({
    error: 'Not Found',
    path: req.path,
  })
}