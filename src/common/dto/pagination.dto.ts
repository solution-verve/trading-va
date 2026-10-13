import { IsOptional, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
  @IsOptional()
  @Type(() => String)
  limit?: string = "10"; // Default value for limit

  @IsOptional()
  @Type(() => String)
  offset?: string = "0"; // Default value for offset
}
