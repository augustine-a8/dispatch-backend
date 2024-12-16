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
 *     description: Creates a new driver in the system. Automatically generates a username and password for the driver.
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
 *                 description: Full name of the driver.
 *                 example: John Doe
 *               contact:
 *                 type: string
 *                 description: Contact number of the driver.
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
 *                   example: "New driver added"
 *                 driver:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                       description: Auto-generated username for the driver.
 *                       example: "johndoe123"
 *                     password:
 *                       type: string
 *                       description: Auto-generated password for the driver.
 *                       example: "p@ssw0rd"
 *       400:
 *         description: A driver with the same name or contact already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Driver with name/contact already exists"
 *       500:
 *         description: Internal server error.
 */
router.post(
  "/",
  checkAuthentication,
  validateRequest(addNewDriverSchema),
  asyncHandler(addNewDriver)
);

/**
 * @swagger
 * /api/drivers/{id}/mails:
 *   get:
 *     summary: Get all mails for a specific driver
 *     description: Retrieves all mails assigned to a specific driver, with optional pagination.
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the driver.
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: query
 *         name: start
 *         required: false
 *         schema:
 *           type: integer
 *           description: The starting index for the paginated results.
 *           example: 1
 *         description: Defaults to 1 if not provided.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           description: The maximum number of results per page.
 *           example: 10
 *         description: Defaults to 10 if not provided.
 *     responses:
 *       200:
 *         description: Mails retrieved successfully for the specified driver.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All mails for driver retrieved"
 *                 driverMails:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Mail'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of mails for the driver.
 *                       example: 25
 *                     start:
 *                       type: integer
 *                       description: Starting index of the current page.
 *                       example: 1
 *                     end:
 *                       type: integer
 *                       description: Ending index of the current page.
 *                       example: 10
 *       404:
 *         description: Driver with the specified ID not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Driver with id provided not found"
 *       500:
 *         description: Internal server error.
 */
router.get(
  "/:id/mails",
  checkAuthentication,
  asyncHandler(getAllMailsForDriver)
);

/**
 * @swagger
 * /api/drivers/{id}:
 *   get:
 *     summary: Get driver details by ID
 *     description: Retrieves the details of a driver using their unique ID.
 *     tags:
 *       - Driver
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the driver.
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Driver details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Driver details retrieved"
 *                 driver:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: No driver found with the specified ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No driver with id found"
 *       500:
 *         description: Internal server error.
 */
router.get("/:id", checkAuthentication, isAdmin, asyncHandler(getDriverById));

const driverEndpoint: Endpoint = {
  path: "/drivers",
  router,
};

export { driverEndpoint };
