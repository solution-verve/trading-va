import { Seeder, Factory } from "typeorm-seeding";
import { Connection } from "typeorm";
import { Permission } from "src/entities/permission.entity";
import { Role } from "src/entities/role.entity";

export default class CreateRoles implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const permissionRepository = connection.getRepository(Permission);
    const roleRepository = connection.getRepository(Role);

    // Fetch existing permissions
    const permissions = await permissionRepository.find();

    // Create roles with their associated permissions
    const adminRole = roleRepository.create({
      name: "Admin",
      permissions: permissions, // Set all permissions
    });

    const userRole = roleRepository.create({
      name: "User",
      permissions: permissions.filter((p) => p.name === "READ_USER"), // Set specific permissions
    });

    // Save roles to the database
    await roleRepository.save([adminRole, userRole]);
  }
}
