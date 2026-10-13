// src/auth/auth.service.ts
import { BadRequestException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    console.log(user.password, pass);
    if (user && (await bcrypt.compare(pass, user.password))) {
      // const { password, ...result } = user;
      delete user.password;
      return user;
    }
    return null;
  }

  async login(user: any) {
    const currentUser = await this.validateUser(user.username, user.password);
    if (!currentUser) {
      throw new BadRequestException("User not found");
    }

    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      }),
      user: currentUser,
    };
  }

  async register(user: any) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = await this.usersService.create({
      ...user,
      password: hashedPassword,
    });
    return newUser;
  }

  async logout(user: any) {
    const currentUser = await this.validateUser(user.username, user.password);
    if (!currentUser) {
      throw new BadRequestException("User not found");
    }

    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      }),
      user: currentUser,
    };
  }
}
