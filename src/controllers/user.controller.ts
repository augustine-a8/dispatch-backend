import { v4 as uuidv4 } from "uuid";
import { Response, Request } from "express";

import { User, Mail, MailLog } from "../entities";
import { AppDataSource } from "../dataSource";
import { Between, ILike } from "typeorm";
import { MailStatus } from "../types/mail";
import {
  generatePassword,
  generateUsername,
  getToday,
  hashPassword,
} from "../lib/util";

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

async function getDriverById(req: Request, res: Response) {
  const { id: driverId } = req.params;

  const driver = await UserRepository.findOne({
    where: {
      role: "driver",
      userId: driverId,
    },
  });

  if (!driver) {
    res.status(404).json({
      message: "No driver with id found",
    });
    return;
  }

  res.status(200).json({
    message: "Driver details retrieved",
    driver,
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

  const generatedUsername = generateUsername(name);
  const generatedPassword = generatePassword(8);

  const driver = new User();
  driver.userId = uuidv4();
  driver.name = name;
  driver.contact = contact;
  driver.role = "driver";
  driver.unhashedPassword = generatedPassword;
  driver.username = generatedUsername;
  driver.password = hashPassword(generatedPassword);
  const savedDriver = await UserRepository.save(driver);

  res.status(200).json({
    message: "New driver added",
    driver: {
      username: generatedUsername,
      password: generatedPassword,
    },
  });
}

async function getAllMailsForDriver(req: Request, res: Response) {
  const { id: driverId } = req.params;
  const { start = 1, limit = 10, search = "", from, to } = req.query;

  const startNumber = parseInt(start as string, 10);
  const pageSize = parseInt(limit as string, 10);
  const searchTerm = search as string;

  if (from && to) {
    const startDate = new Date(`${from}T00:00:00.000Z`);
    const endDate = new Date(`${to}T23:59:59.999Z`);

    const driver = await UserRepository.findOne({
      where: { userId: driverId },
    });
    if (!driver) {
      res.status(404).json({
        message: "Driver with id provided not found",
      });
      return;
    }

    const [driverMails, totalDriverMails] = await MailRepository.findAndCount({
      where: [
        {
          driverId,
          organization: ILike(`%${searchTerm}%`),
          date: Between(new Date(startDate), new Date(endDate)),
        },
        {
          driverId,
          referenceNumber: ILike(`%${searchTerm}%`),
          date: Between(new Date(startDate), new Date(endDate)),
        },
        {
          driverId,
          addressee: ILike(`%${searchTerm}%`),
          date: Between(new Date(startDate), new Date(endDate)),
        },
      ],
      skip: startNumber - 1,
      take: pageSize,
    });
    const end = Math.min(totalDriverMails, startNumber + pageSize - 1);

    res.status(200).json({
      message: "All mails for driver retrieved",
      driverMails,
      meta: {
        total: totalDriverMails,
        start: startNumber,
        end,
      },
    });
  } else {
    const driver = await UserRepository.findOne({
      where: { userId: driverId },
    });
    if (!driver) {
      res.status(404).json({
        message: "Driver with id provided not found",
      });
      return;
    }

    const [driverMails, totalDriverMails] = await MailRepository.findAndCount({
      where: [
        {
          driverId,
          organization: ILike(`%${searchTerm}%`),
        },
        {
          driverId,
          referenceNumber: ILike(`%${searchTerm}%`),
        },
        {
          driverId,
          addressee: ILike(`%${searchTerm}%`),
        },
      ],
      skip: startNumber - 1,
      take: pageSize,
    });
    const end = Math.min(totalDriverMails, startNumber + pageSize - 1);

    res.status(200).json({
      message: "All mails for driver retrieved",
      driverMails,
      meta: {
        total: totalDriverMails,
        start: startNumber,
        end,
      },
    });
  }
}

export { getAllDrivers, getAllMailsForDriver, addNewDriver, getDriverById };
