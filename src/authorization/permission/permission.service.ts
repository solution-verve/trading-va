import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Permission } from "../../entities/permission.entity";

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(permission: Permission): Promise<Permission> {
    return this.permissionsRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionsRepository.find();
  }

  async findOne(id: number): Promise<Permission> {
    return this.permissionsRepository.findOne({
      where: {
        id: id,
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.permissionsRepository.delete(id);
  }
}
