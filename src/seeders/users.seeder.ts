import { Seeder, Factory } from "typeorm-seeding";
import { Connection } from "typeorm";
import { User } from "../entities/user.entity";
import { Role } from "../entities/role.entity";
import * as bcrypt from "bcrypt";

export default class CreateUsers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const hashedPassword = await bcrypt.hash("password", 10);

    // Get repositories
    const userRepository = connection.getRepository(User);
    const roleRepository = connection.getRepository(Role);

    // Fetch roles
    const adminRole = await roleRepository.findOne({
      where: { name: "Admin" },
    });
    const userRole = await roleRepository.findOne({ where: { name: "User" } });

    if (!adminRole || !userRole) {
      throw new Error(
        "Roles not found. Ensure that roles are created before seeding users.",
      );
    }

    // Create users
    const adminUser = userRepository.create({
      username: "admin",
      password: hashedPassword,
      email: "admin@gm.com",
      roles: [adminRole],
    });

    const regularUser = userRepository.create({
      username: "user",
      password: hashedPassword,
      roles: [userRole],
    });

    // Save users
    await userRepository.save([adminUser, regularUser]);
  }
}
