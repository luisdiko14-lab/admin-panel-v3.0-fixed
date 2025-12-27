import { Client, GatewayIntentBits } from "discord.js";
import si from "systeminformation";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const prefix = "!";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setStatus("dnd");
  client.user.setActivity("Callback Codes / API Codes", { type: 2 });
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(" ");
  const cmd = args.shift()?.toLowerCase();

  if (cmd === "ping") {
    const cpu = await si.cpu();
    const load = await si.currentLoad();
    const mem = await si.mem();

    message.reply(
      `**CPU:** ${cpu.manufacturer} ${cpu.brand}\n` +
      `**CPU Load:** ${load.currentLoad.toFixed(2)}%\n` +
      `**RAM:** ${(mem.active / 1024 / 1024).toFixed(2)}MB / ${(mem.total / 1024 / 1024).toFixed(2)}MB`
    );
  }

  if (cmd === "specs") {
    const cpu = await si.cpu();
    const load = await si.currentLoad();
    const mem = await si.mem();
    const os = await si.osInfo();
    const uptime = await si.time();

    const ramUsagePercent = ((mem.used / mem.total) * 100).toFixed(2);
    const ramUsage = `${(mem.used / 1024 / 1024 / 1024).toFixed(2)}GB / ${(mem.total / 1024 / 1024 / 1024).toFixed(2)}GB`;
    const cpuCores = cpu.cores;

    message.reply(
      `\`\`\`
╔════════════════════════════════════════╗
║      DiscordHub Pro - System Specs      ║
╚════════════════════════════════════════╝

🖥️  OPERATING SYSTEM
  OS: ${os.platform} ${os.distro} ${os.release}
  Arch: ${os.arch}
  
💻 CPU INFORMATION
  Model: ${cpu.brand}
  Cores: ${cpuCores}
  Speed: ${cpu.speed}GHz

⚡ CURRENT LOAD
  CPU Usage: ${load.currentLoad.toFixed(2)}%
  RAM Usage: ${ramUsagePercent}% (${ramUsage})

⏱️  SYSTEM UPTIME
  ${uptime.uptime} seconds

╚════════════════════════════════════════╝
\`\`\``
    );
  }

  if (cmd === "status") {
    const status = args[0];
    const validStatuses = ["online", "idle", "dnd", "invisible"];
    
    if (!validStatuses.includes(status)) {
      return message.reply(`❌ Invalid status. Use: ${validStatuses.join(", ")}`);
    }

    client.user.setStatus(status);
    message.reply(`✅ Bot status changed to **${status}**`);
  }

  if (cmd === "activity") {
    const type = args[0]?.toLowerCase();
    const activity = args.slice(1).join(" ");
    const validTypes = ["playing", "listening", "competing", "streaming"];

    if (!validTypes.includes(type) || !activity) {
      return message.reply(`❌ Usage: !activity <type> <activity>\nTypes: ${validTypes.join(", ")}`);
    }

    const typeMap = { playing: 0, streaming: 1, listening: 2, competing: 5 };
    client.user.setActivity(activity, { type: typeMap[type] });
    message.reply(`✅ Bot activity changed to **${type.toUpperCase()} ${activity}**`);
  }
});

client.login(process.env.TOKEN);
