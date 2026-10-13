// src/users/dto/create-user.dto.ts
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsObject,
} from "class-validator";
import { Role } from "src/entities/role.entity";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsArray()
  @ArrayNotEmpty()
  roles: Role[];

  @IsString()
  @IsNotEmpty()
  email: string;
}
