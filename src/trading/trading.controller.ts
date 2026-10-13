import { Body, Controller, Post } from "@nestjs/common";
import { TradingService } from "./trading.service";

@Controller("trading")
export class TradingController {
  constructor(private readonly tradingService: TradingService) {}

  @Post("execute")
  async executeTrade(@Body() tradeDetails: any): Promise<string> {
    const { symbol, entryPrice, stopLoss, leverage, targets, quantity, type } =
      tradeDetails;

    // Call the service to execute the trading strategy
    return await this.tradingService.runStrategy(
      symbol,
      entryPrice,
      stopLoss,
      leverage,
      targets,
      quantity,
      type,
    );
  }

  @Post("cancel")
  async cancelOrders(@Body() cancelDetails: any): Promise<void> {
    const { symbol } = cancelDetails;

    // Call the service to cancel all orders for the given symbol
    await this.tradingService.cancelAllOrders(symbol);
  }
}
