import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Rank } from "@/types/game";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RankManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { data: ranks = [] } = useQuery<Rank[]>({
    queryKey: ["/api/ranks"],
  });

  const filteredRanks = ranks.filter((rank) => {
    const matchesSearch = rank.rankName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "supreme" && rank.rankScore >= 4.5) return matchesSearch;
    if (selectedFilter === "admin" && rank.rankScore >= 4 && rank.rankScore < 4.5) return matchesSearch;
    if (selectedFilter === "staff" && rank.rankScore >= 1 && rank.rankScore < 4) return matchesSearch;
    if (selectedFilter === "vip" && rank.rankScore > 0 && rank.rankScore < 1) return matchesSearch;
    if (selectedFilter === "nonadmin" && rank.rankScore === 0) return matchesSearch;
    
    return false;
  });

  const getRankGradient = (rankScore: number) => {
    if (rankScore >= 4.95) return "from-amber-900/30 to-transparent border-amber-500/30";
    if (rankScore >= 4.9) return "from-blue-900/30 to-transparent border-blue-500/30";
    if (rankScore >= 4.8) return "from-purple-900/30 to-transparent border-purple-500/30";
    if (rankScore >= 4.5) return "from-green-900/30 to-transparent border-green-500/30";
    if (rankScore >= 1) return "from-gray-800/30 to-transparent border-gray-600/30";
    return "from-gray-700/20 to-transparent border-gray-500/20";
  };

  const getRankColor = (rankScore: number) => {
    if (rankScore >= 4.95) return "text-amber-400";
    if (rankScore >= 4.9) return "text-blue-400";
    if (rankScore >= 4.8) return "text-purple-400";
    if (rankScore >= 4.5) return "text-green-400";
    if (rankScore >= 1) return "text-gray-400";
    return "text-gray-300";
  };

  const getRankBadgeColor = (rankScore: number) => {
    if (rankScore >= 4.95) return "bg-amber-500/20 text-amber-400";
    if (rankScore >= 4.9) return "bg-blue-500/20 text-blue-400";
    if (rankScore >= 4.8) return "bg-purple-500/20 text-purple-400";
    if (rankScore >= 4.5) return "bg-green-500/20 text-green-400";
    if (rankScore >= 1) return "bg-gray-500/20 text-gray-400";
    return "bg-gray-600/20 text-gray-400";
  };

  const getPermissionLabel = (permissions: string[]) => {
    if (permissions.includes("all")) return "All Permissions";
    if (permissions.includes("admin")) return "High Permissions";
    if (permissions.includes("moderate")) return "Mod Permissions";
    if (permissions.includes("kick")) return "Police Powers";
    if (permissions.includes("vip")) return "VIP Benefits";
    return "Basic Access";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <i className="fas fa-crown text-game-amber mr-2"></i>
          HD Admin Rank System ({ranks.length} Ranks)
        </h3>
        <Button className="bg-game-blue hover:bg-blue-600">
          <i className="fas fa-plus mr-2"></i>
          Assign Rank
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex space-x-4">
        <Input
          placeholder="Search ranks or players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-gray-700 border-gray-600"
        />
        <Select value={selectedFilter} onValueChange={setSelectedFilter}>
          <SelectTrigger className="w-48 bg-gray-700 border-gray-600">
            <SelectValue placeholder="All Ranks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ranks</SelectItem>
            <SelectItem value="supreme">Supreme Ranks (4.5+)</SelectItem>
            <SelectItem value="admin">Administrative (4.0-4.5)</SelectItem>
            <SelectItem value="staff">Staff (1.0-4.0)</SelectItem>
            <SelectItem value="vip">VIP (0.1-1.0)</SelectItem>
            <SelectItem value="nonadmin">NonAdmin (0.0)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Rank Hierarchy Display */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredRanks.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-400">
              <i className="fas fa-search text-3xl mb-2"></i>
              <p>No ranks found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          filteredRanks.map((rank) => (
            <div
              key={rank.id}
              className={`bg-gradient-to-r ${getRankGradient(rank.rankScore)} rounded-lg p-4 border`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-current to-current rounded-full flex items-center justify-center font-bold text-black text-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-600 opacity-80"></div>
                    <span className="relative z-10">
                      {rank.rankScore.toFixed(rank.rankScore === Math.floor(rank.rankScore) ? 0 : 2)}
                    </span>
                  </div>
                  <div>
                    <h4 className={`font-semibold ${getRankColor(rank.rankScore)}`}>
                      {rank.rankName}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {rank.rankScore >= 4.5 ? "Highest administrative rank" : 
                       rank.rankScore >= 4 ? "Administrative authority" :
                       rank.rankScore >= 1 ? "Staff privileges" : 
                       rank.rankScore > 0 ? "Premium player status" : "Regular player status"}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${getRankBadgeColor(rank.rankScore)}`}>
                        {getPermissionLabel(rank.permissions)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {/* This would normally show user count */}
                        0 users
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-blue-500/50"
                  >
                    View Users
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
