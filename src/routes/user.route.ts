import { Router } from "express";
import { asyncHandler } from "../lib/asyncWrapper";
import {
  addNewDriver,
  deleteUsers,
  editUser,
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
 *       - User
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
 *       - User
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
 *       - User
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *           default: 1
 *           description: The starting index of the records to retrieve.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           description: The maximum number of records to retrieve.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           description: A search term to filter mails by organization, addressee, or reference number.
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *           description: The start date for filtering mails (inclusive).
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *           description: The end date for filtering mails (inclusive).
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
 * api/drivers:
 *   delete:
 *     summary: Delete users by IDs
 *     description: Deletes multiple users based on their IDs.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of user IDs to delete.
 *                 example: ["123e4567-e89b-12d3-a456-426614174000", "123e4567-e89b-12d3-a456-426614174001"]
 *     responses:
 *       200:
 *         description: Users deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Users deleted successfully."
 *                 deletedUserIds:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: List of IDs of the deleted users.
 *                   example: ["123e4567-e89b-12d3-a456-426614174000", "123e4567-e89b-12d3-a456-426614174001"]
 *       404:
 *         description: No users found with the provided IDs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No users found with the provided IDs."
 *       500:
 *         description: Internal server error.
 */
router.delete("/", checkAuthentication, isAdmin, asyncHandler(deleteUsers));

/**
 * @swagger
 * /api/drivers/{id}:
 *   get:
 *     summary: Get driver details by ID
 *     description: Retrieves the details of a driver using their unique ID.
 *     tags:
 *       - User
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

/**
 * @swagger
 * api/drivers/{id}:
 *   put:
 *     summary: Edit a user
 *     description: Updates the details of an existing user by their ID. Only provided fields will be updated.
 *     tags:
 *       - User
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to edit.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The updated name of the user.
 *                 example: "John Doe"
 *               contact:
 *                 type: string
 *                 description: The updated contact information for the user.
 *                 example: "+123456789"
 *               username:
 *                 type: string
 *                 description: The updated username of the user.
 *                 example: "johndoe123"
 *               password:
 *                 type: string
 *                 description: The updated password for the user.
 *                 example: "SecurePass123"
 *     responses:
 *       200:
 *         description: User details updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User details updated"
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     contact:
 *                       type: string
 *                       example: "+123456789"
 *                     username:
 *                       type: string
 *                       example: "johndoe123"
 *       404:
 *         description: User not found with the provided ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No user with id"
 *       500:
 *         description: Internal server error.
 */
router.put("/:id", checkAuthentication, asyncHandler(editUser));

const driverEndpoint: Endpoint = {
  path: "/users",
  router,
};

export { driverEndpoint };
