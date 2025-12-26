import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as DiscordStrategy } from "passport-discord";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import MemoryStore from "memorystore";
import { authStorage } from "./storage";

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const ms = MemoryStore(session);
  const sessionStore = new ms({
    checkPeriod: sessionTtl,
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

// Only allow users with "luis" in their name/email
const ALLOWED_USER = "LuisTheDev";

// Check if user is authorized
function isUserAuthorized(username: string, email: string): boolean {
  const userName = (username || "").toLowerCase();
  const userEmail = (email || "").toLowerCase();
  return (
    userName.includes("luis") ||
    userName === ALLOWED_USER.toLowerCase() ||
    userEmail.includes("luis")
  );
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
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
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    try {
      const claims = tokens.claims();
      await upsertUser(claims);
      const user = {};
      updateUserSession(user, tokens);
      verified(null, user);
    } catch (error: any) {
      verified(error);
    }
  };

  // Keep track of registered strategies
  const registeredStrategies = new Set<string>();

  // Helper function to ensure strategy exists for a domain
  const ensureStrategy = (domain: string) => {
    const strategyName = `replitauth:${domain}`;
    if (!registeredStrategies.has(strategyName)) {
      const strategy = new Strategy(
        {
          name: strategyName,
          config,
          scope: "openid email profile offline_access",
          callbackURL: `https://${domain}/api/callback`,
        },
        verify
      );
      passport.use(strategy);
      registeredStrategies.add(strategyName);
    }
  };

  // Setup Discord OAuth if credentials are available
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    const callbackURL = `https://${process.env.REPLIT_DEPLOYMENT_DOMAIN || 'a9e4c766-9f5b-46cf-b780-91441f0b37ee-00-1uenaf0z3nyh5.worf.replit.dev'}/api/discord-callback`;
    passport.use('discord', new DiscordStrategy({
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: callbackURL,
      scope: ['identify', 'email', 'guilds', 'guilds.join']
    }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        if (!isUserAuthorized(profile.username, profile.email || "")) {
          return done(new Error('Access denied: Only Luis is authorized to access this application.'), null);
        }

        const user = {
          id: profile.id,
          discordId: profile.id,
          username: profile.username,
          email: profile.email,
          avatar: profile.avatar,
          accessToken: accessToken,
          refreshToken: refreshToken,
          guilds: profile.guilds || [],
          rank: 'Admin',
          rankScore: 5,
          rankName: 'Admin',
        };

        await authStorage.upsertUser({
          id: profile.id,
          email: profile.email,
          firstName: profile.username,
          lastName: null,
          profileImageUrl: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : null,
        });

        return done(null, user);
      } catch (error) {
        console.error('Discord auth error:', error);
        return done(error, null);
      }
    }));
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  // Discord login routes
  app.get("/api/discord-login", (req, res, next) => {
    passport.authenticate('discord')(req, res, next);
  });

  app.get("/api/discord-callback", (req, res, next) => {
    passport.authenticate('discord', {
      successRedirect: '/',
      failureRedirect: '/api/login',
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Handle Discord auth (no token expiry)
  if (user.discordId) {
    return next();
  }

  // Handle Replit auth (with token expiry)
  if (!user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
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
