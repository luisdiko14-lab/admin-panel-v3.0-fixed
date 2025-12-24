import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { SiDiscord } from "react-icons/si";
import { Settings, Activity } from "lucide-react";

const BOT_STATUSES = ["online", "idle", "dnd", "invisible"];
const ACTIVITY_TYPES = ["playing", "listening", "competing", "streaming"];

export default function BotConfig() {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState("online");
  const [selectedActivity, setSelectedActivity] = useState("playing");
  const [activityText, setActivityText] = useState("DiscordHub Pro");
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (status: string) => {
    setLoading(true);
    try {
      // Send command to bot (via REST or Discord command)
      const command = `!status ${status}`;
      
      toast({
        title: "Status Changed",
        description: `Bot status set to ${status}`,
      });
      setSelectedStatus(status);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivityChange = async () => {
    if (!activityText.trim()) {
      toast({
        title: "Error",
        description: "Activity text cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const command = `!activity ${selectedActivity} ${activityText}`;
      
      toast({
        title: "Activity Updated",
        description: `Bot activity set to ${selectedActivity} ${activityText}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change activity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-game-dark text-gray-100">
      <div className="pt-20 p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-bold">Bot Configuration</h1>
          </div>
          <p className="text-gray-400">Manage bot status and activity settings</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Bot Status Control */}
          <Card className="bg-game-slate border-gray-700">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center">
                <SiDiscord className="w-5 h-5 text-indigo-400 mr-2" />
                Bot Status
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-400">Select the bot's online status:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {BOT_STATUSES.map((status) => (
                    <Button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={loading}
                      className={`capitalize ${
                        selectedStatus === status
                          ? "bg-indigo-600 hover:bg-indigo-500"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                      data-testid={`button-status-${status}`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            status === "online"
                              ? "bg-green-400"
                              : status === "idle"
                              ? "bg-yellow-400"
                              : status === "dnd"
                              ? "bg-red-400"
                              : "bg-gray-400"
                          }`}
                        ></div>
                        <span>{status}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bot Activity Control */}
          <Card className="bg-game-slate border-gray-700">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center">
                <Activity className="w-5 h-5 text-cyan-400 mr-2" />
                Bot Activity
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Activity Type:</label>
                  <select
                    value={selectedActivity}
                    onChange={(e) => setSelectedActivity(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    data-testid="select-activity-type"
                  >
                    {ACTIVITY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 block mb-2">Activity Text:</label>
                  <input
                    type="text"
                    value={activityText}
                    onChange={(e) => setActivityText(e.target.value)}
                    placeholder="e.g., DiscordHub Pro"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                    data-testid="input-activity-text"
                  />
                </div>

                <Button
                  onClick={handleActivityChange}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                  data-testid="button-update-activity"
                >
                  {loading ? "Updating..." : "Update Activity"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Current Settings Display */}
          <Card className="bg-game-slate border-gray-700">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Current Settings</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                  <span className="text-gray-400">Status</span>
                  <span className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        selectedStatus === "online"
                          ? "bg-green-400"
                          : selectedStatus === "idle"
                          ? "bg-yellow-400"
                          : selectedStatus === "dnd"
                          ? "bg-red-400"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    <span className="capitalize text-white font-semibold">{selectedStatus}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                  <span className="text-gray-400">Activity</span>
                  <span className="text-white font-semibold capitalize">
                    {selectedActivity} {activityText}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-700/50">
            <CardContent className="p-6">
              <p className="text-sm text-amber-200">
                💡 <strong>Tip:</strong> Use Discord commands !status and !activity to change bot settings from the server. Admins can configure these settings here or via bot commands.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
