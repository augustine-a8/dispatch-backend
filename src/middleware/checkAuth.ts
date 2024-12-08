import { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";

import { AuthRequest } from "../types/authRequest";
import { config } from "../config";

const { accessTokenSecret } = config;

function checkAuthentication(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.accessToken;
  if (!token) {
    res.status(403).json({
      message: "Auth token not provided",
    });
    return;
  }

  jwt.verify(token, accessTokenSecret as string, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Access Denied: Invalid token" });
    }

    req.user = user;
    next();
  });
}

export { checkAuthentication };
