import { Router } from "express";
import { asyncHandler } from "../lib/asyncWrapper";
import {
  addNewDriver,
  getAllDrivers,
  getAllMailsForDriver,
  getDriverById,
} from "../controllers/user.controller";
import { validateRequest } from "../middleware";
import { addNewDriverSchema } from "../validations";
import { Endpoint } from "../types";
import { checkAuthentication } from "../middleware/checkAuth";
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

/**
 * @swagger
 * /api/drivers:
 *   get:
 *     summary: Get all drivers
 *     description: Retrieves a list of all drivers from the database.
 *     tags:
 *       - Driver
 *     responses:
 *       200:
 *         description: Retrieved all drivers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: "Retrieved all drivers"
 *                 drivers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error.
 */
router.get("/", checkAuthentication, asyncHandler(getAllDrivers));

/**
 * @swagger
 * /api/drivers:
 *   post:
 *     summary: Add a new driver
 *     description: Creates a new driver entry in the database.
 *     tags:
 *       - Driver
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the driver.
 *                 example: "John Doe"
 *               contact:
 *                 type: string
 *                 description: Contact information for the driver.
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: Driver added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: "New driver added"
 *                 driver:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Driver already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Driver with the same name and contact already exists"
 */
router.post(
  "/",
  checkAuthentication,
  validateRequest(addNewDriverSchema),
  asyncHandler(addNewDriver)
);

/**
 * @swagger
 * /api/drivers/{driverId}/mails:
 *   get:
 *     summary: Get all mails for a driver
 *     description: Retrieves all mail records assigned to a specific driver.
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the driver.
 *     responses:
 *       200:
 *         description: All mails for the driver retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: "All mails for driver retrieved"
 *                 mails:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Mail'
 *       404:
 *         description: Driver not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Driver with the provided ID not found"
 */
router.get(
  "/:id/mails",
  checkAuthentication,
  asyncHandler(getAllMailsForDriver)
);

router.get("/:id", checkAuthentication, isAdmin, asyncHandler(getDriverById));

const driverEndpoint: Endpoint = {
  path: "/drivers",
  router,
};

export { driverEndpoint };
