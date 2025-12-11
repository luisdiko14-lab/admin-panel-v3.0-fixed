import {
  type User,
  type UpsertUser,
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
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  updateUserRank(userId: string, rankScore: number, rankName: string): Promise<User>;
  banUser(userId: string, banned: boolean): Promise<User>;
  getOnlineUsers(): Promise<User[]>;
  getAllRanks(): Promise<Rank[]>;
  createRank(rank: InsertRank): Promise<Rank>;
  updateRankPermissions(rankId: string, permissions: string[]): Promise<Rank>;
  getTycoonsByUser(userId: string): Promise<Tycoon[]>;
  createTycoon(tycoon: InsertTycoon): Promise<Tycoon>;
  updateTycoonResources(tycoonId: string, resources: any): Promise<Tycoon>;
  getActiveTycoons(): Promise<Tycoon[]>;
  getAllTerritories(): Promise<Territory[]>;
  captureTerritore(territoryId: string, userId: string, team: string): Promise<Territory>;
  getTerritoriesByTeam(team: string): Promise<Territory[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivity(limit?: number): Promise<ActivityLog[]>;
  createAdminCommand(command: InsertAdminCommand): Promise<AdminCommand>;
  getCommandHistory(limit?: number): Promise<AdminCommand[]>;
  getGameStats(): Promise<{
    onlinePlayers: number;
    activeTycoons: number;
    totalRevenue: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private ranks: Map<string, Rank> = new Map();
  private tycoons: Map<string, Tycoon> = new Map();
  private territories: Map<string, Territory> = new Map();
  private activityLogs: ActivityLog[] = [];
  private adminCommands: AdminCommand[] = [];

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.users.get(userData.id!);
    const user: User = {
      id: userData.id || crypto.randomUUID(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      username: userData.username || userData.firstName || 'User',
      rankScore: userData.rankScore ?? 0,
      rankName: userData.rankName || 'NonAdmin',
      isBanned: userData.isBanned ?? false,
      lastSeen: userData.lastSeen || new Date(),
      createdAt: existing?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async updateUserRank(userId: string, rankScore: number, rankName: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    user.rankScore = rankScore;
    user.rankName = rankName;
    user.updatedAt = new Date();
    return user;
  }

  async banUser(userId: string, banned: boolean): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    user.isBanned = banned;
    user.updatedAt = new Date();
    return user;
  }

  async getOnlineUsers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => !u.isBanned);
  }

  async getAllRanks(): Promise<Rank[]> {
    return Array.from(this.ranks.values()).sort((a, b) => b.rankScore - a.rankScore);
  }

  async createRank(rankData: InsertRank): Promise<Rank> {
    const rank: Rank = {
      id: crypto.randomUUID(),
      rankName: rankData.rankName,
      rankScore: rankData.rankScore,
      permissions: rankData.permissions ? [...rankData.permissions] : [],
      createdAt: new Date(),
    };
    this.ranks.set(rank.id, rank);
    return rank;
  }

  async updateRankPermissions(rankId: string, permissions: string[]): Promise<Rank> {
    const rank = this.ranks.get(rankId);
    if (!rank) throw new Error('Rank not found');
    rank.permissions = permissions;
    return rank;
  }

  async getTycoonsByUser(userId: string): Promise<Tycoon[]> {
    return Array.from(this.tycoons.values()).filter(t => t.ownerId === userId);
  }

  async createTycoon(tycoonData: InsertTycoon): Promise<Tycoon> {
    const tycoon: Tycoon = {
      id: crypto.randomUUID(),
      name: tycoonData.name,
      ownerId: tycoonData.ownerId || null,
      level: tycoonData.level ?? 1,
      resources: tycoonData.resources || { crystals: 0, oil: 0, steel: 0, energy: 0 },
      isActive: tycoonData.isActive ?? true,
      lastUpdated: new Date(),
      createdAt: new Date(),
    };
    this.tycoons.set(tycoon.id, tycoon);
    return tycoon;
  }

  async updateTycoonResources(tycoonId: string, resources: any): Promise<Tycoon> {
    const tycoon = this.tycoons.get(tycoonId);
    if (!tycoon) throw new Error('Tycoon not found');
    tycoon.resources = resources;
    tycoon.lastUpdated = new Date();
    return tycoon;
  }

  async getActiveTycoons(): Promise<Tycoon[]> {
    return Array.from(this.tycoons.values()).filter(t => t.isActive);
  }

  async getAllTerritories(): Promise<Territory[]> {
    return Array.from(this.territories.values());
  }

  async captureTerritore(territoryId: string, userId: string, team: string): Promise<Territory> {
    const territory = this.territories.get(territoryId);
    if (!territory) throw new Error('Territory not found');
    territory.controlledBy = userId;
    territory.team = team;
    territory.lastCaptured = new Date();
    territory.isContested = false;
    return territory;
  }

  async getTerritoriesByTeam(team: string): Promise<Territory[]> {
    return Array.from(this.territories.values()).filter(t => t.team === team);
  }

  async createActivityLog(logData: InsertActivityLog): Promise<ActivityLog> {
    const log: ActivityLog = {
      id: crypto.randomUUID(),
      userId: logData.userId || null,
      action: logData.action,
      details: logData.details || null,
      timestamp: new Date(),
    };
    this.activityLogs.unshift(log);
    return log;
  }

  async getRecentActivity(limit: number = 50): Promise<ActivityLog[]> {
    return this.activityLogs.slice(0, limit);
  }

  async createAdminCommand(commandData: InsertAdminCommand): Promise<AdminCommand> {
    const command: AdminCommand = {
      id: crypto.randomUUID(),
      executedBy: commandData.executedBy || null,
      command: commandData.command,
      targetUser: commandData.targetUser || null,
      result: commandData.result || 'Executed',
      timestamp: new Date(),
    };
    this.adminCommands.unshift(command);
    return command;
  }

  async getCommandHistory(limit: number = 100): Promise<AdminCommand[]> {
    return this.adminCommands.slice(0, limit);
  }

  async getGameStats(): Promise<{
    onlinePlayers: number;
    activeTycoons: number;
    totalRevenue: number;
  }> {
    const onlinePlayers = Array.from(this.users.values()).filter(u => !u.isBanned).length;
    const activeTycoons = Array.from(this.tycoons.values()).filter(t => t.isActive).length;
    const totalRevenue = Array.from(this.tycoons.values()).reduce((sum, tycoon) => {
      const resources = tycoon.resources as any;
      return sum + (resources?.crystals || 0) * 10;
    }, 0);
    return { onlinePlayers, activeTycoons, totalRevenue };
  }
}

export const storage = new MemStorage();
