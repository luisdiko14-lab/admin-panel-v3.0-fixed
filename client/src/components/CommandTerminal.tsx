import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminCommand } from "@/types/game";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDistanceToNow } from "date-fns";

export default function CommandTerminal() {
  const [command, setCommand] = useState("");
  const { toast } = useToast();

  const { data: commandHistory = [] } = useQuery<AdminCommand[]>({
    queryKey: ["/api/admin/commands"],
  });

  const executeCommandMutation = useMutation({
    mutationFn: async ({ command, targetUser }: { command: string; targetUser?: string }) => {
      const response = await apiRequest("POST", "/api/admin/command", { command, targetUser });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Command Executed",
        description: data.result,
        variant: data.result.includes("Error") ? "destructive" : "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commands"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activity"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Command Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    // Parse command to extract target user
    const parts = command.split(" ");
    const targetUser = parts.length > 1 ? parts[1] : undefined;

    executeCommandMutation.mutate({ command: command.trim(), targetUser });
    setCommand("");
  };

  const quickCommands = [
    { command: ":tp", label: "Teleport Player", icon: "fas fa-location-arrow", color: "blue" },
    { command: ":ban", label: "Ban Player", icon: "fas fa-ban", color: "red" },
    { command: ":rank", label: "Set Rank", icon: "fas fa-crown", color: "amber" },
    { command: ":give", label: "Give Item", icon: "fas fa-gift", color: "green" },
  ];

  const executeQuickCommand = (cmd: string) => {
    const targetUser = prompt(`Enter target user for ${cmd}:`);
    if (targetUser) {
      executeCommandMutation.mutate({ command: `${cmd} ${targetUser}`, targetUser });
    }
  };

  const getCommandTypeColor = (result: string) => {
    if (result.includes("Error") || result.includes("failed")) return "text-red-400";
    if (result.includes("Warning")) return "text-amber-400";
    if (result.includes("Success") || result.includes("completed")) return "text-green-400";
    return "text-blue-400";
  };

  const getCommandTypeLabel = (result: string) => {
    if (result.includes("Error") || result.includes("failed")) return "[ERROR]";
    if (result.includes("Warning")) return "[WARNING]";
    if (result.includes("Success") || result.includes("completed")) return "[SUCCESS]";
    return "[INFO]";
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center">
        <i className="fas fa-terminal text-green-400 mr-2"></i>
        Admin Command Terminal
      </h3>

      {/* Command Input */}
      <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
        <form onSubmit={handleCommandSubmit} className="flex items-center space-x-2">
          <span className="text-green-400">admin@wartycoon:~$</span>
          <Input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="Enter command..."
            className="bg-transparent border-none outline-none flex-1 text-green-400 font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={executeCommandMutation.isPending}
          />
          {executeCommandMutation.isPending && (
            <i className="fas fa-spinner fa-spin text-green-400"></i>
          )}
        </form>
      </div>

      {/* Quick Commands */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickCommands.map((cmd) => (
          <Button
            key={cmd.command}
            onClick={() => executeQuickCommand(cmd.command)}
            variant="outline"
            className={`p-3 text-left transition-colors ${
              cmd.color === "blue" ? "bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/50 text-blue-400" :
              cmd.color === "red" ? "bg-red-600/20 hover:bg-red-600/30 border-red-500/50 text-red-400" :
              cmd.color === "amber" ? "bg-amber-600/20 hover:bg-amber-600/30 border-amber-500/50 text-amber-400" :
              "bg-green-600/20 hover:bg-green-600/30 border-green-500/50 text-green-400"
            }`}
            disabled={executeCommandMutation.isPending}
          >
            <div>
              <div className="font-semibold">
                <i className={`${cmd.icon} mr-2`}></i>
                {cmd.command} [player]
              </div>
              <div className="text-xs opacity-70 mt-1">{cmd.label}</div>
            </div>
          </Button>
        ))}
      </div>

      {/* Command History */}
      <div className="bg-black/50 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
        {commandHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <i className="fas fa-terminal text-3xl mb-2"></i>
            <p>No command history</p>
          </div>
        ) : (
          <div className="space-y-1 text-gray-300">
            {commandHistory.map((cmd) => (
              <div key={cmd.id} className="flex items-start space-x-2">
                <span className={getCommandTypeColor(cmd.result)}>
                  {getCommandTypeLabel(cmd.result)}
                </span>
                <div className="flex-1">
                  <span>{cmd.result}</span>
                  <div className="text-xs text-gray-500 mt-1">
                    Command: {cmd.command} | {formatDistanceToNow(new Date(cmd.timestamp), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
