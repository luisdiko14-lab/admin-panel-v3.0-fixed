import { cn } from "@/lib/utils";

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
      </div>
    </div>
  );
}
