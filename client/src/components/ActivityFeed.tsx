import { useQuery } from "@tanstack/react-query";
import { ActivityItem } from "@/types/game";
import { formatDistanceToNow } from "date-fns";

export default function ActivityFeed() {
  const { data: activities = [] } = useQuery<ActivityItem[]>({
    queryKey: ["/api/activity"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "rank_change":
        return "w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0";
      case "admin_command":
        return "w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0";
      case "territory_capture":
        return "w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0";
      case "user_banned":
        return "w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0";
      default:
        return "w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0";
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case "rank_change":
        return "text-blue-400";
      case "admin_command":
        return "text-purple-400";
      case "territory_capture":
        return "text-green-400";
      case "user_banned":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="bg-game-slate rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <i className="fas fa-history text-green-400 mr-2"></i>
        Recent Activity
      </h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <i className="fas fa-inbox text-3xl mb-2"></i>
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg"
            >
              <div className={getActivityIcon(activity.action)}></div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className={`font-semibold ${getActivityColor(activity.action)}`}>
                    {activity.user?.username || "System"}
                  </span>{" "}
                  {activity.details}
                </p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
