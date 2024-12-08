import { Express } from "express";
import { Endpoint } from "../types";

function createRoutes(app: Express, endpoints: Endpoint[]) {
  endpoints.forEach((endpoint) => {
    const { path, router } = endpoint;
    app.use(`/api${path}`, router);
  });
}

export { createRoutes };
