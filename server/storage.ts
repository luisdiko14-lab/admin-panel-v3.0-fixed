import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  users,
  ranks,
  tycoons,
  territories,
  activityLogs,
  adminCommands,
  type User,
  type InsertUser,
  type Rank,
  type InsertRank,
  type Tycoon,
  type InsertTycoon,
  type Territory,
  type InsertTerritory,
  type ActivityLog,
  type InsertActivityLog,
  type AdminCommand,
  type InsertAdminCommand,
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: InsertUser & { id: string }): Promise<User>;
  updateUserRank(userId: string, rankScore: number, rankName: string): Promise<User>;
  banUser(userId: string, isBanned: boolean): Promise<User>;
  
  getAllRanks(): Promise<Rank[]>;
  createRank(rank: InsertRank): Promise<Rank>;
  
  getAllTerritories(): Promise<Territory[]>;
  createTerritory(territory: InsertTerritory): Promise<Territory>;
  
  getTycoonsByUser(userId: string): Promise<Tycoon[]>;
  getActiveTycoons(): Promise<Tycoon[]>;
  createTycoon(tycoon: InsertTycoon): Promise<Tycoon>;
  
  getRecentActivity(limit: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  getCommandHistory(limit: number): Promise<AdminCommand[]>;
  createAdminCommand(command: InsertAdminCommand): Promise<AdminCommand>;
  
  getGameStats(): Promise<{
    playersOnline: number;
    totalPlayers: number;
    serverUptime: string;
    activeWars: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: InsertUser & { id: string }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRank(userId: string, rankScore: number, rankName: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ rankScore, rankName, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async banUser(userId: string, isBanned: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isBanned, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllRanks(): Promise<Rank[]> {
    return db.select().from(ranks).orderBy(desc(ranks.rankScore));
  }

  async createRank(rank: InsertRank): Promise<Rank> {
    const [newRank] = await db.insert(ranks).values(rank).returning();
    return newRank;
  }

  async getAllTerritories(): Promise<Territory[]> {
    return db.select().from(territories);
  }

  async createTerritory(territory: InsertTerritory): Promise<Territory> {
    const [newTerritory] = await db.insert(territories).values(territory).returning();
    return newTerritory;
  }

  async getTycoonsByUser(userId: string): Promise<Tycoon[]> {
    return db.select().from(tycoons).where(eq(tycoons.ownerId, userId));
  }

  async getActiveTycoons(): Promise<Tycoon[]> {
    return db.select().from(tycoons).where(eq(tycoons.isActive, true));
  }

  async createTycoon(tycoon: InsertTycoon): Promise<Tycoon> {
    const [newTycoon] = await db.insert(tycoons).values(tycoon).returning();
    return newTycoon;
  }

  async getRecentActivity(limit: number): Promise<ActivityLog[]> {
    return db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit);
  }

  async createActivityLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db.insert(activityLogs).values(log).returning();
    return newLog;
  }

  async getCommandHistory(limit: number): Promise<AdminCommand[]> {
    return db
      .select()
      .from(adminCommands)
      .orderBy(desc(adminCommands.timestamp))
      .limit(limit);
  }

  async createAdminCommand(command: InsertAdminCommand): Promise<AdminCommand> {
    const [newCommand] = await db.insert(adminCommands).values(command).returning();
    return newCommand;
  }

  async getGameStats(): Promise<{
    playersOnline: number;
    totalPlayers: number;
    serverUptime: string;
    activeWars: number;
  }> {
    const allUsers = await db.select().from(users);
    const contestedTerritories = await db
      .select()
      .from(territories)
      .where(eq(territories.isContested, true));

    return {
      playersOnline: Math.floor(Math.random() * 50) + 10,
      totalPlayers: allUsers.length,
      serverUptime: "99.9%",
      activeWars: contestedTerritories.length,
    };
  }
}

export const storage = new DatabaseStorage();
