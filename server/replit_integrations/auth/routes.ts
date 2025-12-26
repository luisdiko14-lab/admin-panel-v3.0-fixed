import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      // Handle both Discord (discordId) and Replit (claims.sub) auth
      const userId = user.discordId || user.claims?.sub || user.id;
      const authUser = await authStorage.getUser(userId);
      
      // Return full user object with all session data
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

  // Dashboard route for authenticated users
  app.get("/api/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      res.json({
        user: {
          id: user.discordId || user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          rank: user.rank || 'Admin',
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
