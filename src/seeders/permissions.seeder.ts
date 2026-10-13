// src/database/seeders/permissions.seeder.ts
import { Seeder, Factory } from "typeorm-seeding";
import { Connection } from "typeorm";
import { Permission } from "../entities/permission.entity";

export default class CreatePermissions implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(Permission)
      .values([
        { name: "READ_USER" },
        { name: "CREATE_USER" },
        { name: "UPDATE_USER" },
        { name: "DELETE_USER" },
        { name: "READ_ROLE" },
        { name: "CREATE_ROLE" },
        { name: "UPDATE_ROLE" },
        { name: "DELETE_ROLE" },
        { name: "READ_PERMISSION" },
        { name: "CREATE_PERMISSION" },
        { name: "UPDATE_PERMISSION" },
        { name: "DELETE_PERMISSION" },
      ])
      .execute();
  }
}
