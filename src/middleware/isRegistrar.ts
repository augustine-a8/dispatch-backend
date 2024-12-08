import { NextFunction, Response } from "express";
import { AuthRequest } from "../types";

export function isRegistrar(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  if (user.role !== "registrar") {
    res.status(403).json({
      message: "Action not allowed",
    });
    return;
  }
  next();
}
