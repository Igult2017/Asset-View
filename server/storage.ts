import { db } from "./db";
import { trades, type Trade, type InsertTrade } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getTrades(): Promise<Trade[]>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  deleteTrade(id: number): Promise<void>;
  seedTrades(trades: InsertTrade[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getTrades(): Promise<Trade[]> {
    return await db.select().from(trades);
  }

  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const [trade] = await db
      .insert(trades)
      .values(insertTrade)
      .returning();
    return trade;
  }

  async deleteTrade(id: number): Promise<void> {
    await db.delete(trades).where(eq(trades.id, id));
  }

  async seedTrades(data: InsertTrade[]): Promise<void> {
    if (data.length === 0) return;
    await db.insert(trades).values(data);
  }
}

export const storage = new DatabaseStorage();
