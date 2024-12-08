import cron from "node-cron";
import { AppDataSource } from "../dataSource";
import { Mail, MailLog } from "../entities";
import { MailStatus } from "../types/mail";
import { Between } from "typeorm";

class AutoFailServiceSingleton {
  private static instance: AutoFailServiceSingleton | null = null;

  public getInstance() {
    if (AutoFailServiceSingleton.instance === null) {
      AutoFailServiceSingleton.instance = new AutoFailServiceSingleton();
    }
    return AutoFailServiceSingleton.instance;
  }

  public async startService() {
    cron.schedule("0 19 * * *", async () => {
      console.log("Running task to mark mails in transit as failed...");

      const mailRepository = AppDataSource.getRepository(Mail);
      const mailLogRepository = AppDataSource.getRepository(MailLog);

      try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const transitLogs = await mailLogRepository.find({
          where: {
            status: MailStatus.TRANSIT,
            date: Between(startOfDay, endOfDay),
          },
          relations: {
            mail: true,
          },
        });

        const mailsToFail = transitLogs
          .map((log) => log.mail)
          .filter((mail) => mail.status === MailStatus.TRANSIT);

        if (mailsToFail.length > 0) {
          const mailIdsToFail = mailsToFail.map((mail) => mail.id);
          await mailRepository.update(mailIdsToFail, {
            status: MailStatus.FAILED,
          });

          await mailLogRepository.update(
            { status: MailStatus.TRANSIT, date: Between(startOfDay, endOfDay) },
            { status: MailStatus.FAILED }
          );

          console.log(`Marked ${mailIdsToFail.length} mails as failed.`);
        } else {
          console.log("No mails to mark as failed.");
        }
      } catch (error) {
        console.error("Error marking mails as failed:", error);
      }
    });
  }
}
