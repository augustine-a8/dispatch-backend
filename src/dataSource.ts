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
  entities: [__dirname + "/entities/*.{ts,js}"],
  synchronize: true,
  logging: ["query", "error", "warn", "schema"],
});

export { AppDataSource };
