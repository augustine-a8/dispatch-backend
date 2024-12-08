import { DataSource } from "typeorm";
import { config } from "./config";

const {
  databaseHost: host,
  databaseName: database,
  databaseUser: username,
  databasePassword: password,
  databasePort: port,
} = config;

const AppDataSource = new DataSource({
  type: "postgres",
  host,
  database,
  username,
  password,
  port,
  logging: ["query", "error", "warn", "schema"],
  entities: [__dirname + "/entities/*.{ts, js}"],
});

export { AppDataSource };
