import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function SpecsDashboard() {
  const specs = {
    ram: "2.5 TB",
    cpu: "1200 Cores",
    storage: "55 TB",
    os: "Windows 12 Server",
    tier: "PREMIUM",
    uptime: "100%",
  };

  const services = [
    "Advanced AI Engine",
    "Real-time Processing",
    "Enterprise Security",
    "Global CDN"
  ];

  return (
    <div className="min-h-screen bg-game-dark text-gray-100 pt-20 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Premium System Specs</h1>
          <p className="text-gray-400">Enterprise-Grade Server Performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-game-slate border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-300">RAM</h3>
                  <i className="fas fa-memory text-purple-400 text-lg"></i>
                </div>
                <p className="text-3xl font-bold text-purple-400">{specs.ram}</p>
                <p className="text-xs text-gray-400 mt-2">Premium Allocation</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-game-slate border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-300">CPU</h3>
                  <i className="fas fa-microchip text-red-400 text-lg"></i>
                </div>
                <p className="text-3xl font-bold text-red-400">{specs.cpu}</p>
                <p className="text-xs text-gray-400 mt-2">Parallel Processing</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-game-slate border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-300">Storage</h3>
                  <i className="fas fa-database text-amber-400 text-lg"></i>
                </div>
                <p className="text-3xl font-bold text-amber-400">{specs.storage}</p>
                <p className="text-xs text-gray-400 mt-2">SSD Storage</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-game-slate border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-300">Uptime</h3>
                  <i className="fas fa-check-circle text-green-400 text-lg"></i>
                </div>
                <p className="text-3xl font-bold text-green-400">{specs.uptime}</p>
                <p className="text-xs text-gray-400 mt-2">Guaranteed SLA</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card className="bg-game-slate border-gray-700 mb-8">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-gears text-green-400 mr-2"></i>
              Running Services
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {services.map((service, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-500/30 flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">{service}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-900/20 border-2 border-amber-500/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <i className="fas fa-star text-amber-400 text-2xl mt-1"></i>
              <div>
                <h4 className="font-semibold mb-2 text-amber-400">Premium Enterprise Tier</h4>
                <p className="text-gray-300">You're running on our most powerful infrastructure with enterprise-grade performance, dedicated support, and unlimited scaling potential.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
