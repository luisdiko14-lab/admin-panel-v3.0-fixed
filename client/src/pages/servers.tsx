import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Server, Users, Shield, Crown, ArrowLeft, Settings, Hash } from "lucide-react";
import { SiDiscord } from "react-icons/si";
import { Link } from "wouter";

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
  features: string[];
}

export default function Servers() {
  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  const guilds: Guild[] = user?.guilds || [];

  const getGuildIcon = (guild: Guild) => {
    if (guild.icon) {
      return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
    }
    return null;
  };

  const hasAdminPermission = (permissions: string) => {
    const permInt = parseInt(permissions);
    return (permInt & 0x8) === 0x8;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" className="text-gray-400 hover:text-white" data-testid="button-back-dashboard">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Server className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <SiDiscord className="text-indigo-400" />
                Your Discord Servers
              </h1>
              <p className="text-gray-400 mt-1">
                Viewing {guilds.length} server{guilds.length !== 1 ? 's' : ''} connected to your account
              </p>
            </div>
          </div>
        </motion.div>

        {guilds.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <Server className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">No Servers Found</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Your Discord account doesn't have any servers yet, or the guilds scope wasn't granted during login.
              Try logging out and back in with Discord.
            </p>
            <Link href="/api/logout">
              <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700" data-testid="button-logout-reauth">
                Re-authenticate with Discord
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guilds.map((guild, index) => (
              <motion.div
                key={guild.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-gray-800/50 border-gray-700 hover:border-indigo-500/50 transition-colors cursor-pointer" data-testid={`card-server-${guild.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      {getGuildIcon(guild) ? (
                        <img 
                          src={getGuildIcon(guild)!} 
                          alt={guild.name}
                          className="w-14 h-14 rounded-xl"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl flex items-center justify-center">
                          <span className="text-xl font-bold text-white">
                            {guild.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-white text-lg truncate">{guild.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {guild.owner && (
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                              <Crown className="w-3 h-3 mr-1" />
                              Owner
                            </Badge>
                          )}
                          {hasAdminPermission(guild.permissions) && !guild.owner && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Hash className="w-4 h-4" />
                        <span className="font-mono text-xs">{guild.id}</span>
                      </div>
                      {guild.features.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {guild.features.slice(0, 3).map((feature) => (
                            <Badge 
                              key={feature} 
                              variant="outline" 
                              className="text-xs border-gray-600 text-gray-400"
                            >
                              {feature.replace(/_/g, ' ').toLowerCase()}
                            </Badge>
                          ))}
                          {guild.features.length > 3 && (
                            <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                              +{guild.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-gray-500 text-sm"
        >
          <p>Server data is fetched from Discord API using the guilds scope</p>
          <p className="mt-1">You are logged in as <span className="text-indigo-400 font-semibold">{user?.username || user?.robloxUsername}</span></p>
        </motion.div>
      </div>
    </div>
  );
}
