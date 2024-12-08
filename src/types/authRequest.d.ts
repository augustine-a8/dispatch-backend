import { Request } from "express";

export interface AuthRequest extends Request {
  user?: any;
}

export type AuthUserType = "user" | "admin" | "HOD" | "archiver";

export interface IAuthUser {
  userId: string;
  email: string;
  role: AuthUserType;
}
