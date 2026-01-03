// Console logging utilities for DiscordHub Pro
logs.success("Test success log");
logs.warn("Test warning log");
logs.info("Test info log");
logs.debug("Test debug log");

logs.auth.login("Discord", "testuser");
logs.auth.logout("testuser");
logs.auth.register("Google", "test@example.com");
logs.auth.failed("Twitter", "Invalid credentials");
logs.auth.validated("testuser", "test@example.com");
logs.auth.guilds(5);

logs.api.request("GET", "/api/data", 200);
logs.api.response("/api/data", { message: "Success" });
logs.api.error("/api/data", "Not found");

logs.discord.ready("TestBot");
logs.discord.command("!test", "testuser");
logs.discord.error("Something went wrong");
logs.discord.guildJoin("Test Guild");

logs.db.query("SELECT * FROM users");
logs.db.connected("MongoDB");
logs.db.error("Connection refused");
logs.db.saved("user");

logs.routes.init("Home");
logs.routes.hit("GET", "/");
logs.routes.redirect("/", "/home");

logs.validation.start("User");
logs.validation.passed("Email format");
logs.validation.failed("Password length", "Too short");

logs.session.created("session123");
logs.session.destroyed("session123");
logs.session.active(10);

const startTime = logs.perf.start("Data fetch");
setTimeout(() => {
  logs.perf.end("Data fetch", startTime);
}, 100);

logs.table([{ name: "John", age: 30 }, { name: "Jane", age: 25 }]);

logs.separator();
logs.banner("Test Banner");
// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Log levels
const logs = {
  // Success logs
  success: (message, data = '') => {
    console.log(`${colors.green}✓ SUCCESS${colors.reset} ${message}`, data ? data : '');
  },

  // Error logs
  error: (message, data = '') => {
    console.log(`${colors.red}✗ ERROR${colors.reset} ${message}`, data ? data : '');
  },

  // Warning logs
  warn: (message, data = '') => {
    console.log(`${colors.yellow}⚠ WARNING${colors.reset} ${message}`, data ? data : '');
  },

  // Info logs
  info: (message, data = '') => {
    console.log(`${colors.cyan}ℹ INFO${colors.reset} ${message}`, data ? data : '');
  },

  // Debug logs
  debug: (message, data = '') => {
    console.log(`${colors.blue}🔧 DEBUG${colors.reset} ${message}`, data ? data : '');
  },

  // Auth-specific logs
  auth: {
    login: (provider, user) => console.log(`${colors.green}✓ LOGIN${colors.reset} [${provider}] User: ${user}`),
    logout: (user) => console.log(`${colors.yellow}⚠ LOGOUT${colors.reset} User: ${user}`),
    register: (provider, email) => console.log(`${colors.cyan}ℹ REGISTER${colors.reset} [${provider}] Email: ${email}`),
    failed: (provider, reason) => console.log(`${colors.red}✗ AUTH FAILED${colors.reset} [${provider}] ${reason}`),
    validated: (username, email) => console.log(`${colors.green}✓ VALIDATED${colors.reset} Username: ${username}, Email: ${email}`),
    guilds: (count) => console.log(`${colors.cyan}ℹ GUILDS FOUND${colors.reset} ${count} guilds connected`),
  },

  // API-specific logs
  api: {
    request: (method, endpoint, status) => console.log(`${colors.blue}→${colors.reset} ${method} ${endpoint} ${status}`),
    response: (endpoint, data) => console.log(`${colors.green}←${colors.reset} ${endpoint}:`, data),
    error: (endpoint, error) => console.log(`${colors.red}✗${colors.reset} ${endpoint} Error:`, error),
  },

  // Discord-specific logs
  discord: {
    ready: (botName) => console.log(`${colors.green}✓ DISCORD BOT READY${colors.reset} Bot: ${botName}`),
    command: (cmd, user) => console.log(`${colors.cyan}→ COMMAND${colors.reset} ${cmd} by ${user}`),
    error: (error) => console.log(`${colors.red}✗ DISCORD ERROR${colors.reset}`, error),
    guildJoin: (guildName) => console.log(`${colors.green}✓ GUILD JOINED${colors.reset} ${guildName}`),
  },

  // Database-specific logs
  db: {
    query: (query) => console.log(`${colors.blue}↳ QUERY${colors.reset} ${query}`),
    connected: (database) => console.log(`${colors.green}✓ DB CONNECTED${colors.reset} ${database}`),
    error: (error) => console.log(`${colors.red}✗ DB ERROR${colors.reset}`, error),
    saved: (entity) => console.log(`${colors.green}✓ SAVED${colors.reset} ${entity}`),
  },

  // Route-specific logs
  routes: {
    init: (routeName) => console.log(`${colors.cyan}→ ROUTE${colors.reset} Initializing ${routeName}`),
    hit: (method, path) => console.log(`${colors.blue}→ HIT${colors.reset} ${method} ${path}`),
    redirect: (from, to) => console.log(`${colors.yellow}→ REDIRECT${colors.reset} ${from} → ${to}`),
  },

  // Validation logs
  validation: {
    start: (type) => console.log(`${colors.cyan}⟳ VALIDATING${colors.reset} ${type}...`),
    passed: (check) => console.log(`${colors.green}✓ PASSED${colors.reset} ${check}`),
    failed: (check, reason) => console.log(`${colors.red}✗ FAILED${colors.reset} ${check}: ${reason}`),
  },

  // Session logs
  session: {
    created: (sessionId) => console.log(`${colors.green}✓ SESSION CREATED${colors.reset} ${sessionId.slice(0, 8)}...`),
    destroyed: (sessionId) => console.log(`${colors.yellow}✗ SESSION DESTROYED${colors.reset} ${sessionId.slice(0, 8)}...`),
    active: (count) => console.log(`${colors.cyan}ℹ ACTIVE SESSIONS${colors.reset} ${count}`),
  },

  // Performance logs
  perf: {
    start: (label) => {
      console.log(`${colors.blue}⏱ START${colors.reset} ${label}`);
      return Date.now();
    },
    end: (label, startTime) => {
      const duration = Date.now() - startTime;
      console.log(`${colors.green}⏱ END${colors.reset} ${label} - ${duration}ms`);
    },
  },

  // Table logs for better formatting
  table: (data) => console.table(data),

  // Clear console
  clear: () => console.clear(),

  // Separator for readability
  separator: () => console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`),

  // Large banner for important events
  banner: (text) => {
    const width = 60;
    const padding = Math.floor((width - text.length) / 2);
    console.log(`${colors.bright}${colors.magenta}`);
    console.log('═'.repeat(width));
    console.log(' '.repeat(padding) + text);
    console.log('═'.repeat(width));
    console.log(`${colors.reset}`);
  },
};

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = logs;
}
