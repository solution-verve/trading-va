import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../entities/user.entity";
import { Role } from "../../entities/role.entity";
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(userDto: Partial<User>): Promise<User> {
    // Check if roles are provided
    if (userDto.roles) {
      const roles = await this.rolesRepository.findByIds(
        userDto.roles.map((role) => role.id),
      );
      userDto.roles = roles;
    }

    userDto.password = await bcrypt.hash(userDto.password, 10);

    const user = this.usersRepository.create(userDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({ relations: ["roles"] });
  }

  async findOne(username: string): Promise<User> {
    let searchQuery: Record<string, unknown> = {
      username,
    };
    if (username.includes("@")) searchQuery = { email: username };
    const user = await this.usersRepository.findOne({
      where: searchQuery,
      relations: ["roles"],
    });
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["roles"],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
