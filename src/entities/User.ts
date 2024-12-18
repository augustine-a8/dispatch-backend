import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "user" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: "uuid", unique: true, nullable: false, name: "user_id" })
  userId: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", length: 255, unique: true, nullable: false })
  username: string;

  @Column({ type: "varchar", default: "" })
  unhashedPassword: string;

  @Column({ type: "text" })
  password: string;

  @Column({ type: "varchar", nullable: false, unique: true })
  contact: string | null;

  @Column({ type: "enum", enum: ["driver", "admin"], default: "driver" })
  role: "driver" | "admin";

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
