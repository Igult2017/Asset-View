import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // GET /api/trades
  app.get(api.trades.list.path, async (req, res) => {
    const trades = await storage.getTrades();
    res.json(trades);
  });

  // POST /api/trades
  app.post(api.trades.create.path, async (req, res) => {
    try {
      const input = api.trades.create.input.parse(req.body);
      const trade = await storage.createTrade(input);
      res.status(201).json(trade);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // DELETE /api/trades/:id
  app.delete(api.trades.delete.path, async (req, res) => {
    await storage.deleteTrade(Number(req.params.id));
    res.status(204).send();
  });

  // Seed Data
  const existingTrades = await storage.getTrades();
  if (existingTrades.length === 0) {
    console.log("Seeding database with initial trades...");
    await storage.seedTrades([
      { asset: 'EURUSD', strategy: 'SMC Breaker', session: 'London', condition: 'Trending', bias: 'Bullish', outcome: 'Win', rAchieved: 4.5, plAmt: 900, contextTF: 'D1', entryTF: 'M5' },
      { asset: 'NAS100', strategy: 'Silver Bullet', session: 'New York', condition: 'Trending', bias: 'Bearish', outcome: 'Win', rAchieved: 5.0, plAmt: 1500, contextTF: 'H4', entryTF: 'M1' },
      { asset: 'NAS100', strategy: 'Silver Bullet', session: 'New York', condition: 'Trending', bias: 'Bearish', outcome: 'Loss', rAchieved: -1, plAmt: -300, contextTF: 'H4', entryTF: 'M1' }
    ]);
  }

  return httpServer;
}
