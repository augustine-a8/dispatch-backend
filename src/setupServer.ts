import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import { createRoutes } from "./routes";
import { mailEndpoint } from "./routes/mail.route";
import { driverEndpoint } from "./routes/driver.route";
import { errorHandler } from "./middleware";
import { Endpoint } from "./types";
import { swaggerOptions } from "./swagger";
import { authEndpoint } from "./routes/auth.route";

function createServer(): express.Express {
  const app = express();
  const swaggerSpec = swaggerJsdoc(swaggerOptions);

  const whitelist = [""];
  const corsOptionsDelegate = function (req: express.Request, callback: any) {
    let corsOptions;
    corsOptions = { origin: true, credentials: true };
    // if (whitelist.indexOf(req.header("Origin") as string) !== -1) {
    // } else {
    //   corsOptions = { origin: false, credentials: true };
    // }
    callback(null, corsOptions);
  };
  app.use(cors(corsOptionsDelegate));

  // app.use(cors());

  app.use(helmet());
  app.use(express.json());
  app.use(morgan("combined"));
  app.use(cookieParser());

  app.use(errorHandler);

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/welcome", (req: express.Request, res: express.Response) => {
    res.status(200).json({
      message: "Welcome to dispatch api v1",
    });
  });

  const endpoints: Endpoint[] = [mailEndpoint, driverEndpoint, authEndpoint];

  createRoutes(app, endpoints);

  return app;
}

export { createServer };
