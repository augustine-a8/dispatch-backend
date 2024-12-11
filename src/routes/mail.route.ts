import { Router } from "express";
import {
  addNewMail,
  dispatchMail,
  getAllMails,
  getMailByReferenceNumber,
  receiveMail,
} from "../controllers/mail.controller";
import {
  addNewMailSchema,
  dispatchMailSchema,
  receiveMailSchema,
} from "../validations/mail.validation";
import { checkAuthentication } from "../middleware/checkAuth";
import { validateRequest } from "../middleware/validateRequest";
import { Endpoint } from "../types";
import { asyncHandler } from "../lib/asyncWrapper";
import { isAdmin } from "../middleware/isAdmin";

const router = Router();

/**
 * @swagger
 * /api/mails:
 *   get:
 *     summary: Get all mail records
 *     description: Retrieves all mail records from the database with additional metadata.
 *     tags:
 *       - Mail
 *     responses:
 *       200:
 *         description: A list of mail records along with metadata.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Description of the operation outcome.
 *                   example: "All mails retrieved"
 *                 mails:
 *                   type: array
 *                   description: Array of mail records.
 *                   items:
 *                     $ref: '#/components/schemas/Mail' # Reference the Mail schema
 *                 meta:
 *                   type: object
 *                   description: Pagination metadata.
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of records.
 *                       example: 100
 *                     start:
 *                       type: integer
 *                       description: Starting index of the records.
 *                       example: 1
 *                     end:
 *                       type: integer
 *                       description: Ending index of the records.
 *                       example: 10
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Error fetching mails"
 */
router.get("/", checkAuthentication, isAdmin, asyncHandler(getAllMails));

/**
 * @swagger
 * /api/mails:
 *   post:
 *     summary: Add a new mail entry
 *     description: Adds a new mail entry to the database if the reference number is unique.
 *     tags:
 *       - Mail
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referenceNumber:
 *                 type: string
 *                 description: Unique reference number for the mail.
 *                 example: "REF123456"
 *               addressees:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of addressees for the mail.
 *                 example: ["John Doe", "Jane Smith"]
 *               organization:
 *                 type: string
 *                 description: Organization associated with the mail.
 *                 example: "ABC Corp"
 *     responses:
 *       200:
 *         description: Mail successfully added.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message.
 *                   example: "New mail added"
 *                 mails:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Mail'
 *       400:
 *         description: Mail with reference number already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Mail with reference number already exists"
 */
router.post(
  "/",
  checkAuthentication,
  isAdmin,
  validateRequest(addNewMailSchema),
  asyncHandler(addNewMail)
);

/**
 * @swagger
 * /api/mails/dispatch:
 *   post:
 *     summary: Dispatch mails to a driver
 *     description: Assigns mails to a driver using their ID and a list of reference numbers. Updates mail status to dispatched.
 *     tags:
 *       - Mail
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               driverId:
 *                 type: string
 *                 description: ID of the driver to whom mails will be dispatched.
 *                 example: "driver123"
 *               referenceNumbers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of reference numbers for mails to dispatch.
 *                 example: ["REF123456", "REF789101"]
 *     responses:
 *       200:
 *         description: Mails dispatched successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: "Mails successfully dispatched"
 *       404:
 *         description: Driver with the provided ID not found.
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
router.post(
  "/dispatch",
  checkAuthentication,
  isAdmin,
  validateRequest(dispatchMailSchema),
  asyncHandler(dispatchMail)
);

/**
 * @swagger
 * /api/mails/{referenceNumber}/receive:
 *   post:
 *     summary: Mark a mail as received
 *     description: Updates the status of a mail to 'Received' and records recipient details.
 *     tags:
 *       - Mail
 *     parameters:
 *       - in: path
 *         name: referenceNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The reference number of the mail.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipient:
 *                 type: string
 *                 description: Name of the recipient.
 *                 example: "John Doe"
 *               recipientContact:
 *                 type: string
 *                 description: Contact information of the recipient.
 *                 example: "+1234567890"
 *               recipientSignatureUrl:
 *                 type: string
 *                 description: URL of the recipient's signature.
 *                 example: "https://example.com/signature.jpg"
 *     responses:
 *       200:
 *         description: Mail marked as received successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: "Mail received"
 *       404:
 *         description: Mail not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Mail not found"
 */
router.post(
  "/:referenceNumber/receive",
  checkAuthentication,
  validateRequest(receiveMailSchema),
  asyncHandler(receiveMail)
);

/**
 * @swagger
 * /api/mails/{referenceNumber}:
 *   get:
 *     summary: Get mail by reference number
 *     description: Retrieves mail details and logs using a unique reference number.
 *     tags:
 *       - Mail
 *     parameters:
 *       - in: path
 *         name: referenceNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: The reference number of the mail.
 *     responses:
 *       200:
 *         description: Mail and log details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: "Mail and mail log retrieved"
 *                 mail:
 *                   $ref: '#/components/schemas/Mail'
 *                 mailLogs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MailLog'
 *       404:
 *         description: Mail not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "Mail not found"
 */
router.get("/:referenceNumber", asyncHandler(getMailByReferenceNumber));

const mailEndpoint: Endpoint = {
  path: "/mails",
  router,
};

export { mailEndpoint };
