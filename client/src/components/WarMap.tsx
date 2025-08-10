import { useQuery } from "@tanstack/react-query";
import { Territory } from "@/types/game";

export default function WarMap() {
  const { data: territories = [] } = useQuery<Territory[]>({
    queryKey: ["/api/territories"],
  });

  const getTeamColor = (team: string) => {
    switch (team) {
      case "red": return "bg-red-600/80 border-red-400";
      case "blue": return "bg-blue-600/80 border-blue-400";
      case "green": return "bg-green-600/80 border-green-400";
      case "contested": return "bg-yellow-600/80 border-yellow-400";
      default: return "bg-gray-600/80 border-gray-400";
    }
  };

  const getTeamLabel = (team: string) => {
    switch (team) {
      case "red": return "RED";
      case "blue": return "BLUE";
      case "green": return "GRN";
      case "contested": return "WAR";
      default: return "---";
    }
  };

  return (
    <div className="bg-game-slate rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <i className="fas fa-map text-game-red mr-2"></i>
        War Territory Map
      </h3>
      
      <div className="bg-gradient-to-br from-red-900/20 to-blue-900/20 rounded-lg h-64 relative overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-1 p-2">
          {Array.from({ length: 12 }).map((_, index) => {
            // Create mock territories for demo
            const teams = ["red", "blue", "green", "neutral", "contested"];
            const team = teams[index % teams.length];
            
            return (
              <div
                key={index}
                className={`${getTeamColor(team)} rounded border-2 flex items-center justify-center text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity`}
              >
                {getTeamLabel(team)}
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="mt-4 flex justify-between text-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-600 rounded mr-1"></div>
            Red Team: 34%
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-600 rounded mr-1"></div>
            Blue Team: 28%
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-600 rounded mr-1"></div>
            Green Team: 15%
          </div>
        </div>
      </div>
    </div>
  );
}
