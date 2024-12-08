import { v4 as uuidv4 } from "uuid";
import { Response, Request } from "express";

import { User, Mail, MailLog } from "../entities";
import { AppDataSource } from "../dataSource";
import { MailStatus } from "../types/mail";
import { ILike } from "typeorm";

const MailRepository = AppDataSource.getRepository(Mail);
const MailLogRepository = AppDataSource.getRepository(MailLog);
const UserRepository = AppDataSource.getRepository(User);

async function addNewMail(req: Request, res: Response) {
  const { referenceNumber, addressees, organization } = req.body;

  const existingMailWithReferenceNumber = await MailRepository.find({
    where: { referenceNumber },
  });
  if (existingMailWithReferenceNumber.length > 0) {
    res.status(400).json({
      message: "Mail with reference number already exists",
    });
    return;
  }

  const promises = addressees.map(async (addressee: string) => {
    const mail = new Mail();
    mail.mailId = uuidv4();
    mail.addressee = addressee;
    mail.referenceNumber = referenceNumber;
    mail.organization = organization;
    mail.date = new Date();
    mail.status = MailStatus.PENDING;
    const savedMail = await MailRepository.save(mail);

    const mailLog = new MailLog();
    mailLog.mailLogId = uuidv4();
    mailLog.date = new Date();
    mailLog.mailId = savedMail.mailId;
    mailLog.status = MailStatus.PENDING;
    await MailLogRepository.save(mailLog);

    return savedMail;
  });

  const savedMails = await Promise.all(promises);

  res.status(200).json({
    message: "New mail added",
    savedMails,
  });
}

async function getAllMails(req: Request, res: Response) {
  const { start = 1, limit = 10, search = "" } = req.query;
  const startNumber = parseInt(start as string, 10);
  const pageSize = parseInt(limit as string, 10);
  const searchTerm = search as string;

  const [mails, total] = await MailRepository.findAndCount({
    where: [
      { organization: ILike(`%${searchTerm}%`) },
      { addressee: ILike(`%${search}%`) },
      { referenceNumber: ILike(`%${search}%`) },
    ],
    relations: {
      driver: true,
    },
    skip: startNumber - 1,
    take: pageSize,
  });

  const end = Math.min(total, startNumber + pageSize - 1);

  res.status(200).json({
    message: "All mails retrieved",
    mails,
    meta: {
      start: startNumber,
      end,
      total,
    },
  });
}

async function getMailByReferenceNumber(req: Request, res: Response) {
  const { referenceNumber } = req.params;
  const mail = await MailRepository.findOne({
    where: { referenceNumber },
    relations: {
      driver: true,
    },
  });

  if (!mail) {
    res.status(404).json({
      message: "No mail with id provided",
    });
    return;
  }

  const mailLogs = await MailLogRepository.find({
    relations: { mail: true },
    where: {
      mail: { referenceNumber },
    },
  });

  res.status(200).json({
    message: "Mail and mail log retrieved",
    mail,
    mailLogs,
  });
}

async function dispatchMail(req: Request, res: Response) {
  const { driverId, referenceNumbers } = req.body;

  const driver = await UserRepository.findOne({ where: { userId: driverId } });
  if (!driver) {
    res.status(404).json({
      message: "No driver with id provided",
    });
    return;
  }

  const promises = referenceNumbers.map(async (referenceNumber: string) => {
    const mails = await MailRepository.find({ where: { referenceNumber } });

    await MailRepository.update(
      { referenceNumber },
      { status: MailStatus.TRANSIT, driverId }
    );

    mails.forEach(async (mail) => {
      const mailLog = new MailLog();
      mailLog.mailLogId = uuidv4();
      mailLog.mailId = mail.mailId;
      mailLog.status = MailStatus.TRANSIT;
      mailLog.date = new Date();

      await mailLog.save();
    });

    return referenceNumber;
  });

  const promiseResults = await Promise.all(promises);
  const successfulDispatches = promiseResults.filter((item) => item);
  const failedDispatches = referenceNumbers.filter(
    (referenceNumber: string) => !successfulDispatches.includes(referenceNumber)
  );

  res.status(200).json({
    message: "Dispatched mails",
    failedDispatches,
  });
}

async function receiveMail(req: Request, res: Response) {
  const { referenceNumber } = req.params;
  const { receipient, receipientContact, receipientSignatureUrl } = req.body;

  const mails = await MailRepository.find({
    where: { referenceNumber },
    relations: {
      driver: true,
    },
  });
  if (mails.length === 0) {
    res.status(404).json({
      message: "No mails with reference number",
    });
    return;
  }

  await MailRepository.update(
    { referenceNumber },
    {
      receipient,
      receipientContact,
      receipientSignatureUrl,
      status: MailStatus.DELIVERED,
    }
  );

  mails.forEach(async (mail) => {
    const mailLog = new MailLog();
    mailLog.mailLogId = uuidv4();
    mailLog.mailId = mail.mailId;
    mailLog.status = MailStatus.DELIVERED;
    mailLog.date = new Date();

    await mailLog.save();
  });

  // TODO: Add to response object
  res.status(200).json({
    message: "Mail received",
  });
}

async function getAllDrivers(req: Request, res: Response) {
  const { start = 1, limit = 10, search = "" } = req.query;
  const startNumber = parseInt(start as string, 10);
  const pageSize = parseInt(limit as string, 10);
  const searchTerm = search as string;

  const [drivers, total] = await UserRepository.findAndCount({
    where: [
      { role: "driver", name: ILike(`%${searchTerm}%`) },
      { role: "driver", contact: ILike(`%${searchTerm}%`) },
    ],
    skip: startNumber - 1,
    take: pageSize,
  });

  const end = Math.min(total, startNumber + pageSize - 1);

  res.status(200).json({
    message: "retrieved all drivers",
    drivers,
    meta: {
      total,
      start: startNumber,
      end,
    },
  });
}

async function addNewDriver(req: Request, res: Response) {
  const { name, contact } = req.body;

  const existingDriver = await UserRepository.find({
    where: [{ name }, { contact }],
  });
  if (existingDriver.length > 0) {
    res.status(400).json({
      message: "Driver with name/contact already exists",
    });
    return;
  }

  const driver = new User();
  driver.userId = uuidv4();
  driver.name = name;
  driver.contact = contact;
  driver.role = "driver";
  const savedDriver = await UserRepository.save(driver);

  res.status(200).json({
    message: "New driver added",
    driver: savedDriver,
  });
}

async function getAllMailsForDriver(req: Request, res: Response) {
  const { id: driverId } = req.params;

  const driver = await UserRepository.findOne({ where: { userId: driverId } });
  if (!driver) {
    res.status(404).json({
      message: "Driver with id provided not found",
    });
    return;
  }

  const driverMails = await MailRepository.find({ where: { driverId } });

  res.status(200).json({
    message: "All mails for driver retrieved",
    driverMails,
  });
}

export {
  addNewMail,
  getAllMails,
  getMailByReferenceNumber,
  dispatchMail,
  receiveMail,
};
