import {
  users,
  ranks,
  tycoons,
  territories,
  activityLogs,
  adminCommands,
  type User,
  type UpsertUser,
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
import { db } from "./db";
import { eq, desc, and, or, like, count } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUserRank(userId: string, rankScore: number, rankName: string): Promise<User>;
  banUser(userId: string, banned: boolean): Promise<User>;
  getOnlineUsers(): Promise<User[]>;
  
  // Rank operations
  getAllRanks(): Promise<Rank[]>;
  createRank(rank: InsertRank): Promise<Rank>;
  updateRankPermissions(rankId: string, permissions: string[]): Promise<Rank>;
  
  // Tycoon operations
  getTycoonsByUser(userId: string): Promise<Tycoon[]>;
  createTycoon(tycoon: InsertTycoon): Promise<Tycoon>;
  updateTycoonResources(tycoonId: string, resources: any): Promise<Tycoon>;
  getActiveTycoons(): Promise<Tycoon[]>;
  
  // Territory operations
  getAllTerritories(): Promise<Territory[]>;
  captureTerritore(territoryId: string, userId: string, team: string): Promise<Territory>;
  getTerritoriesByTeam(team: string): Promise<Territory[]>;
  
  // Activity log operations
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivity(limit?: number): Promise<ActivityLog[]>;
  
  // Admin command operations
  createAdminCommand(command: InsertAdminCommand): Promise<AdminCommand>;
  getCommandHistory(limit?: number): Promise<AdminCommand[]>;
  
  // Game statistics
  getGameStats(): Promise<{
    onlinePlayers: number;
    activeTycoons: number;
    totalRevenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
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

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
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

  async banUser(userId: string, banned: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isBanned: banned, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getOnlineUsers(): Promise<User[]> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return await db
      .select()
      .from(users)
      .where(and(
        eq(users.isBanned, false),
        // Only users seen in last 5 minutes are considered online
      ))
      .orderBy(desc(users.lastSeen));
  }

  // Rank operations
  async getAllRanks(): Promise<Rank[]> {
    return await db.select().from(ranks).orderBy(desc(ranks.rankScore));
  }

  async createRank(rankData: InsertRank): Promise<Rank> {
    const [rank] = await db.insert(ranks).values(rankData).returning();
    return rank;
  }

  async updateRankPermissions(rankId: string, permissions: string[]): Promise<Rank> {
    const [rank] = await db
      .update(ranks)
      .set({ permissions })
      .where(eq(ranks.id, rankId))
      .returning();
    return rank;
  }

  // Tycoon operations
  async getTycoonsByUser(userId: string): Promise<Tycoon[]> {
    return await db
      .select()
      .from(tycoons)
      .where(eq(tycoons.ownerId, userId));
  }

  async createTycoon(tycoonData: InsertTycoon): Promise<Tycoon> {
    const [tycoon] = await db.insert(tycoons).values(tycoonData).returning();
    return tycoon;
  }

  async updateTycoonResources(tycoonId: string, resources: any): Promise<Tycoon> {
    const [tycoon] = await db
      .update(tycoons)
      .set({ resources, lastUpdated: new Date() })
      .where(eq(tycoons.id, tycoonId))
      .returning();
    return tycoon;
  }

  async getActiveTycoons(): Promise<Tycoon[]> {
    return await db
      .select()
      .from(tycoons)
      .where(eq(tycoons.isActive, true));
  }

  // Territory operations
  async getAllTerritories(): Promise<Territory[]> {
    return await db.select().from(territories);
  }

  async captureTerritore(territoryId: string, userId: string, team: string): Promise<Territory> {
    const [territory] = await db
      .update(territories)
      .set({ 
        controlledBy: userId, 
        team,
        lastCaptured: new Date(),
        isContested: false
      })
      .where(eq(territories.id, territoryId))
      .returning();
    return territory;
  }

  async getTerritoriesByTeam(team: string): Promise<Territory[]> {
    return await db
      .select()
      .from(territories)
      .where(eq(territories.team, team));
  }

  // Activity log operations
  async createActivityLog(logData: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db.insert(activityLogs).values(logData).returning();
    return log;
  }

  async getRecentActivity(limit: number = 50): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.timestamp))
      .limit(limit);
  }

  // Admin command operations
  async createAdminCommand(commandData: InsertAdminCommand): Promise<AdminCommand> {
    const [command] = await db.insert(adminCommands).values(commandData).returning();
    return command;
  }

  async getCommandHistory(limit: number = 100): Promise<AdminCommand[]> {
    return await db
      .select()
      .from(adminCommands)
      .orderBy(desc(adminCommands.timestamp))
      .limit(limit);
  }

  // Game statistics
  async getGameStats(): Promise<{
    onlinePlayers: number;
    activeTycoons: number;
    totalRevenue: number;
  }> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const [onlinePlayersResult] = await db
      .select({ count: count() })
      .from(users)
      .where(and(
        eq(users.isBanned, false),
      ));

    const [activeTycoonsResult] = await db
      .select({ count: count() })
      .from(tycoons)
      .where(eq(tycoons.isActive, true));

    const allTycoons = await db.select().from(tycoons);
    const totalRevenue = allTycoons.reduce((sum, tycoon) => {
      const resources = tycoon.resources as any;
      return sum + (resources?.crystals || 0) * 10; // Convert crystals to revenue
    }, 0);

    return {
      onlinePlayers: onlinePlayersResult.count,
      activeTycoons: activeTycoonsResult.count,
      totalRevenue,
    };
  }
}

export const storage = new DatabaseStorage();
