import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { SiDiscord } from "react-icons/si";
import { useState } from "react";

export default function DiscordDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [guildId] = useState("1370394626476867696");

  const { data: botStatus } = useQuery({
    queryKey: ["/api/discord/bot-status"],
  });

  const joinServerMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/discord/join-server", { guildId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bot successfully joined the Discord server!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/discord/bot-status"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to join server",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-game-dark text-gray-100">
      <div className="pt-20 p-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SiDiscord className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold">Discord Bot Control</h1>
          </div>
          <p className="text-gray-400">Manage your Discord bot and server integrations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bot Status */}
          <Card className="bg-game-slate border-gray-700">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-robot text-indigo-400 mr-2"></i>
                Bot Status
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Connected</span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-400">Online</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Guilds</span>
                  <span className="font-semibold">{botStatus?.guildCount || 1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Ping</span>
                  <span className="font-semibold text-green-400">{botStatus?.ping || "N/A"}ms</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Server Join */}
          <Card className="bg-game-slate border-gray-700">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-door-open text-amber-400 mr-2"></i>
                Join Server
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                  <p className="text-sm text-gray-400 mb-1">Target Server ID</p>
                  <p className="font-mono text-amber-400">{guildId}</p>
                </div>
                <Button
                  onClick={() => joinServerMutation.mutate()}
                  disabled={joinServerMutation.isPending}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                >
                  <SiDiscord className="mr-2 w-4 h-4" />
                  {joinServerMutation.isPending ? "Joining..." : "Join Server Now"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card className="bg-game-slate border-gray-700 md:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-lock text-green-400 mr-2"></i>
                Bot Permissions
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "Send Messages",
                  "Manage Roles",
                  "Ban Members",
                  "Kick Members",
                  "Mute Members",
                  "Read Audit Log",
                  "Manage Channels",
                  "View Audit Log"
                ].map((perm) => (
                  <div key={perm} className="bg-gray-900/50 rounded-lg p-3 border border-green-500/30 flex items-center gap-2">
                    <i className="fas fa-check-circle text-green-400 text-sm"></i>
                    <span className="text-sm text-gray-300">{perm}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Admin Info */}
          <Card className="bg-game-slate border-gray-700 md:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-user-shield text-amber-400 mr-2"></i>
                Your Admin Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Username</p>
                  <p className="font-semibold">{user?.username || "Admin"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Rank</p>
                  <p className="font-semibold text-amber-400">{user?.rankName || "Admin"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Permissions</p>
                  <p className="font-semibold text-green-400">All</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
