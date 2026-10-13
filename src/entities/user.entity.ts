import { Entity, Column, ManyToMany, JoinTable } from "typeorm";
import { Role } from "./role.entity";
import { BaseEntity } from "src/common/base";

export enum GENDER {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

@Entity()
export class User extends BaseEntity {
  @Column()
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ nullable: true })
  email: string;

  @Column({
    type: "enum",
    enum: GENDER,
    nullable: true,
  })
  gender: GENDER;

  @Column({ nullable: true })
  contact_no: string;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable()
  roles: Role[];
}
