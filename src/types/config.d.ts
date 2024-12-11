export interface IConfig {
  databaseHost: string;
  databaseName: string;
  databasePassword: string;
  databaseUser: string;
  databasePort: number;
  port: number;
  refreshTokenSecret: string;
  accessTokenSecret: string;
  serverUrl: string;
}
