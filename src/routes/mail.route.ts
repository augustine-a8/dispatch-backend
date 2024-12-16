import { Router } from "express";
import {
  addNewMail,
  dispatchMail,
  getAllMails,
  getMailById,
  getMailLogsForMailById,
  getMailOverview,
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
 * /mails/overview:
 *   get:
 *     summary: Get mail overview for a specific date
 *     description: Retrieve an overview of mails, including total, delivered, in transit, and failed mails for a specific date.
 *     tags:
 *       - Mail
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: The date for which the mail overview is retrieved (YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Successfully retrieved the mail overview.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                   example: "Mails overview retrieved"
 *                 totalMails:
 *                   type: integer
 *                   description: Total number of mails for the specified date.
 *                   example: 50
 *                 deliveredMails:
 *                   type: integer
 *                   description: Number of mails delivered on the specified date.
 *                   example: 30
 *                 transitMails:
 *                   type: integer
 *                   description: Number of mails in transit on the specified date.
 *                   example: 15
 *                 failedMails:
 *                   type: integer
 *                   description: Number of mails that failed delivery on the specified date.
 *                   example: 5
 *       400:
 *         description: Invalid or missing date query parameter.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid date format. Please use YYYY-MM-DD."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error retrieving mail overview."
 */
router.get(
  "/overview",
  checkAuthentication,
  isAdmin,
  asyncHandler(getMailOverview)
);

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
 *               mailIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: List of reference numbers for mails to dispatch.
 *                 example: ["550e8400-e29b-41d4-a716-446655440000", "9a8b7c6d-5e4f-3a2b-1c0d-ffeeddccbbaa"]
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
 * /api/mails/{mailId}/receive:
 *   post:
 *     summary: Mark a mail as received
 *     description: Updates the status of a mail to 'Received' and records recipient details.
 *     tags:
 *       - Mail
 *     parameters:
 *       - in: params
 *         name: mailId
 *         required: true
 *         schema:
 *           type: string
 *         description: The id of the mail.
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
  "/:id/receive",
  checkAuthentication,
  validateRequest(receiveMailSchema),
  asyncHandler(receiveMail)
);

/**
 * @swagger
 * /api/mails/{mailId}:
 *   get:
 *     summary: Get mail by mail id
 *     description: Retrieves mail details using a unique mail id.
 *     tags:
 *       - Mail
 *     parameters:
 *       - in: params
 *         name: mailId
 *         required: true
 *         schema:
 *           type: string
 *         description: The id of the mail.
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
router.get("/:id", asyncHandler(getMailById));

/**
 * @swagger
 * /mails/{id}/logs:
 *   get:
 *     summary: Get mail logs for a specific mail by ID
 *     description: Retrieves the logs for a specific mail, paginated by `start` and `limit`.
 *     tags:
 *       - Mail Logs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the mail.
 *       - in: query
 *         name: start
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The starting index for the pagination (default is 1).
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of logs to retrieve per page (default is 10).
 *     responses:
 *       200:
 *         description: Mail logs retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Maillogs retrieved"
 *                 mailLogs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MailLog'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     start:
 *                       type: integer
 *                       example: 1
 *                     end:
 *                       type: integer
 *                       example: 10
 *       404:
 *         description: No mail found with the provided ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No mail with id provided"
 *       500:
 *         description: Internal server error.
 */
router.get("/:id/logs", asyncHandler(getMailLogsForMailById));

const mailEndpoint: Endpoint = {
  path: "/mails",
  router,
};

export { mailEndpoint };
