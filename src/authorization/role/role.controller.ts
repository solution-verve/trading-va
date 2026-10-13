import { Controller, Get, Post, Body, Param, Delete } from "@nestjs/common";
import { RoleService } from "./role.service";
import { Role } from "../../entities/role.entity";

@Controller("roles")
export class RoleController {
  constructor(private readonly rolesService: RoleService) {}

  @Post()
  create(@Body() role: Role) {
    return this.rolesService.create(role);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.rolesService.findOne(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.rolesService.remove(+id);
  }
}
