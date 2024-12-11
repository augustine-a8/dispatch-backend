import { NextFunction, Response } from "express";
import { AuthRequest } from "../types";

export function isAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const user = req.user;
  if (user.role !== "admin") {
    res.status(403).json({
      message: "Action not allowed",
    });
    return;
  }
  next();
}
