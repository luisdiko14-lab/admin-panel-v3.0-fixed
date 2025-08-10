import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import TopNavigation from "@/components/TopNavigation";
import Sidebar from "@/components/Sidebar";
import WarMap from "@/components/WarMap";
import ResourceOverview from "@/components/ResourceOverview";
import ActivityFeed from "@/components/ActivityFeed";
import RankManagement from "@/components/RankManagement";
import CommandTerminal from "@/components/CommandTerminal";
import { Card, CardContent } from "@/components/ui/card";
import { GameStats } from "@/types/game";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { lastMessage } = useWebSocket();

  const { data: stats, refetch: refetchStats } = useQuery<GameStats>({
    queryKey: ["/api/game/stats"],
    refetchInterval: 30000,
  });

  // Update stats when receiving WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === "gameStats") {
      refetchStats();
    }
  }, [lastMessage, refetchStats]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-game-slate border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Online Players</p>
                      <p className="text-2xl font-bold text-green-400">
                        {stats?.onlinePlayers || 0}
                      </p>
                    </div>
                    <i className="fas fa-users text-green-400 text-2xl"></i>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-game-slate border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Tycoons</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {stats?.activeTycoons || 0}
                      </p>
                    </div>
                    <i className="fas fa-industry text-blue-400 text-2xl"></i>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-game-slate border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-game-amber">
                        {formatNumber(stats?.totalRevenue || 0)}
                      </p>
                    </div>
                    <i className="fas fa-dollar-sign text-game-amber text-2xl"></i>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-game-slate border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Server Uptime</p>
                      <p className="text-2xl font-bold text-purple-400">
                        {stats?.uptime || "99.8%"}
                      </p>
                    </div>
                    <i className="fas fa-server text-purple-400 text-2xl"></i>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* War Map & Resource Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WarMap />
              <ResourceOverview />
            </div>

            {/* Recent Activity & Top Players */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityFeed />
              <Card className="bg-game-slate border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <i className="fas fa-trophy text-game-amber mr-2"></i>
                    Top Ranked Players
                  </h3>
                  <div className="text-center py-8 text-gray-400">
                    <i className="fas fa-users text-3xl mb-2"></i>
                    <p>No ranked players data available</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "ranks":
        return (
          <Card className="bg-game-slate border-gray-700">
            <CardContent className="p-6">
              <RankManagement />
            </CardContent>
          </Card>
        );

      case "commands":
        return (
          <Card className="bg-game-slate border-gray-700">
            <CardContent className="p-6">
              <CommandTerminal />
            </CardContent>
          </Card>
        );

      case "logs":
        return (
          <Card className="bg-game-slate border-gray-700">
            <CardContent className="p-6">
              <ActivityFeed />
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card className="bg-game-slate border-gray-700">
            <CardContent className="pt-6 text-center">
              <i className="fas fa-construction text-4xl text-yellow-500 mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-gray-400">This feature is under development.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-game-dark text-gray-100">
      <TopNavigation />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 ml-64 pt-16 p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
