import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../../entities/role.entity";

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(role: Role): Promise<Role> {
    return this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({ relations: ["permissions"] });
  }

  async findOne(id: number): Promise<Role> {
    return this.rolesRepository.findOne({
      relations: ["permissions"],
      where: {
        id: id,
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.rolesRepository.delete(id);
  }
}
