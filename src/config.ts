import { IConfig } from "./types/config";

export const config: IConfig = {
  port: parseInt(process.env.PORT as string, 10) || 8000,
  databasePort: parseInt(process.env.DATABASE_PORT as string, 10),
  databaseHost: String(process.env.DATABASE_HOST),
  databaseName: String(process.env.DATABASE_NAME),
  databaseUser: String(process.env.DATABASE_USERNAME),
  databasePassword: String(process.env.DATABASE_PASSWORD),
  accessTokenSecret: String(process.env.ACCESS_TOKEN_SECRET),
  refreshTokenSecret: String(process.env.REFRESH_TOKEN_SECRET),
  serverUrl: String(process.env.SERVER_URL),
};
