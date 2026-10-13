import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from "typeorm";

@Entity()
export class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  isActive: boolean = true;

  @Column({
    nullable: true,
  })
  createdBy: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({
    nullable: true,
  })
  updatedBy: number;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({
    nullable: true,
  })
  deletedBy: number;

  @DeleteDateColumn()
  deletedAt?: Date;
}
