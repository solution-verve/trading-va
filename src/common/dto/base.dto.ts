import { IsNotEmpty, IsOptional, IsString, IsEnum } from "class-validator";

// Example status enum, adjust as needed
export enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export class CommonDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}
