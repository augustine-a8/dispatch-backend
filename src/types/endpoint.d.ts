import { Router } from "express";

export interface Endpoint {
  path: string;
  router: Router;
}
