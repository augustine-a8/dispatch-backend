import {
  Entity,
  BaseEntity,
  JoinColumn,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { MailStatus } from "../types/mail";

@Entity({ name: "mail" })
export class Mail extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: "uuid", unique: true, nullable: false, name: "mail_id" })
  mailId: string;

  @Column({ type: "varchar", name: "reference_number" })
  referenceNumber: string;

  @Column({ type: "timestamp" })
  date: Date;

  @Column({ type: "varchar" })
  organization: string;

  @Column({ type: "text" })
  addressee: string;

  @Column({
    type: "enum",
    enum: MailStatus,
    default: MailStatus.PENDING,
  })
  status: MailStatus;

  @Column({ type: "uuid", name: "driver_id", nullable: true })
  driverId: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: "driver_id", referencedColumnName: "userId" })
  driver: User;

  @Column({ type: "varchar", length: 155, nullable: true })
  receipient: string | null;

  @Column({
    type: "varchar",
    length: 10,
    name: "receipient_contact",
    nullable: true,
  })
  receipientContact: string | null;

  @Column({ type: "timestamp", nullable: true, name: "received_at" })
  receivedAt: Date | null;

  @Column({ type: "text", name: "receipient_signature_url", nullable: true })
  receipientSignatureUrl: string | null; // conversations on monday

  @CreateDateColumn({ name: "created_at", nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
