import jwt from "jsonwebtoken";
import { config } from "../config";
import { IAuthUser } from "../types/auth";

const { accessTokenSecret, refreshTokenSecret } = config;

function generateToken(authUser: IAuthUser) {
  const options = { expiresIn: "2h" };

  return jwt.sign(authUser, accessTokenSecret as string, options);
}

function generateRefreshToken(authUser: IAuthUser) {
  const options = { expiresIn: "1d" };

  return jwt.sign(authUser, refreshTokenSecret as string, options);
}

export { generateToken, generateRefreshToken };
