import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  real,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  rankScore: real("rank_score").default(0),
  rankName: varchar("rank_name").default("NonAdmin"),
  isBanned: boolean("is_banned").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Game ranks table
export const ranks = pgTable("ranks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rankScore: real("rank_score").notNull(),
  rankName: varchar("rank_name").notNull(),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tycoons table
export const tycoons = pgTable("tycoons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").references(() => users.id),
  name: varchar("name").notNull(),
  level: integer("level").default(1),
  resources: jsonb("resources").$type<{
    crystals: number;
    oil: number;
    steel: number;
    energy: number;
  }>().default({ crystals: 0, oil: 0, steel: 0, energy: 0 }),
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Territories table for war map
export const territories = pgTable("territories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  controlledBy: varchar("controlled_by").references(() => users.id),
  team: varchar("team"), // red, blue, green, neutral
  position: jsonb("position").$type<{ x: number; y: number }>().notNull(),
  isContested: boolean("is_contested").default(false),
  lastCaptured: timestamp("last_captured"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity logs table
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Admin commands table
export const adminCommands = pgTable("admin_commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  executedBy: varchar("executed_by").references(() => users.id),
  command: varchar("command").notNull(),
  targetUser: varchar("target_user").references(() => users.id),
  result: varchar("result").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  tycoons: many(tycoons),
  territories: many(territories),
  activityLogs: many(activityLogs),
  adminCommands: many(adminCommands),
  executedCommands: many(adminCommands, { relationName: "commandExecutor" }),
}));

export const tycoonsRelations = relations(tycoons, ({ one }) => ({
  owner: one(users, {
    fields: [tycoons.ownerId],
    references: [users.id],
  }),
}));

export const territoriesRelations = relations(territories, ({ one }) => ({
  controller: one(users, {
    fields: [territories.controlledBy],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const adminCommandsRelations = relations(adminCommands, ({ one }) => ({
  executor: one(users, {
    fields: [adminCommands.executedBy],
    references: [users.id],
    relationName: "commandExecutor",
  }),
  target: one(users, {
    fields: [adminCommands.targetUser],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRankSchema = createInsertSchema(ranks).omit({
  id: true,
  createdAt: true,
});

export const insertTycoonSchema = createInsertSchema(tycoons).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

export const insertTerritorySchema = createInsertSchema(territories).omit({
  id: true,
  createdAt: true,
  lastCaptured: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true,
});

export const insertAdminCommandSchema = createInsertSchema(adminCommands).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Rank = typeof ranks.$inferSelect;
export type InsertRank = z.infer<typeof insertRankSchema>;

export type Tycoon = typeof tycoons.$inferSelect;
export type InsertTycoon = z.infer<typeof insertTycoonSchema>;

export type Territory = typeof territories.$inferSelect;
export type InsertTerritory = z.infer<typeof insertTerritorySchema>;

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

export type AdminCommand = typeof adminCommands.$inferSelect;
export type InsertAdminCommand = z.infer<typeof insertAdminCommandSchema>;
