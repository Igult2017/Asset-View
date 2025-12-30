import { pgTable, text, serial, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  asset: text("asset").notNull(),
  strategy: text("strategy").notNull(),
  session: text("session").notNull(), // London, New York, Asian
  condition: text("condition").notNull(), // Trending, Ranging
  bias: text("bias").notNull(), // Bullish, Bearish
  outcome: text("outcome").notNull(), // Win, Loss, BE
  rAchieved: numeric("r_achieved").notNull(),
  plAmt: numeric("pl_amt").notNull(),
  contextTF: text("context_tf").default('D1'),
  entryTF: text("entry_tf").default('M5'),
  date: timestamp("date").defaultNow(),
});

export const insertTradeSchema = createInsertSchema(trades).omit({ 
  id: true, 
  date: true 
}).extend({
  rAchieved: z.number().or(z.string().transform(v => Number(v))),
  plAmt: z.number().or(z.string().transform(v => Number(v))),
});

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
