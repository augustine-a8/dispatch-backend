import { v4 as uuidv4 } from "uuid";
import { Response, Request } from "express";

import { User, Mail, MailLog } from "../entities";
import { AppDataSource } from "../dataSource";
import { MailStatus } from "../types/mail";
import { Between, ILike } from "typeorm";

const MailRepository = AppDataSource.getRepository(Mail);
const MailLogRepository = AppDataSource.getRepository(MailLog);
const UserRepository = AppDataSource.getRepository(User);

async function getMailOverview(req: Request, res: Response) {
  const { date = "" } = req.query;
  const startDate = new Date(`${date}T00:00:00.000Z`);
  const endDate = new Date(`${date}T23:59:59.999Z`);

  const all = await MailRepository.find({
    where: { date: Between(new Date(startDate), new Date(endDate)) },
  });
  const delivered = await MailRepository.find({
    where: {
      status: MailStatus.DELIVERED,
      date: Between(new Date(startDate), new Date(endDate)),
    },
  });
  const transit = await MailRepository.find({
    where: {
      status: MailStatus.TRANSIT,
      date: Between(new Date(startDate), new Date(endDate)),
    },
  });
  const failed = await MailRepository.find({
    where: {
      status: MailStatus.FAILED,
      date: Between(new Date(startDate), new Date(endDate)),
    },
  });

  res.status(200).json({
    message: "Mails overview retrieved",
    totalMails: all.length,
    deliveredMails: delivered.length,
    transitMails: transit.length,
    failedMails: failed.length,
  });
}

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

  const mail = new Mail();
  mail.mailId = uuidv4();
  mail.addressee = (addressees as string[]).join(",");
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

  res.status(200).json({
    message: "New mail added",
    mail: savedMail,
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

async function getMailById(req: Request, res: Response) {
  const { id: mailId } = req.params;

  const mail = await MailRepository.findOne({
    where: { mailId },
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

  res.status(200).json({
    message: "Mail and mail log retrieved",
    mail,
  });
}

async function getMailLogsForMailById(req: Request, res: Response) {
  const { id: mailId } = req.params;
  const { start = 1, limit = 10 } = req.query;
  const startNumber = parseInt(start as string, 10);
  const pageSize = parseInt(limit as string, 10);

  const mail = await MailRepository.findOne({
    where: { mailId },
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

  const [mailLogs, totalMailLogs] = await MailLogRepository.findAndCount({
    relations: { mail: true },
    where: {
      mail: { mailId },
    },
    take: pageSize,
    skip: startNumber - 1,
  });
  const end = Math.min(totalMailLogs, startNumber + pageSize - 1);

  res.status(200).json({
    message: "Maillogs retrieved",
    mailLogs,
    meta: {
      total: totalMailLogs,
      start: startNumber,
      end,
    },
  });
}

async function dispatchMail(req: Request, res: Response) {
  const { driverId, mailIds } = req.body;

  const driver = await UserRepository.findOne({ where: { userId: driverId } });
  if (!driver) {
    res.status(404).json({
      message: "No driver with id provided",
    });
    return;
  }

  const promises = mailIds.map(async (mailId: string) => {
    const mail = await MailRepository.findOne({ where: { mailId } });

    if (!mail) {
      res.status(404).json({
        message: `No mail with id: ${mailId}`,
      });
      return;
    }

    mail.status = MailStatus.TRANSIT;
    mail.driverId = driverId;
    await mail.save();

    const mailLog = new MailLog();
    mailLog.mailLogId = uuidv4();
    mailLog.mailId = mail.mailId;
    mailLog.status = MailStatus.TRANSIT;
    mailLog.date = new Date();
    await mailLog.save();

    return mailId;
  });

  const promiseResults = await Promise.all(promises);
  const successfulDispatches = promiseResults.filter((item) => item);
  const failedDispatches = mailIds.filter(
    (mailId: string) => !successfulDispatches.includes(mailId)
  );

  res.status(200).json({
    message: "Dispatched mails",
    failedDispatches,
  });
}

async function receiveMail(req: Request, res: Response) {
  const { mailId } = req.params;
  const { receipient, receipientContact, receipientSignatureUrl } = req.body;

  const mail = await MailRepository.findOne({
    where: { mailId },
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

  mail.receipient = receipient;
  mail.receipientContact = receipientContact;
  mail.receipientSignatureUrl = receipientSignatureUrl;
  mail.receipientContact = receipientContact;
  mail.status = MailStatus.DELIVERED;
  mail.receivedAt = new Date();
  const updatedMail = await mail.save();

  const mailLog = new MailLog();
  mailLog.mailLogId = uuidv4();
  mailLog.mailId = mail.mailId;
  mailLog.status = MailStatus.DELIVERED;
  mailLog.date = new Date();
  await mailLog.save();

  res.status(200).json({
    message: "Mail received",
    mail: updatedMail,
  });
}

export {
  addNewMail,
  getAllMails,
  getMailById,
  dispatchMail,
  receiveMail,
  getMailOverview,
  getMailLogsForMailById,
};
