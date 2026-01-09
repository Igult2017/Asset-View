import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage_config });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use('/uploads', express.static('uploads'));

  app.post("/api/upload", upload.single('tradeImage'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
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

  // PATCH /api/trades/:id
  app.patch(api.trades.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.trades.update.input.parse(req.body);
      const trade = await storage.updateTrade(id, input);
      res.json(trade);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(404).json({ message: "Trade not found" });
    }
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
