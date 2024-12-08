import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Mail } from "./Mail";
import { MailStatus } from "../types/mail";

@Entity({ name: "mail_log" })
export class MailLog extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: "uuid", unique: true, nullable: false, name: "mail_log_id" })
  mailLogId: string;

  @Column({ type: "uuid", name: "mail_id" })
  mailId: string;

  @ManyToOne(() => Mail)
  @JoinColumn({ name: "mail_id", referencedColumnName: "mailId" })
  mail: Mail;

  @Column({
    type: "enum",
    enum: MailStatus,
    default: MailStatus.PENDING,
  })
  status: MailStatus;

  @Column({ type: "timestamp" })
  date: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
