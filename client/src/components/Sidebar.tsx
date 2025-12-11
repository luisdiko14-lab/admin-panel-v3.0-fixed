import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { Server } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "fas fa-tachometer-alt" },
    { id: "ranks", label: "Rank Management", icon: "fas fa-crown" },
    { id: "tycoon", label: "Tycoon Control", icon: "fas fa-industry" },
    { id: "players", label: "Player Management", icon: "fas fa-users" },
    { id: "commands", label: "Admin Commands", icon: "fas fa-terminal" },
    { id: "logs", label: "Activity Logs", icon: "fas fa-list-alt" },
    { id: "settings", label: "Server Settings", icon: "fas fa-cog" },
  ];

  return (
    <div className="bg-game-slate w-64 border-r border-gray-700 overflow-y-auto fixed left-0 top-16 bottom-0">
      <div className="p-4 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            data-testid={`sidebar-tab-${tab.id}`}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
              activeTab === tab.id
                ? "bg-game-blue/20 text-game-blue"
                : "hover:bg-gray-700"
            )}
          >
            <i className={tab.icon}></i>
            <span>{tab.label}</span>
          </button>
        ))}
        
        <div className="pt-4 mt-4 border-t border-gray-700">
          <Link href="/servers">
            <button
              data-testid="sidebar-link-servers"
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-indigo-600/20 text-indigo-400"
            >
              <Server className="w-4 h-4" />
              <span>Discord Servers</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
