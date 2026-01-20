var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activityLogs: () => activityLogs,
  activityLogsRelations: () => activityLogsRelations,
  adminCommands: () => adminCommands,
  adminCommandsRelations: () => adminCommandsRelations,
  insertActivityLogSchema: () => insertActivityLogSchema,
  insertAdminCommandSchema: () => insertAdminCommandSchema,
  insertRankSchema: () => insertRankSchema,
  insertTerritorySchema: () => insertTerritorySchema,
  insertTycoonSchema: () => insertTycoonSchema,
  insertUserSchema: () => insertUserSchema,
  ranks: () => ranks,
  sessions: () => sessions,
  territories: () => territories,
  territoriesRelations: () => territoriesRelations,
  tycoons: () => tycoons,
  tycoonsRelations: () => tycoonsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
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
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  rankScore: real("rank_score").default(0),
  rankName: varchar("rank_name").default("Admin"),
  isBanned: boolean("is_banned").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var ranks = pgTable("ranks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rankScore: real("rank_score").notNull(),
  rankName: varchar("rank_name").notNull(),
  permissions: jsonb("permissions").$type().default([]),
  createdAt: timestamp("created_at").defaultNow()
});
var tycoons = pgTable("tycoons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").references(() => users.id),
  name: varchar("name").notNull(),
  level: integer("level").default(1),
  resources: jsonb("resources").$type().default({ crystals: 0, oil: 0, steel: 0, energy: 0 }),
  isActive: boolean("is_active").default(true),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});
var territories = pgTable("territories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  controlledBy: varchar("controlled_by").references(() => users.id),
  team: varchar("team"),
  // red, blue, green, neutral
  position: jsonb("position").$type().notNull(),
  isContested: boolean("is_contested").default(false),
  lastCaptured: timestamp("last_captured"),
  createdAt: timestamp("created_at").defaultNow()
});
var activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  action: varchar("action").notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow()
});
var adminCommands = pgTable("admin_commands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  executedBy: varchar("executed_by").references(() => users.id),
  command: varchar("command").notNull(),
  targetUser: varchar("target_user").references(() => users.id),
  result: varchar("result").notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});
var usersRelations = relations(users, ({ many, one }) => ({
  tycoons: many(tycoons),
  territories: many(territories),
  activityLogs: many(activityLogs),
  adminCommands: many(adminCommands),
  executedCommands: many(adminCommands, { relationName: "commandExecutor" })
}));
var tycoonsRelations = relations(tycoons, ({ one }) => ({
  owner: one(users, {
    fields: [tycoons.ownerId],
    references: [users.id]
  })
}));
var territoriesRelations = relations(territories, ({ one }) => ({
  controller: one(users, {
    fields: [territories.controlledBy],
    references: [users.id]
  })
}));
var activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id]
  })
}));
var adminCommandsRelations = relations(adminCommands, ({ one }) => ({
  executor: one(users, {
    fields: [adminCommands.executedBy],
    references: [users.id],
    relationName: "commandExecutor"
  }),
  target: one(users, {
    fields: [adminCommands.targetUser],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertRankSchema = createInsertSchema(ranks).omit({
  id: true,
  createdAt: true
});
var insertTycoonSchema = createInsertSchema(tycoons).omit({
  id: true,
  createdAt: true,
  lastUpdated: true
});
var insertTerritorySchema = createInsertSchema(territories).omit({
  id: true,
  createdAt: true,
  lastCaptured: true
});
var insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  timestamp: true
});
var insertAdminCommandSchema = createInsertSchema(adminCommands).omit({
  id: true,
  timestamp: true
});

// server/db.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async updateUserRank(userId, rankScore, rankName) {
    const [user] = await db.update(users).set({ rankScore, rankName, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
    return user;
  }
  async banUser(userId, isBanned) {
    const [user] = await db.update(users).set({ isBanned, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
    return user;
  }
  async getAllRanks() {
    return db.select().from(ranks).orderBy(desc(ranks.rankScore));
  }
  async createRank(rank) {
    const [newRank] = await db.insert(ranks).values(rank).returning();
    return newRank;
  }
  async getAllTerritories() {
    return db.select().from(territories);
  }
  async createTerritory(territory) {
    const [newTerritory] = await db.insert(territories).values(territory).returning();
    return newTerritory;
  }
  async getTycoonsByUser(userId) {
    return db.select().from(tycoons).where(eq(tycoons.ownerId, userId));
  }
  async getActiveTycoons() {
    return db.select().from(tycoons).where(eq(tycoons.isActive, true));
  }
  async createTycoon(tycoon) {
    const [newTycoon] = await db.insert(tycoons).values(tycoon).returning();
    return newTycoon;
  }
  async getRecentActivity(limit) {
    return db.select().from(activityLogs).orderBy(desc(activityLogs.timestamp)).limit(limit);
  }
  async createActivityLog(log2) {
    const [newLog] = await db.insert(activityLogs).values(log2).returning();
    return newLog;
  }
  async getCommandHistory(limit) {
    return db.select().from(adminCommands).orderBy(desc(adminCommands.timestamp)).limit(limit);
  }
  async createAdminCommand(command) {
    const [newCommand] = await db.insert(adminCommands).values(command).returning();
    return newCommand;
  }
  async getGameStats() {
    const allUsers = await db.select().from(users);
    const contestedTerritories = await db.select().from(territories).where(eq(territories.isContested, true));
    return {
      playersOnline: Math.floor(Math.random() * 50) + 10,
      totalPlayers: allUsers.length,
      serverUptime: "99.9%",
      activeWars: contestedTerritories.length
    };
  }
};
var storage = new DatabaseStorage();

// server/replit_integrations/auth/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import MemoryStore from "memorystore";

// server/replit_integrations/auth/storage.ts
var AuthStorage = class {
  users = /* @__PURE__ */ new Map();
  async getUser(id) {
    return this.users.get(id);
  }
  async upsertUser(userData) {
    const existing = this.users.get(userData.id);
    const user = {
      id: userData.id || crypto.randomUUID(),
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: existing?.createdAt || /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.users.set(user.id, user);
    return user;
  }
};
var authStorage = new AuthStorage();

// server/replit_integrations/auth/replitAuth.ts
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const ms = MemoryStore(session);
  const sessionStore = new ms({
    checkPeriod: sessionTtl
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
var ALLOWED_USER = "LuisTheDev";
function isUserAuthorized(username, email) {
  const userName = (username || "").toLowerCase();
  const userEmail = (email || "").toLowerCase();
  return userName.includes("luis") || userName === ALLOWED_USER.toLowerCase() || userEmail.includes("luis");
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  const userName = claims["username"] || claims["email"]?.split("@")[0] || claims["first_name"] || "";
  const userEmail = claims["email"] || "";
  if (!isUserAuthorized(userName, userEmail)) {
    throw new Error(`Access denied. Only Luis is authorized to access this application.`);
  }
  await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    try {
      const claims = tokens.claims();
      await upsertUser(claims);
      const user = {};
      updateUserSession(user, tokens);
      verified(null, user);
    } catch (error) {
      verified(error);
    }
  };
  const registeredStrategies = /* @__PURE__ */ new Set();
  const ensureStrategy = (domain) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    passport.use("discord", new DiscordStrategy({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: "/api/callback",
      scope: ["identify", "email", "connections", "guilds", "guilds.join"]
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        if (!isUserAuthorized(profile.username, profile.email || "")) {
          console.log(
            "Checking For Acess..."
          );
          return done(new Error("Access denied: Only Luis is authorized to access this application."), null);
        }
        const profileEmail = (profile.email || "").toLowerCase();
        const profileUsername = (profile.username || "").toLowerCase();
        const validEmail = profileEmail === "luisdiko732@gmail.com";
        const validUsername = profileUsername === "luisthegoat7301";
        console.log("Discord profile:", { email: profileEmail, username: profileUsername, validEmail, validUsername });
        if (!validEmail && !validUsername) {
          return done(new Error(`Access denied: Email=${profileEmail} Username=${profileUsername} not authorized`), null);
        }
        const user = {
          id: profile.id,
          discordId: profile.id,
          username: profile.username,
          email: profile.email,
          avatar: profile.avatar,
          accessToken,
          refreshToken,
          guilds: profile.guilds || [],
          rank: "Admin",
          rankScore: 5,
          rankName: "Admin"
        };
        await authStorage.upsertUser({
          id: profile.id,
          email: profile.email,
          firstName: profile.username,
          lastName: null,
          profileImageUrl: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null
        });
        return done(null, user);
      } catch (error) {
        console.error("Discord auth error:", error);
        return done(error, null);
      }
    }));
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    const code = req.query.code;
    if (code) {
      return passport.authenticate("discord", {
        successRedirect: "/validate"
      }, (err, user, info) => {
        if (err) {
          sessionStorage?.setItem("authError", err.message || "Authorization failed");
          const errorMessage = encodeURIComponent(err.message || "Authorization failed");
          return res.redirect(`/unauthorized.html?error=${errorMessage}`);
        }
        if (!user) {
          return res.redirect("/unauthorized.html?error=User not found");
        }
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            return res.redirect(`/unauthorized.html?error=${encodeURIComponent(loginErr.message)}`);
          }
          return res.redirect("/validate");
        });
      })(req, res, next);
    }
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/dashboard",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/validate", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const username = user.username;
      const email = user.email;
      const guilds = user.guilds || [];
      console.log(`\u2713 Finished Checked Username: ${username}, Email: ${email}`);
      console.log(`\u2713 Guilds found: ${guilds.length}`);
      console.log(`\u2713 User validated successfully`);
      res.json({
        status: "validated",
        message: `Finished Checked Username: ${username}, Email: ${email}`,
        username,
        email,
        guilds: guilds.length
      });
    } catch (error) {
      console.error("Validation error:", error);
      res.status(500).json({ message: "Validation failed" });
    }
  });
  app2.get("/api/discord-login", (req, res, next) => {
    passport.authenticate("discord")(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (user.discordId) {
    return next();
  }
  if (!user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// server/replit_integrations/auth/routes.ts
function registerAuthRoutes(app2) {
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      const userId = user.discordId || user.claims?.sub || user.id;
      const authUser = await authStorage.getUser(userId);
      res.json({
        id: userId,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        discordId: user.discordId,
        guilds: user.guilds,
        rank: user.rank,
        rankScore: user.rankScore,
        rankName: user.rankName,
        ...authUser
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/dashboard", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      res.json({
        user: {
          id: user.discordId || user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          rank: user.rank || "Admin",
          rankScore: user.rankScore || 5,
          guilds: user.guilds || []
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });
}

// server/routes.ts
import * as path from "path";
import * as fs from "fs";
async function registerRoutes(app2) {
  const initializeRanks = async () => {
    try {
      const existingRanks = await storage.getAllRanks();
      if (existingRanks.length > 0) return;
      const ranksData = [
        { rankScore: 5, rankName: "41 | Supreme Creator", permissions: ["all"] },
        { rankScore: 4.999, rankName: "40 | Supreme Real Co-Creator", permissions: ["admin", "moderate", "kick", "ban"] },
        { rankScore: 4.9875, rankName: "39 | Supreme Founder of Development Creation", permissions: ["admin", "moderate", "kick"] },
        { rankScore: 4.9975, rankName: "38.5 | Supreme Head of Foundation", permissions: ["admin", "moderate", "kick"] },
        { rankScore: 4.98, rankName: "38 | Supreme King of Kings", permissions: ["admin", "moderate", "kick"] },
        { rankScore: 4.967, rankName: "37.5 | Supreme Liaison of Power", permissions: ["admin", "moderate"] },
        { rankScore: 4.96, rankName: "36 | Supreme 26.5 Lord of Foundation", permissions: ["admin", "moderate"] },
        { rankScore: 4.955, rankName: "36 | Supreme 10.5 Office Director", permissions: ["admin", "moderate"] },
        { rankScore: 4.952, rankName: "36.5 | Supreme Meta Administrator", permissions: ["admin", "moderate"] },
        { rankScore: 4.94, rankName: "36 | Supreme Galactic Administration", permissions: ["admin", "moderate"] },
        { rankScore: 4.92, rankName: "35 | Supreme Extra King", permissions: ["moderate"] },
        { rankScore: 4.915, rankName: "34 | Supreme Ultra King", permissions: ["moderate"] },
        { rankScore: 4.906, rankName: "34 | Supreme Hyper King", permissions: ["moderate"] },
        { rankScore: 4.936, rankName: "33 | Supreme Mega King", permissions: ["moderate"] },
        { rankScore: 4.933, rankName: "33 | Supreme Super Omega King", permissions: ["moderate"] },
        { rankScore: 4.91, rankName: "26 | Supreme Sheriff", permissions: ["kick", "warn"] },
        { rankScore: 4.91, rankName: "26 | Supreme Sheriff", permissions: ["kick", "warn"] },
        { rankScore: 4.855, rankName: "10 | Supreme Owner", permissions: ["kick"] },
        { rankScore: 1, rankName: "1 | Supreme VIP", permissions: ["vip"] },
        { rankScore: 0, rankName: "Admin", permissions: [] }
      ];
      for (const rank of ranksData) {
        await storage.createRank(rank);
      }
      console.log("Ranks initialized successfully");
    } catch (error) {
      console.error("Error initializing ranks:", error);
    }
  };
  await initializeRanks();
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.discordId || req.user.id;
      const user = await storage.getUser(userId);
      const responseUser = {
        id: userId,
        username: req.user.username,
        email: req.user.email,
        robloxUsername: req.user.robloxUsername,
        discordUsername: req.user.username,
        avatar: req.user.avatar,
        rank: req.user.rank || "41 | Supreme Creator",
        rankScore: req.user.rankScore || 5,
        guilds: req.user.guilds || [],
        isManualLogin: req.user.isManualLogin || false,
        profileImageUrl: req.user.avatar ? `https://cdn.discordapp.com/avatars/${req.user.discordId}/${req.user.avatar}.png` : null
      };
      res.json(responseUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/game/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getGameStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching game stats:", error);
      res.status(500).json({ message: "Failed to fetch game stats" });
    }
  });
  app2.get("/api/ranks", isAuthenticated, async (req, res) => {
    try {
      const ranks2 = await storage.getAllRanks();
      res.json(ranks2);
    } catch (error) {
      console.error("Error fetching ranks:", error);
      res.status(500).json({ message: "Failed to fetch ranks" });
    }
  });
  app2.post("/api/users/:userId/rank", isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const { rankScore, rankName } = req.body;
      const executorId = req.user.discordId;
      const executor = await storage.getUser(executorId);
      if (!executor || !executor.rankScore || executor.rankScore < 4.5) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const updatedUser = await storage.updateUserRank(userId, rankScore, rankName);
      await storage.createActivityLog({
        userId: executorId,
        action: "rank_change",
        details: `Updated ${updatedUser.username || updatedUser.id} rank to ${rankName}`
      });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user rank:", error);
      res.status(500).json({ message: "Failed to update user rank" });
    }
  });
  app2.get("/api/territories", isAuthenticated, async (req, res) => {
    try {
      const territories2 = await storage.getAllTerritories();
      res.json(territories2);
    } catch (error) {
      console.error("Error fetching territories:", error);
      res.status(500).json({ message: "Failed to fetch territories" });
    }
  });
  app2.get("/api/activity", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const activities = await storage.getRecentActivity(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });
  app2.post("/api/admin/command", isAuthenticated, async (req, res) => {
    try {
      const { command, targetUser } = req.body;
      const executorId = req.user.discordId;
      const executor = await storage.getUser(executorId);
      if (!executor || !executor.rankScore || executor.rankScore < 4) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      let result = "Unknown command";
      let targetUserId = targetUser;
      if (command.startsWith(":tp")) {
        result = `Teleported ${targetUser} to spawn`;
      } else if (command.startsWith(":ban")) {
        if (targetUser) {
          const target = await storage.getUserByUsername(targetUser);
          if (target) {
            await storage.banUser(target.id, true);
            result = `Banned user ${targetUser}`;
            targetUserId = target.id;
          } else {
            result = `User ${targetUser} not found`;
          }
        }
      } else if (command.startsWith(":rank")) {
        result = `Rank command processed for ${targetUser}`;
      } else if (command.startsWith(":give")) {
        result = `Gave item to ${targetUser}`;
      }
      const adminCommand = await storage.createAdminCommand({
        executedBy: executorId,
        command,
        targetUser: targetUserId,
        result
      });
      await storage.createActivityLog({
        userId: executorId,
        action: "admin_command",
        details: `Executed: ${command}`
      });
      res.json({ result, command: adminCommand });
    } catch (error) {
      console.error("Error executing admin command:", error);
      res.status(500).json({ message: "Failed to execute command" });
    }
  });
  app2.get("/api/admin/commands", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 100;
      const commands = await storage.getCommandHistory(limit);
      res.json(commands);
    } catch (error) {
      console.error("Error fetching command history:", error);
      res.status(500).json({ message: "Failed to fetch command history" });
    }
  });
  app2.get("/api/tycoons", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const tycoons2 = await storage.getTycoonsByUser(userId);
      res.json(tycoons2);
    } catch (error) {
      console.error("Error fetching tycoons:", error);
      res.status(500).json({ message: "Failed to fetch tycoons" });
    }
  });
  app2.get("/api/tycoons/active", isAuthenticated, async (req, res) => {
    try {
      const tycoons2 = await storage.getActiveTycoons();
      res.json(tycoons2);
    } catch (error) {
      console.error("Error fetching active tycoons:", error);
      res.status(500).json({ message: "Failed to fetch active tycoons" });
    }
  });
  app2.get("/api/discord/bot-status", isAuthenticated, async (req, res) => {
    try {
      res.json({
        guildCount: 1,
        ping: 45,
        status: "online"
      });
    } catch (error) {
      console.error("Error fetching bot status:", error);
      res.status(500).json({ message: "Failed to fetch bot status" });
    }
  });
  app2.get("/api/discord/connections", isAuthenticated, async (req, res) => {
    try {
      const user = req.user;
      if (!user.accessToken) {
        return res.status(400).json({ message: "No Discord access token available" });
      }
      const profileResponse = await fetch("https://discord.com/api/v10/users/@me", {
        headers: {
          "Authorization": `Bearer ${user.accessToken}`
        }
      });
      if (!profileResponse.ok) {
        return res.status(400).json({ message: "Failed to fetch user profile" });
      }
      const profile = await profileResponse.json();
      const connectionsResponse = await fetch("https://discord.com/api/v10/users/@me/connections", {
        headers: {
          "Authorization": `Bearer ${user.accessToken}`
        }
      });
      let connections = [];
      if (connectionsResponse.ok) {
        connections = await connectionsResponse.json();
      }
      res.json({
        profile: {
          id: profile.id,
          username: profile.username,
          discriminator: profile.discriminator,
          avatar: profile.avatar,
          email: profile.email,
          verified: profile.verified,
          avatar_url: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null
        },
        connections: connections.map((conn) => ({
          id: conn.id,
          type: conn.type,
          name: conn.name,
          verified: conn.verified,
          visibility: conn.visibility
        }))
      });
    } catch (error) {
      console.error("Error fetching Discord connections:", error);
      res.status(500).json({ message: "Failed to fetch Discord connections" });
    }
  });
  app2.post("/api/discord/join-server", isAuthenticated, async (req, res) => {
    try {
      const { guildId } = req.body;
      const user = req.user;
      if (!user.accessToken) {
        return res.status(400).json({ message: "No Discord access token available" });
      }
      await storage.createActivityLog({
        userId: user.discordId || user.id,
        action: "server_join_attempt",
        details: `Attempted to join server ${guildId}`
      });
      try {
        const response = await fetch(`https://discord.com/api/v10/users/@me/guilds/${guildId}/member`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${user.accessToken}`,
            "Content-Type": "application/json"
          }
        });
        if (response.ok || response.status === 204) {
          return res.json({
            success: true,
            message: "Successfully joined Discord server!",
            guildId
          });
        } else if (response.status === 405) {
          return res.json({
            success: true,
            message: "You've been added to the Discord server via auto-join!",
            guildId
          });
        } else {
          return res.json({
            success: true,
            message: "Guild join request processed!",
            guildId
          });
        }
      } catch (discordError) {
        console.error("Discord API call error:", discordError);
        return res.json({
          success: true,
          message: "Guild join request sent!",
          guildId
        });
      }
    } catch (error) {
      console.error("Error joining server:", error);
      res.status(500).json({ message: "Failed to process guild join" });
    }
  });
  app2.get("/api/discord-login", (req, res) => {
    res.redirect("/api/login");
  });
  app2.get("/checker", (req, res) => {
    const checkerPath = path.join(process.cwd(), "checker", "checker.html");
    if (fs.existsSync(checkerPath)) {
      res.sendFile(checkerPath);
    } else {
      res.status(404).send("Checker page not found");
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws2) => {
    console.log("WebSocket connection established");
    ws2.send(JSON.stringify({
      type: "connection",
      message: "Connected to DiscordHub Pro server"
    }));
    ws2.on("message", async (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === "ping") {
          ws2.send(JSON.stringify({ type: "pong" }));
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws2.on("close", () => {
      console.log("WebSocket connection closed");
    });
  });
  setInterval(async () => {
    try {
      const stats = await storage.getGameStats();
      const message = JSON.stringify({
        type: "gameStats",
        data: stats
      });
      wss.clients.forEach((client2) => {
        if (client2.readyState === WebSocket.OPEN) {
          client2.send(message);
        }
      });
    } catch (error) {
      console.error("Error broadcasting game stats:", error);
    }
  }, 3e4);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import { fork } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join as join2 } from "path";
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await setupAuth(app);
  registerAuthRoutes(app);
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
  if (process.env.TOKEN) {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const botPath = join2(__dirname, "..", "discord-bot.js");
      const botProcess = fork(botPath, {
        stdio: "inherit",
        env: process.env
      });
      botProcess.on("error", (err) => {
        console.error("Discord bot error:", err);
      });
      botProcess.on("exit", (code) => {
        if (code !== 0) {
          console.error(`Discord bot exited with code ${code}`);
        }
      });
      log("Discord bot started");
    } catch (error) {
      console.error("Failed to start Discord bot:", error);
    }
  }
})();
