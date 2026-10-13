// src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "../auth/jwt-auth-guard";
import { PermissionsGuard } from "../auth/permissions.guard";
import { Permissions } from "../auth/permissions.decorator";
import { CreateUserDto } from "./dto/createUser.dto";

@Controller("users")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @Permissions("CREATE_USER")
  @Post("create")
  create(@Body() user: CreateUserDto) {
    return this.usersService.create(user);
  }

  @Permissions("READ_USER")
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Permissions("READ_USER")
  @Get(":username")
  findOne(@Param("username") username: string) {
    return this.usersService.findOne(username);
  }

  @Permissions("DELETE_USER")
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }
}
