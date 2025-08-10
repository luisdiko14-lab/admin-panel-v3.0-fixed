import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function TopNavigation() {
  const { user } = useAuth();
  const { isConnected } = useWebSocket();

  return (
    <nav className="bg-game-slate border-b border-gray-700 px-4 py-3 fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <i className="fas fa-shield-alt text-game-amber text-2xl"></i>
          <h1 className="text-xl font-bold">War Tycoon Admin Dashboard</h1>
          <div className={`px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? "bg-game-green/20 text-game-green" 
              : "bg-red-500/20 text-red-400"
          }`}>
            <i className="fas fa-circle text-xs mr-1"></i>
            <span>{isConnected ? "Server Online" : "Server Offline"}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">Logged in as</div>
            <div className="font-semibold">
              {user?.firstName || user?.username || "Admin User"}
            </div>
            <div className="text-xs text-game-amber">
              {user?.rankName || "NonAdmin"}
            </div>
          </div>
          <img 
            src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face"} 
            alt="Profile" 
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
      </div>
    </nav>
  );
}
