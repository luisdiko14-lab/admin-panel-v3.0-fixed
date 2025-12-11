import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Shield, Users, Terminal, Map, Crown, Zap, Lock, Sword, Target, Star, User, Key } from "lucide-react";
import { SiDiscord, SiRobloxstudio } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Landing() {
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDiscordLogin = () => {
    window.location.href = "/api/login";
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/manual-login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { "Content-Type": "application/json" }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      
      const data = await response.json();
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.username}!`,
      });
      
      window.location.href = "/";
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>
      
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoNnptLTQgMThoLTZ2Nmg2di02eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="bg-gray-900/90 backdrop-blur-xl border-purple-500/30 shadow-2xl shadow-purple-500/10">
          <CardContent className="pt-8 pb-8 text-center">
            <motion.div 
              className="mb-8"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-24 h-24 mx-auto border-2 border-dashed border-amber-500/30 rounded-full"
                />
                <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -top-2 -right-2"
                >
                  <Badge className="bg-red-500 text-white font-bold px-2 py-1 text-xs shadow-lg">
                    HD ADMIN
                  </Badge>
                </motion.div>
              </div>
              
              <motion.h1 
                className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 mt-6 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                War Tycoon
              </motion.h1>
              <p className="text-gray-400 text-lg">Administrative Control Center</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <SiRobloxstudio className="text-red-400 w-4 h-4" />
                <p className="text-xs text-purple-400 font-mono">Game ID: 81068715488268</p>
              </div>
            </motion.div>

            {!showManualLogin ? (
              <>
                <motion.div 
                  className="mb-6 bg-gray-800/50 rounded-xl p-5 border border-gray-700/50"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-center gap-2">
                    <SiDiscord className="text-indigo-400 w-5 h-5" />
                    Discord Authentication
                    <Lock className="w-4 h-4 text-gray-500" />
                  </h3>
                  <div className="text-sm text-gray-300 space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span>Must have Roblox account linked to Discord</span>
                    </div>
                    <div className="flex items-start justify-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 mt-0.5" />
                      <span>Authorized: 
                        <span className="text-amber-400 font-mono mx-1">Luisdiko87</span>
                        <span className="text-amber-400 font-mono mx-1">yaniselpror</span>
                        <span className="text-amber-400 font-mono mx-1">AltAccountLuis212</span>
                      </span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <Button 
                    onClick={handleDiscordLogin}
                    data-testid="button-login-discord"
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-6 text-lg font-semibold shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 hover:scale-[1.02]"
                  >
                    <SiDiscord className="mr-3 w-6 h-6" />
                    Login with Discord
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-900 px-2 text-gray-500">or</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setShowManualLogin(true)}
                    data-testid="button-show-manual-login"
                    variant="outline"
                    className="w-full border-amber-500/50 text-amber-400 hover:bg-amber-500/10 py-5"
                  >
                    <Key className="mr-2 w-5 h-5" />
                    Admin Login
                  </Button>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="bg-gray-800/50 rounded-xl p-5 border border-amber-500/30">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center justify-center gap-2">
                    <Key className="text-amber-400 w-5 h-5" />
                    Admin Login
                  </h3>
                  
                  <form onSubmit={handleManualLogin} className="space-y-4">
                    <div className="space-y-2 text-left">
                      <Label htmlFor="username" className="text-gray-300 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Username
                      </Label>
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter admin username"
                        data-testid="input-username"
                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2 text-left">
                      <Label htmlFor="password" className="text-gray-300 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        data-testid="input-password"
                        className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                    
                    <Button 
                      type="submit"
                      disabled={isLoading}
                      data-testid="button-manual-login"
                      className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white py-5 font-semibold"
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </div>
                
                <Button 
                  onClick={() => setShowManualLogin(false)}
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                  data-testid="button-back-to-discord"
                >
                  Back to Discord Login
                </Button>
              </motion.div>
            )}

            <motion.div 
              className="grid grid-cols-4 gap-3 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <div className="text-amber-400 font-bold text-xl">48</div>
                <div className="text-xs text-gray-500">Ranks</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <div className="text-green-400 font-bold text-xl">HD</div>
                <div className="text-xs text-gray-500">System</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <div className="text-blue-400 font-bold text-xl">
                  <Zap className="w-5 h-5 mx-auto" />
                </div>
                <div className="text-xs text-gray-500">Real-time</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/30">
                <div className="text-red-400 font-bold text-xl">
                  <Target className="w-5 h-5 mx-auto" />
                </div>
                <div className="text-xs text-gray-500">Control</div>
              </div>
            </motion.div>

            <motion.div 
              className="border-t border-gray-700/50 pt-5 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <h4 className="text-sm font-semibold text-white mb-3">Admin Features</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800/30 rounded-lg p-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  Player Management
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800/30 rounded-lg p-2">
                  <Terminal className="w-4 h-4 text-green-400" />
                  Command Console
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800/30 rounded-lg p-2">
                  <Map className="w-4 h-4 text-red-400" />
                  Territory Control
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800/30 rounded-lg p-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  48-Rank System
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800/30 rounded-lg p-2">
                  <Sword className="w-4 h-4 text-purple-400" />
                  War Commands
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800/30 rounded-lg p-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  WebSocket Live
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="mt-6 text-xs text-gray-600 flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Shield className="w-3 h-3" />
              <span>Powered by HD Admin v6.2.3</span>
              <span>•</span>
              <span>Secure Authentication</span>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
