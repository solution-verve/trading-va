import { DataSource, DataSourceOptions } from "typeorm";
import * as dotenv from "dotenv";
dotenv.config(); // Load environment variables
export const dataSourceOptions: DataSourceOptions = {
  type: process.env.DB_TYPE || ("postgres" as any),
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/migrations/*.js"],
  synchronize: false,
};
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
