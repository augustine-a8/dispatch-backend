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
import { isRegistrar } from "../middleware/isRegistrar";

const router = Router();

router.get("/", asyncHandler(getAllMails));
router.post("/", validateRequest(addNewMailSchema), asyncHandler(addNewMail));
router.post(
  "/dispatch",
  validateRequest(dispatchMailSchema),
  asyncHandler(dispatchMail)
);
router.post(
  "/receive",
  validateRequest(receiveMailSchema),
  asyncHandler(receiveMail)
);
router.get("/:referenceNumber", asyncHandler(getMailByReferenceNumber));

const mailEndpoint: Endpoint = {
  path: "/mails",
  router,
};

export { mailEndpoint };
