import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  registerChatRoutes(app);
  registerImageRoutes(app);

  // AI Analysis Endpoint
  app.get("/api/ai/analyze", async (req, res) => {
    try {
      const trades = await storage.getTrades();
      if (trades.length === 0) {
        return res.json({ analysis: "No trade data available for analysis yet.", recommendations: [] });
      }

      // Prepare trade data for AI
      const tradesSummary = trades.map(t => ({
        asset: t.asset,
        strategy: t.strategy,
        session: t.session,
        outcome: t.outcome,
        r: t.rAchieved,
        pl: t.plAmt
      })).slice(-20); // Last 20 trades for context

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          {
            role: "system",
            content: "You are an expert high-frequency trading analyst. Analyze the provided trade history and provide a professional breakdown of performance, edge clarity, and 3-5 actionable recommendations to improve strategy expectancy. Return JSON with 'analysis' and 'recommendations' (array of strings) keys."
          },
          {
            role: "user",
            content: `Analyze these recent trades: ${JSON.stringify(tradesSummary)}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysisData = JSON.parse(response.choices[0]?.message?.content || "{}");
      res.json(analysisData);
    } catch (err) {
      console.error("AI Analysis Error:", err);
      res.status(500).json({ error: "Failed to generate AI analysis" });
    }
  });

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
