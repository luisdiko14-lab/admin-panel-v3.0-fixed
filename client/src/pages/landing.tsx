import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-game-dark via-game-slate to-game-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-game-slate border-gray-700">
        <CardContent className="pt-6 text-center">
          <div className="mb-6">
            <div className="relative">
              <i className="fas fa-shield-alt text-game-amber text-6xl mb-4"></i>
              <div className="absolute -top-2 -right-2">
                <Badge variant="destructive" className="text-xs">HD ADMIN</Badge>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">War Tycoon</h1>
            <p className="text-gray-400">Administrative Control Center</p>
            <p className="text-xs text-purple-400 mt-1">Game ID: 81068715488268</p>
          </div>

          <div className="mb-6 bg-game-dark rounded-lg p-4">
            <h3 className="text-sm font-semibold text-white mb-2 flex items-center justify-center">
              <i className="fab fa-discord text-indigo-400 mr-2"></i>
              Discord Authentication Required
            </h3>
            <div className="text-xs text-gray-300 space-y-1">
              <p>• Must have Roblox account linked to Discord</p>
              <p>• Authorized users: <span className="text-game-amber font-mono">Luisdiko87</span> or <span className="text-game-amber font-mono">yaniselpror</span></p>
              <p>• Access granted via Discord connections verification</p>
            </div>
          </div>

          <Button 
            onClick={handleLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mb-4"
          >
            <i className="fab fa-discord mr-2"></i>
            Login with Discord
          </Button>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-game-dark rounded p-3">
              <div className="text-game-amber font-bold text-lg">48</div>
              <div className="text-xs text-gray-400">Admin Ranks</div>
            </div>
            <div className="bg-game-dark rounded p-3">
              <div className="text-green-400 font-bold text-lg">HD</div>
              <div className="text-xs text-gray-400">Rank System</div>
            </div>
          </div>

          <div className="border-t border-gray-600 pt-4">
            <h4 className="text-sm font-semibold text-white mb-2">Admin Features</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
              <div className="flex items-center">
                <i className="fas fa-users text-blue-400 mr-1"></i>
                Player Management
              </div>
              <div className="flex items-center">
                <i className="fas fa-terminal text-green-400 mr-1"></i>
                Command Console
              </div>
              <div className="flex items-center">
                <i className="fas fa-map text-red-400 mr-1"></i>
                Territory Control
              </div>
              <div className="flex items-center">
                <i className="fas fa-crown text-game-amber mr-1"></i>
                Rank System
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>Powered by HD Admin v6.2.3</p>
            <p>Real-time WebSocket Connection</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
