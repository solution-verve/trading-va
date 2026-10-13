import { Injectable } from "@nestjs/common";
import Binance from "binance-api-node";

import * as WebSocket from "ws";
import BigNumber from "bignumber.js";

@Injectable()
export class TradingService {
  private client;

  constructor() {
    let object: any = {
      apiKey: process.env.BINANCE_API_KEY,
      apiSecret: process.env.BINANCE_SECRET_KEY,
    };
    if (process.env.ENVIRONMENT === "test") {
      object = {
        apiKey: process.env.TEST_API_KEY_FUTURE,
        apiSecret: process.env.TEST_SECRET_KEY_FUTURE,
        httpFutures: "https://testnet.binancefuture.com",
      };
    }

    this.client = Binance({
      ...object,
    });
    this.listenToUserData();
  }

  async getFuturesMarginBalance() {
    try {
      const futuresAccountInfo = await this.client.futuresAccountInfo({
        useServerTime: true,
      });

      // The margin balance is in the "totalMarginBalance" field
      const marginBalance = futuresAccountInfo.availableBalance;
      return marginBalance;
    } catch (error) {
      console.error("Error fetching futures margin balance:", error);
    }
  }

  // Listen to user data stream for position and order updates
  async listenToUserData() {
    try {
      const listenKey = await this.client.futuresGetDataStream();
      console.log("Listen Key:", listenKey);

      let webSocketURL =
        process.env.WEBSOCKET_URL || "wss://fstream.binance.com";

      if (process.env.ENVIRONMENT === "test") {
        webSocketURL = "wss://fstream.binancefuture.com";
      }

      const ws = new WebSocket(`${webSocketURL}/ws/${listenKey.listenKey}`);

      ws.on("message", (data) => {
        const parsedData = JSON.parse(data);
        console.log(new Date());
        console.log("symbol", parsedData?.o?.s);
        console.log("action", parsedData?.o?.o);
        console.log("event", parsedData.e);
        console.log("status", parsedData?.o?.x);

        // Check if the event is an order update
        if (parsedData.e === "ORDER_TRADE_UPDATE") {
          const order = parsedData.o;
          // Check if the order is filled
          if (order.x === "FILLED" || order.x === "EXPIRED") {
            console.log("Order update:", order);

            // Check if the order type is a stop market order (like stop loss)
            if (order.ot === "STOP_MARKET") {
              console.log(
                "STOP_MARKET order filled, closing all other orders for",
                order.s,
              );

              // Cancel all open orders for the symbol when stop market order is filled
              this.cancelAllOrders(order.s); // order.s contains the symbol
            }
          }
        }
      });

      ws.on("error", (error) => {
        console.error("WebSocket error:", error);
      });

      ws.on("close", () => {
        console.log("WebSocket connection closed");
      });

      // Refresh the listen key every 30 minutes
      setInterval(
        async () => {
          await this.client.futuresKeepDataStream({
            listenKey: listenKey.listenKey,
          });
        },
        30 * 60 * 1000, // Refresh every 30 minutes
      );
    } catch (error) {
      console.error("Error in listenToUserData:", error);
    }
  }

  // Set leverage for the futures contract
  async setLeverage(symbol: string, leverage: number): Promise<void> {
    try {
      const response = await this.client.futuresLeverage({
        symbol: symbol,
        leverage: leverage,
        useServerTime: true,
      });
      console.log(`Leverage set to ${leverage}x for ${symbol}`, response);
      return response;
    } catch (error) {
      console.error("Error setting leverage:", error);
    }
  }

  // Place a market buy order
  async placeMarketOrder(
    symbol: string,
    quantity: number,
    entryPrice: number,
    type: string,
  ): Promise<void> {
    try {
      const order = await this.client.futuresOrder({
        symbol: symbol,
        side: type === "Short" ? "SELL" : "BUY",
        type: "MARKET",
        quantity: quantity,
        entryPrice: entryPrice,
        useServerTime: true,
      });
      console.log(`Market buy order placed for ${symbol}`, order);
    } catch (error) {
      console.error("Error placing market order:", error);
    }
  }

  // Place a stop loss order
  async setStopOrder(
    symbol: string,
    stopPrice: number,
    quantity: number,
    type: string,
  ): Promise<void> {
    try {
      const stopOrder = await this.client.futuresOrder({
        symbol,
        side: type === "Short" ? "BUY" : "SELL", // For short position
        type: "STOP_MARKET", // Use STOP_MARKET for stop loss
        stopPrice,
        quantity,
        timeInForce: "GTC",
        reduceOnly: true, // To ensure it only closes existing positions
        useServerTime: true,
      });
      console.log(`Stop order set at ${stopPrice}`, stopOrder);
    } catch (error) {
      console.error("Error placing stop order:", error);
    }
  }

  // Place a take profit market order
  async setTakeProfitMarketOrder(
    symbol: string,
    quantity: number,
    stopPrice: number,
  ): Promise<void> {
    try {
      const takeProfitOrder = await this.client.futuresOrder({
        symbol,
        side: "BUY", // Closing the short position
        type: "TAKE_PROFIT_MARKET",
        stopPrice,
        quantity,
        reduceOnly: true, // To ensure it only closes existing positions
        useServerTime: true,
      });
      console.log(
        `Take profit market order set at ${stopPrice}`,
        takeProfitOrder,
      );
    } catch (error) {
      console.error("Error placing take profit market order:", error);
    }
  }

  async setLimitOrders(
    symbol: string,
    targets: number[],
    quantity,
    type: string,
    precision: number,
    minQty: number,
  ) {
    const takeProfitPercentage = 0.2; // 20%
    let qty: any = (quantity * takeProfitPercentage).toFixed(precision);
    if (Number(qty) < Number(minQty)) {
      qty = minQty;
    }
    targets.forEach(async (target) => {
      const limit = await this.client.futuresOrder({
        timeInForce: "GTC", // Good 'Til Canceled
        symbol,
        quantity: qty,
        side: type === "Short" ? "BUY" : "SELL",
        type: "TAKE_PROFIT_MARKET", // Limit order for take profit
        stopPrice: target,
        reduceOnly: true, // To ensure it only closes existing positions
        useServerTime: true,
      });

      console.log(
        `Limit order set at ${quantity * takeProfitPercentage}`,
        limit,
      );
    });
  }
  // Run the strategy for the symbol
  async runStrategy(
    symbol: string,
    entryPrice: number,
    stopLoss: number,
    leverage: number,
    targets: number[],
    latQty: number,
    type: string,
  ): Promise<string> {
    const exchangeInfo = await this.client.futuresExchangeInfo({
      useServerTime: true,
    });

    let totalFutureMargin = await this.getFuturesMarginBalance();

    const marginPercentage = latQty / 100;

    const currentSymbol = exchangeInfo?.symbols.find((item) => {
      return item.symbol === symbol;
    });

    const quantityPrecision = currentSymbol.quantityPrecision;

    if (!totalFutureMargin) {
      totalFutureMargin = 0;
    }

    console.log(240, marginPercentage, totalFutureMargin);
    const quantity = Math.ceil(marginPercentage * totalFutureMargin);
    // Extract filters (to validate min/max values)
    const lotSizeFilter = currentSymbol.filters.find(
      (f) => f.filterType === "LOT_SIZE",
    );
    // const priceFilter = exchangeInfo.filters.find(
    //   (f) => f.filterType === "PRICE_FILTER"
    // );

    //const minPrice = priceFilter.minPrice;
    // const maxPrice = priceFilter.maxPrice;
    const minQty = lotSizeFilter.minQty;
    const maxQty = lotSizeFilter.maxQty;

    let qty = new BigNumber(quantity)
      .div(entryPrice)
      .toFixed(quantityPrecision);

    if (Number(minQty) > Number(qty)) {
      qty = minQty;
    }

    if (maxQty < Number(qty)) {
      console.log("Max Qty", maxQty, qty);
      return;
    }

    // Step 1: Set leverage
    await this.setLeverage(symbol, leverage);

    // Step 2: Place a market buy order
    await this.placeMarketOrder(symbol, Number(qty), entryPrice, type);

    // Step 3: Set stop loss order
    await this.setStopOrder(symbol, stopLoss, Number(qty), type);

    // Step 4: Set trailing take profit order
    // await this.setTrailingTakeProfit(symbol, quantity, trailingOffset);
    //await this.setTakeProfitMarketOrder(symbol, quantity, targets[0]);
    // Step 5: Set multiple limit orders
    await this.setLimitOrders(
      symbol,
      targets,
      Number(qty),
      type,
      quantityPrecision,
      minQty,
    );

    // setTimeout(() => {
    //   this.cancelAllOrders(symbol);
    // }, 5000);

    return "Succesfully Submitted";
  }

  // Cancel all open orders for a specific symbol
  async cancelAllOrders(symbol: string): Promise<void> {
    try {
      const cancelResult = await this.client.futuresCancelAllOpenOrders({
        symbol,
        useServerTime: true,
      });
      console.log(`All open orders for ${symbol} have been canceled.`);
      return cancelResult;
    } catch (error) {
      console.error(`Error canceling orders for ${symbol}:`, error);
      throw error;
    }
  }
}
