declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_HOST: string;
    DATABASE_PORT: string;
    DATABASE_USERNAME: string;
    DATABASE_PASSWORD: string;
    DATABASE_NAME: string;
    PORT: string;
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
  }
}
