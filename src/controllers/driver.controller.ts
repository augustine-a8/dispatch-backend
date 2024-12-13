import { v4 as uuidv4 } from "uuid";
import { Response, Request } from "express";

import { User, Mail, MailLog } from "../entities";
import { AppDataSource } from "../dataSource";
import { ILike } from "typeorm";
import { MailStatus } from "../types/mail";
import { generatePassword, generateUsername, hashPassword } from "../lib/util";

const MailRepository = AppDataSource.getRepository(Mail);
const UserRepository = AppDataSource.getRepository(User);

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

  const generatedPassword = generatePassword(8);
  const generatedUsername = generateUsername(name);

  const driver = new User();
  driver.userId = uuidv4();
  driver.name = name;
  driver.contact = contact;
  driver.role = "driver";
  driver.password = hashPassword(generatedPassword);
  driver.username = generatedUsername;

  await UserRepository.save(driver);

  res.status(200).json({
    message: "New driver added",
    driver: {
      username: generateUsername,
      password: generatedPassword,
    },
  });
}

async function getAllMailsForDriver(req: Request, res: Response) {
  const { id: driverId } = req.params;
  const { status = "pending" } = req.query;

  const mailStatus = status as MailStatus;

  const driver = await UserRepository.findOne({ where: { userId: driverId } });
  if (!driver) {
    res.status(404).json({
      message: "Driver with id provided not found",
    });
    return;
  }

  const driverMails = await MailRepository.find({
    where: { driverId },
  });

  res.status(200).json({
    message: "All mails for driver retrieved",
    driverMails,
  });
}

export { getAllDrivers, getAllMailsForDriver, addNewDriver };
