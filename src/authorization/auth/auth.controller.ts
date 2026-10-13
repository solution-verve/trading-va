import { Controller, Request, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  async login(@Request() req) {
    return this.authService.login(req.body);
  }

  @Post("register")
  async register(@Body() createUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post("logout")
  async logout(@Request() req) {
    return this.authService.logout(req.user);
  }
}
