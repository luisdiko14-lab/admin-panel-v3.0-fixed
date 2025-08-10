import { useQuery } from "@tanstack/react-query";
import { Tycoon } from "@/types/game";

export default function ResourceOverview() {
  const { data: tycoons = [] } = useQuery<Tycoon[]>({
    queryKey: ["/api/tycoons/active"],
  });

  // Calculate global resources from all active tycoons
  const globalResources = tycoons.reduce(
    (acc, tycoon) => {
      acc.crystals += tycoon.resources.crystals || 0;
      acc.oil += tycoon.resources.oil || 0;
      acc.steel += tycoon.resources.steel || 0;
      acc.energy += tycoon.resources.energy || 0;
      return acc;
    },
    { crystals: 0, oil: 0, steel: 0, energy: 0 }
  );

  const maxResource = Math.max(
    globalResources.crystals,
    globalResources.oil,
    globalResources.steel,
    globalResources.energy
  );

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const getPercentage = (value: number) => {
    return maxResource > 0 ? (value / maxResource) * 100 : 0;
  };

  const resources = [
    {
      name: "Crystals",
      icon: "fas fa-gem",
      color: "purple-400",
      amount: globalResources.crystals,
      percentage: getPercentage(globalResources.crystals),
    },
    {
      name: "Oil",
      icon: "fas fa-oil-can",
      color: "yellow-600",
      amount: globalResources.oil,
      percentage: getPercentage(globalResources.oil),
    },
    {
      name: "Steel",
      icon: "fas fa-hammer",
      color: "gray-400",
      amount: globalResources.steel,
      percentage: getPercentage(globalResources.steel),
    },
    {
      name: "Energy",
      icon: "fas fa-bolt",
      color: "blue-400",
      amount: globalResources.energy,
      percentage: getPercentage(globalResources.energy),
    },
  ];

  return (
    <div className="bg-game-slate rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <i className="fas fa-coins text-game-amber mr-2"></i>
        Global Resources
      </h3>
      <div className="space-y-4">
        {resources.map((resource) => (
          <div key={resource.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className={`${resource.icon} text-${resource.color}`}></i>
              <span>{resource.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div
                  className={`bg-${resource.color} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min(resource.percentage, 100)}%` }}
                ></div>
              </div>
              <span className="text-sm font-mono">
                {formatNumber(resource.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
