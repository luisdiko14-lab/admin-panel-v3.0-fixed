import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { insertAdminCommandSchema, insertActivityLogSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize ranks with the provided rank hierarchy
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
        { rankScore: 0, rankName: "NonAdmin", permissions: [] },
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

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.discordId || req.user.id;
      const user = await storage.getUser(userId);
      
      // Return user with all session data including guilds
      const responseUser = {
        id: userId,
        username: req.user.username,
        email: req.user.email,
        robloxUsername: req.user.robloxUsername,
        discordUsername: req.user.username,
        avatar: req.user.avatar,
        rank: req.user.rank || '41 | Supreme Creator',
        rankScore: req.user.rankScore || 5,
        guilds: req.user.guilds || [],
        isManualLogin: req.user.isManualLogin || false,
        profileImageUrl: req.user.avatar ? `https://cdn.discordapp.com/avatars/${req.user.discordId}/${req.user.avatar}.png` : null,
      };
      
      res.json(responseUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Game statistics endpoint
  app.get("/api/game/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getGameStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching game stats:", error);
      res.status(500).json({ message: "Failed to fetch game stats" });
    }
  });

  // Ranks endpoint
  app.get("/api/ranks", isAuthenticated, async (req, res) => {
    try {
      const ranks = await storage.getAllRanks();
      res.json(ranks);
    } catch (error) {
      console.error("Error fetching ranks:", error);
      res.status(500).json({ message: "Failed to fetch ranks" });
    }
  });

  // Update user rank endpoint
  app.post("/api/users/:userId/rank", isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { rankScore, rankName } = req.body;
      const executorId = req.user.discordId;

      // Check if user has permission to change ranks
      const executor = await storage.getUser(executorId);
      if (!executor || !executor.rankScore || executor.rankScore < 4.5) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const updatedUser = await storage.updateUserRank(userId, rankScore, rankName);
      
      // Log the action
      await storage.createActivityLog({
        userId: executorId,
        action: "rank_change",
        details: `Updated ${updatedUser.username || updatedUser.id} rank to ${rankName}`,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user rank:", error);
      res.status(500).json({ message: "Failed to update user rank" });
    }
  });

  // Territories endpoint
  app.get("/api/territories", isAuthenticated, async (req, res) => {
    try {
      const territories = await storage.getAllTerritories();
      res.json(territories);
    } catch (error) {
      console.error("Error fetching territories:", error);
      res.status(500).json({ message: "Failed to fetch territories" });
    }
  });

  // Activity logs endpoint
  app.get("/api/activity", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const activities = await storage.getRecentActivity(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  // Admin command execution endpoint
  app.post("/api/admin/command", isAuthenticated, async (req: any, res) => {
    try {
      const { command, targetUser } = req.body;
      const executorId = req.user.discordId;

      // Check if user has admin permissions
      const executor = await storage.getUser(executorId);
      if (!executor || !executor.rankScore || executor.rankScore < 4) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      let result = "Unknown command";
      let targetUserId = targetUser;

      // Process different commands
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

      // Log the command
      const adminCommand = await storage.createAdminCommand({
        executedBy: executorId,
        command,
        targetUser: targetUserId,
        result,
      });

      // Also log as activity
      await storage.createActivityLog({
        userId: executorId,
        action: "admin_command",
        details: `Executed: ${command}`,
      });

      res.json({ result, command: adminCommand });
    } catch (error) {
      console.error("Error executing admin command:", error);
      res.status(500).json({ message: "Failed to execute command" });
    }
  });

  // Command history endpoint
  app.get("/api/admin/commands", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const commands = await storage.getCommandHistory(limit);
      res.json(commands);
    } catch (error) {
      console.error("Error fetching command history:", error);
      res.status(500).json({ message: "Failed to fetch command history" });
    }
  });

  // User tycoons endpoint
  app.get("/api/tycoons", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tycoons = await storage.getTycoonsByUser(userId);
      res.json(tycoons);
    } catch (error) {
      console.error("Error fetching tycoons:", error);
      res.status(500).json({ message: "Failed to fetch tycoons" });
    }
  });

  // Active tycoons endpoint
  app.get("/api/tycoons/active", isAuthenticated, async (req, res) => {
    try {
      const tycoons = await storage.getActiveTycoons();
      res.json(tycoons);
    } catch (error) {
      console.error("Error fetching active tycoons:", error);
      res.status(500).json({ message: "Failed to fetch active tycoons" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    console.log("WebSocket connection established");

    // Send initial game state
    ws.send(JSON.stringify({
      type: "connection",
      message: "Connected to War Tycoon server"
    }));

    // Handle incoming messages
    ws.on("message", async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });
  });

  // Broadcast game updates every 30 seconds
  setInterval(async () => {
    try {
      const stats = await storage.getGameStats();
      const message = JSON.stringify({
        type: "gameStats",
        data: stats
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error("Error broadcasting game stats:", error);
    }
  }, 30000);

  return httpServer;
}
