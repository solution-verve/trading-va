import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { dataSourceOptions } from "./data-source";
import { AuthorizationModule } from "./authorization/authorization.module";
import * as dotenv from "dotenv";
import { ExceptionHandlingMiddleware } from "./common/exception.middleware";
import { TradingModule } from "./trading/trading.module";

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthorizationModule,
    TradingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ExceptionHandlingMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
