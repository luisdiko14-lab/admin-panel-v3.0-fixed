import { Client, GatewayIntentBits } from "discord.js";
import si from "systeminformation";
import dotenv from "dotenv";

// Load .env
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
});

client.login(process.env.TOKEN);
