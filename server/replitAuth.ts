import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
  throw new Error("Discord OAuth credentials not provided. Please set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET");
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(user: any, profile: any) {
  user.discordId = profile.id;
  user.username = profile.username;
  user.email = profile.email;
  user.avatar = profile.avatar;
  user.connections = profile.connections || [];
}

async function upsertUser(profile: any) {
  await storage.upsertUser({
    id: profile.id,
    email: profile.email,
    firstName: profile.username, // Discord doesn't have separate first/last names
    lastName: "",
    profileImageUrl: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
  });
}

// Check if user has valid Roblox connection
function hasValidRobloxConnection(connections: any[]): string | null {
  if (!connections) return null;
  
  const robloxConnection = connections.find((conn: any) => conn.type === 'roblox');
  if (!robloxConnection) return null;
  
  const robloxUsername = robloxConnection.name;
  const allowedUsers = ['Luisdiko87', 'yaniselpror'];
  
  if (allowedUsers.includes(robloxUsername)) {
    return robloxUsername;
  }
  
  return null;
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Discord OAuth Strategy
  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID!,
    clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    callbackURL: "https://a9e4c766-9f5b-46cf-b780-91441f0b37ee-00-1uenaf0z3nyh5.worf.replit.dev/api/callback",
    scope: ['identify', 'email', 'connections']
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Check if user has valid Roblox connection
      const robloxUsername = hasValidRobloxConnection(profile.connections);
      
      if (!robloxUsername) {
        return done(new Error('Access denied: Invalid Roblox connection. Must be Luisdiko87 or yaniselpror'), null);
      }

      // Create user object with Discord profile and Roblox verification
      const user = {
        discordId: profile.id,
        username: profile.username,
        email: profile.email,
        avatar: profile.avatar,
        robloxUsername: robloxUsername,
        accessToken: accessToken,
        refreshToken: refreshToken
      };

      // Upsert user in database
      await upsertUser(profile);

      return done(null, user);
    } catch (error) {
      console.error('Discord auth error:', error);
      return done(error, null);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  // Auth routes
  app.get("/api/login", passport.authenticate('discord', { 
    scope: ['identify', 'email', 'connections'] 
  }));

  app.get("/api/callback", 
    passport.authenticate('discord', { failureRedirect: '/login-failed' }),
    (req, res) => {
      // Successful authentication
      res.redirect('/');
    }
  );

  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/');
    });
  });

  // Login failed page
  app.get("/login-failed", (req, res) => {
    res.status(403).send(`
      <html>
        <head><title>Access Denied</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>Access Denied</h1>
          <p>You must have a verified Roblox account connected to Discord.</p>
          <p>Only users <strong>Luisdiko87</strong> or <strong>yaniselpror</strong> are authorized.</p>
          <a href="/api/login" style="background: #7289da; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Try Again</a>
        </body>
      </html>
    `);
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as any;
  
  // Check if user has valid Roblox connection
  if (!user.robloxUsername || !['Luisdiko87', 'yaniselpror'].includes(user.robloxUsername)) {
    return res.status(401).json({ message: "Unauthorized - Invalid Roblox connection" });
  }

  return next();
};
