import passport from "passport";
import { Strategy as DiscordStrategy } from "passport-discord";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import MemoryStore from "memorystore";

const MemoryStoreSession = MemoryStore(session);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const sessionStore = new MemoryStoreSession({
    checkPeriod: 86400000, // prune expired entries every 24h
    ttl: sessionTtl,
  });
  return session({
    secret: process.env.SESSION_SECRET || 'war-tycoon-admin-secret-key-2024',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
    },
  });
}

// Check if user has valid Roblox connection
function hasValidRobloxConnection(connections: any[]): string | null {
  if (!connections) return null;
  
  const robloxConnection = connections.find((conn: any) => conn.type === 'roblox');
  if (!robloxConnection) return null;
  
  const robloxUsername = robloxConnection.name;
  const allowedUsers = ['Luisdiko87', 'yaniselpror', 'AltAccountLuis212'];
  
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

  // Manual Login Strategy
  passport.use('local', new LocalStrategy(
    { usernameField: 'username', passwordField: 'password' },
    async (username: string, password: string, done: any) => {
      try {
        // Check hardcoded admin credentials
        if (username === 'LUIS' && password === 'b!Luis14102015') {
          const user = {
            id: 'manual-admin-luis',
            username: 'LUIS',
            robloxUsername: 'Luisdiko87',
            isManualLogin: true,
            avatar: null,
            email: 'admin@wartycoon.com',
            rank: '41 | Supreme Creator',
            rankScore: 5,
            guilds: []
          };
          return done(null, user);
        }
        return done(null, false, { message: 'Invalid username or password' });
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Discord OAuth Strategy (only if credentials are available)
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    passport.use('discord', new DiscordStrategy({
      clientID: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      callbackURL: "https://a9e4c766-9f5b-46cf-b780-91441f0b37ee-00-1uenaf0z3nyh5.worf.replit.dev/api/callback",
      scope: ['identify', 'email', 'connections', 'guilds']
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const robloxUsername = hasValidRobloxConnection(profile.connections);
        
        if (!robloxUsername) {
          return done(new Error('Access denied: Invalid Roblox connection. Must be Luisdiko87, yaniselpror, or AltAccountLuis212'), null);
        }

        const user = {
          discordId: profile.id,
          username: profile.username,
          email: profile.email,
          avatar: profile.avatar,
          robloxUsername: robloxUsername,
          accessToken: accessToken,
          refreshToken: refreshToken,
          rank: '41 | Supreme Creator',
          rankScore: 5,
          guilds: profile.guilds || []
        };

        return done(null, user);
      } catch (error) {
        console.error('Discord auth error:', error);
        return done(error, null);
      }
    }));
  }

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  // Manual login endpoint
  app.post("/api/manual-login", (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: 'Authentication error' });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ message: 'Login error' });
        }
        return res.json({ success: true, user: { username: user.username, robloxUsername: user.robloxUsername } });
      });
    })(req, res, next);
  });

  // Discord OAuth routes
  app.get("/api/login", (req, res, next) => {
    if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
      return res.redirect('/');
    }
    passport.authenticate('discord', { 
      scope: ['identify', 'email', 'connections', 'guilds'] 
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
      return res.redirect('/');
    }
    passport.authenticate('discord', { failureRedirect: '/login-failed' })(req, res, () => {
      res.redirect('/');
    });
  });

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
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #1a1a2e; color: white;">
          <h1 style="color: #ff6b6b;">Access Denied</h1>
          <p>You must have a verified Roblox account connected to Discord.</p>
          <p>Only users <strong style="color: #ffd93d;">Luisdiko87</strong>, <strong style="color: #ffd93d;">yaniselpror</strong>, or <strong style="color: #ffd93d;">AltAccountLuis212</strong> are authorized.</p>
          <a href="/" style="background: #7289da; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px;">Go Back</a>
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
  
  // Check if manual login admin or has valid Roblox connection
  if (user.isManualLogin && user.username === 'LUIS') {
    return next();
  }
  
  if (!user.robloxUsername || !['Luisdiko87', 'yaniselpror', 'AltAccountLuis212'].includes(user.robloxUsername)) {
    return res.status(401).json({ message: "Unauthorized - Invalid Roblox connection" });
  }

  return next();
};
