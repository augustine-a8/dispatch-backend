import { Router } from "express";
import {
  addNewDriver,
  addNewMail,
  dispatchMail,
  getAllDrivers,
  getAllMails,
  getAllMailsForDriver,
  getMailByReferenceNumber,
  receiveMail,
} from "../controllers/mail.controller";
import {
  addNewDriverSchema,
  addNewMailSchema,
  dispatchMailSchema,
  receiveMailSchema,
} from "../validations/mail.validation";
import { checkAuthentication } from "../middleware/checkAuth";
import { validateRequest } from "../middleware/validateRequest";
import { Endpoint } from "../types";
import { asyncHandler } from "../lib/asyncWrapper";
import { isRegistrar } from "../middleware/isRegistrar";

const router = Router();

router.get("/", checkAuthentication, isRegistrar, asyncHandler(getAllMails));
router.get(
  "/:referenceNumber",
  checkAuthentication,
  isRegistrar,
  asyncHandler(getMailByReferenceNumber)
);
router.post(
  "/",
  checkAuthentication,
  isRegistrar,
  validateRequest(addNewMailSchema),
  asyncHandler(addNewMail)
);
router.post(
  "/dispatch",
  checkAuthentication,
  isRegistrar,
  validateRequest(dispatchMailSchema),
  asyncHandler(dispatchMail)
);
router.post(
  "/receive",
  checkAuthentication,
  validateRequest(receiveMailSchema),
  asyncHandler(receiveMail)
);
router.get(
  "/drivers",
  checkAuthentication,
  isRegistrar,
  asyncHandler(getAllDrivers)
);
router.post(
  "/drivers",
  checkAuthentication,
  validateRequest(addNewDriverSchema),
  asyncHandler(addNewDriver)
);
router.get(
  "/drivers/:id/mails",
  checkAuthentication,
  asyncHandler(getAllMailsForDriver)
);

const mailEndpoint: Endpoint = {
  path: "/mails",
  router,
};

export { mailEndpoint };
