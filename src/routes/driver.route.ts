import { Router } from "express";
import { asyncHandler } from "../lib/asyncWrapper";
import {
  addNewDriver,
  getAllDrivers,
  getAllMailsForDriver,
} from "../controllers/driver.controller";
import { validateRequest } from "../middleware";
import { addNewDriverSchema } from "../validations";
import { Endpoint } from "../types";

const router = Router();

router.get("/", asyncHandler(getAllDrivers));
router.post(
  "/",
  validateRequest(addNewDriverSchema),
  asyncHandler(addNewDriver)
);
router.get("/:id/mails", asyncHandler(getAllMailsForDriver));

const driverEndpoint: Endpoint = {
  path: "/drivers",
  router,
};

export { driverEndpoint };
