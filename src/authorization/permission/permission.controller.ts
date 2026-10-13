// src/permissions/permissions.controller.ts
import { Controller, Get, Post, Body, Param, Delete } from "@nestjs/common";
import { PermissionService } from "./permission.service";
import { Permission } from "../../entities/permission.entity";

@Controller("permissions")
export class PermissionController {
  constructor(private readonly permissionsService: PermissionService) {}

  @Post()
  create(@Body() permission: Permission) {
    return this.permissionsService.create(permission);
  }

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.permissionsService.findOne(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.permissionsService.remove(+id);
  }
}
