import { Module } from "@nestjs/common";
import { AuthService } from "./auth/auth.service";
import { AuthController } from "./auth/auth.controller";
import { UserService } from "src/authorization/user/user.service";
import { JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Role } from "src/entities/role.entity";
import { PermissionService } from "./permission/permission.service";
import { PermissionController } from "./permission/permission.controller";
import { Permission } from "../entities/permission.entity";
import { RoleService } from "./role/role.service";
import { RoleController } from "./role/role.controller";
import { UserController } from "./user/user.controller";
import { LocalStrategy } from "./auth/local.stretegy";
import { JwtStrategy } from "./auth/jwt.strategy";
import * as dotenv from "dotenv";

dotenv.config(); // Load environment variables
export const services = [
  AuthService,
  UserService,
  JwtService,
  PermissionService,
  RoleService,
  RoleController,
  LocalStrategy,
  JwtStrategy,
];
@Module({
  providers: [
    AuthService,
    UserService,
    JwtService,
    PermissionService,
    RoleService,
    RoleController,
    LocalStrategy,
    JwtStrategy,
  ],
  controllers: [
    AuthController,
    PermissionController,
    RoleController,
    UserController,
  ],
  imports: [TypeOrmModule.forFeature([User, Role, Permission])],
  exports: [...services], // Export Service to be used in other modules
})
export class AuthorizationModule {}
