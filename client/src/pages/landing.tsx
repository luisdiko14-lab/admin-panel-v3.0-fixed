import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-game-dark via-game-slate to-game-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-game-slate border-gray-700">
        <CardContent className="pt-6 text-center">
          <div className="mb-6">
            <i className="fas fa-shield-alt text-game-amber text-6xl mb-4"></i>
            <h1 className="text-3xl font-bold text-white mb-2">War Tycoon</h1>
            <p className="text-gray-400">Admin Dashboard</p>
          </div>

          <div className="mb-6">
            <p className="text-gray-300 text-sm mb-4">
              Access the administrative control panel for War Tycoon game server.
              Manage ranks, territories, and player actions.
            </p>
          </div>

          <Button 
            onClick={handleLogin}
            className="w-full bg-game-blue hover:bg-blue-600 text-white"
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Sign In to Dashboard
          </Button>

          <div className="mt-6 text-xs text-gray-500">
            <p>Powered by HD Admin Rank System</p>
            <p>48 Administrative Ranks Available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
