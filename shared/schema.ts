import { pgTable, text, serial, numeric, timestamp, boolean, integer } from "drizzle-orm/pg-core";
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
  analysisTF: text("analysis_tf").default('H1'),
  entryTF: text("entry_tf").default('M5'),
  date: timestamp("date").defaultNow(),

  // Market Regime & Environment
  marketRegime: text("market_regime"), // Trending, Ranging, Transition
  volatilityState: text("volatility_state"), // Expanding, Contracting
  liquidityConditions: text("liquidity_conditions"), // High, Normal, Thin
  newsEnvironment: text("news_environment"), // None, Medium, High

  // Time-of-Day & Session Precision
  entryTimeUtc: text("entry_time_utc"),
  sessionPhase: text("session_phase"), // Open, Mid, Close
  entryTimingContext: text("entry_timing_context"), // Initial Impulse, Pullback, Reversal
  preExpansionCondition: text("pre_expansion_condition"), // Before, After Expansion

  // Setup Quality Scoring (1-5)
  marketAlignmentScore: integer("market_alignment_score"),
  setupClarityScore: integer("setup_clarity_score"),
  entryPrecisionScore: integer("entry_precision_score"),
  confluenceScore: integer("confluence_score"),
  timingQualityScore: integer("timing_quality_score"),

  // Structure / Signal Validation
  primarySignalConfirmed: boolean("primary_signal_confirmed"),
  secondaryConfirmationPresent: boolean("secondary_confirmation_present"),
  keyLevelRespected: boolean("key_level_respected"),
  momentumSignalValid: boolean("momentum_signal_valid"),
  invalidationLevelDefined: boolean("invalidation_level_defined"),
  targetLogicClear: boolean("target_logic_clear"),

  // Execution Precision
  plannedEntry: numeric("planned_entry"),
  actualEntry: numeric("actual_entry"),
  plannedStopLoss: numeric("planned_stop_loss"),
  actualStopLoss: numeric("actual_stop_loss"),
  plannedTakeProfit: numeric("planned_take_profit"),
  actualExit: numeric("actual_exit"),

  // Risk & Capital Efficiency
  riskPercentPerTrade: numeric("risk_percent_per_trade"),
  plannedRiskReward: text("planned_risk_reward"),
  achievedRiskReward: text("achieved_risk_reward"),
  openRiskAtEntry: numeric("open_risk_at_entry"),
  drawdownAtEntry: numeric("drawdown_at_entry"),
  riskHeat: text("risk_heat"), // Low, Medium, High

  // Trade Management Logic
  entryMethod: text("entry_method"), // Market, Limit, Confirmation
  exitStrategy: text("exit_strategy"), // Fixed, Partial, Trailing
  breakEvenApplied: boolean("break_even_applied"),
  earlyExit: boolean("early_exit"),
  managementType: text("management_type"), // Rule-Based, Discretionary

  // Psychological State (1-5)
  confidenceLevel: integer("confidence_level"),
  emotionalState: text("emotional_state"), // Calm, Anxious, Greedy, Fearful
  focusLevel: integer("focus_level"),
  stressLevel: integer("stress_level"),

  // Rule Adherence & Discipline
  rulesFollowedPercent: integer("rules_followed_percent"),
  forcedTrade: boolean("forced_trade"),
  missedValidSetup: boolean("missed_valid_setup"),
  overtrading: boolean("overtrading"),
  documentationSaved: boolean("documentation_saved"),

  // Post-Trade Learning
  whatWorked: text("what_worked"),
  whatFailed: text("what_failed"),
  oneRuleToReinforce: text("one_rule_to_reinforce"),
  oneRuleToAdjust: text("one_rule_to_adjust"),
  setupWorthRepeating: boolean("setup_worth_repeating"),

  // Edge Filters & Constraints
  minimumSetupScore: integer("minimum_setup_score"),
  approvedSessions: text("approved_sessions"),
  approvedMarketRegimes: text("approved_market_regimes"),
  disallowedVolatility: text("disallowed_volatility"),
  blacklistedConditions: text("blacklisted_conditions"),
  imageUrl: text("image_url"),
  exitTime: text("exit_time"),
  dayOfWeek: text("day_of_week"),
  tradeDuration: text("trade_duration"),
  lotSize: text("lot_size"),
  pipsGainedLost: numeric("pips_gained_lost"),
  hotTimestamp: timestamp("hot_timestamp"),
  direction: text("direction"),
  slPips: numeric("sl_pips"),
  tpPips: numeric("tp_pips"),
});

export const insertTradeSchema = createInsertSchema(trades).omit({ 
  id: true, 
  date: true 
}).extend({
  rAchieved: z.number().or(z.string().transform(v => Number(v))),
  plAmt: z.number().or(z.string().transform(v => Number(v))),
  marketAlignmentScore: z.number().optional(),
  setupClarityScore: z.number().optional(),
  entryPrecisionScore: z.number().optional(),
  confluenceScore: z.number().optional(),
  timingQualityScore: z.number().optional(),
  plannedEntry: z.number().optional().or(z.string().transform(v => v ? Number(v) : undefined)),
  actualEntry: z.number().optional().or(z.string().transform(v => v ? Number(v) : undefined)),
  plannedStopLoss: z.number().optional().or(z.string().transform(v => v ? Number(v) : undefined)),
  actualStopLoss: z.number().optional().or(z.string().transform(v => v ? Number(v) : undefined)),
  plannedTakeProfit: z.number().optional().or(z.string().transform(v => v ? Number(v) : undefined)),
  actualExit: z.number().optional().or(z.string().transform(v => v ? Number(v) : undefined)),
  riskPercentPerTrade: z.number().optional().or(z.string().transform(v => v ? Number(v) : undefined)),
  openRiskAtEntry: z.number().optional().or(z.string().transform(v => v ? Number(v) : undefined)),
  drawdownAtEntry: z.number().optional().or(z.string().transform(v => v ? Number(v) : undefined)),
  slPips: z.number().optional().or(z.string().transform(v => v ? Number(v) : undefined)),
  tpPips: z.number().optional().or(z.string().transform(v => v ? Number(v) : undefined)),
  confidenceLevel: z.number().optional(),
  focusLevel: z.number().optional(),
  stressLevel: z.number().optional(),
  rulesFollowedPercent: z.number().optional(),
  minimumSetupScore: z.number().optional(),
});

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  size: text("size").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAssetSchema = createInsertSchema(assets).omit({ id: true, createdAt: true });

export type Asset = typeof trades.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export * from "./models/chat";
