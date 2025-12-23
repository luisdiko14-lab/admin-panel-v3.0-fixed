import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { SiWindows, SiLinux } from "react-icons/si";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SpecsDashboard() {
  const [showReal, setShowReal] = useState(true);

  const realSpecs = {
    ram: "512 MB",
    cpu: "2 Cores",
    storage: "5 GB",
    os: "Ubuntu 22.04 LTS",
    port: "5000",
    uptime: "99.8%",
    running: ["Node.js v20", "PostgreSQL", "Redis", "DiscordHub Pro"]
  };

  const fakeSpecs = {
    ram: "2.5 TB",
    cpu: "1200 Cores",
    storage: "55 TB",
    os: "Windows 12 Server",
    tier: "PREMIUM",
    uptime: "100%",
    running: ["Advanced AI Engine", "Real-time Processing", "Enterprise Security", "Global CDN"]
  };

  const specs = showReal ? realSpecs : fakeSpecs;

  const cpuData = [
    { name: "Core 1", usage: showReal ? 25 : 89 },
    { name: "Core 2", usage: showReal ? 30 : 92 },
    { name: "Core 3", usage: showReal ? 15 : 95 },
    { name: "Core 4", usage: showReal ? 20 : 88 }
  ];

  const ramData = [
    { name: "Used", value: showReal ? 256 : 1800 },
    { name: "Free", value: showReal ? 256 : 700 }
  ];

  return (
    <div className="min-h-screen bg-game-dark text-gray-100 pt-20 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">System Specifications</h1>
              <p className="text-gray-400">Real-time server and system metrics</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowReal(true)}
                className={`${showReal ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                <SiLinux className="mr-2" />
                Real Specs
              </Button>
              <Button
                onClick={() => setShowReal(false)}
                className={`${!showReal ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                <SiWindows className="mr-2" />
                Premium Specs
              </Button>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* RAM */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-game-slate border-gray-700 h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-300">RAM</h3>
                  <i className="fas fa-memory text-purple-400 text-lg"></i>
                </div>
                <p className="text-3xl font-bold text-purple-400 mb-2">{specs.ram}</p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: showReal ? "50%" : "72%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {showReal ? "256 MB / 512 MB" : "1.8 TB / 2.5 TB"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* CPU */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-game-slate border-gray-700 h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-300">CPU</h3>
                  <i className="fas fa-microchip text-red-400 text-lg"></i>
                </div>
                <p className="text-3xl font-bold text-red-400 mb-2">{specs.cpu}</p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: showReal ? "23%" : "91%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {showReal ? "~22% usage" : "~91% usage"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Storage */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-game-slate border-gray-700 h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-300">Storage</h3>
                  <i className="fas fa-database text-amber-400 text-lg"></i>
                </div>
                <p className="text-3xl font-bold text-amber-400 mb-2">{specs.storage}</p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{ width: showReal ? "60%" : "82%" }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {showReal ? "3 GB / 5 GB used" : "45 TB / 55 TB used"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* OS/Tier */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-game-slate border-gray-700 h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-300">
                    {showReal ? "Operating System" : "Tier"}
                  </h3>
                  <i className={`${showReal ? "fas fa-linux" : "fas fa-crown"} ${showReal ? "text-blue-400" : "text-amber-400"} text-lg`}></i>
                </div>
                <p className="text-2xl font-bold mb-2">
                  {showReal ? (
                    <span className="text-blue-400">{specs.os}</span>
                  ) : (
                    <span className="text-amber-400">{specs.tier}</span>
                  )}
                </p>
                <p className="text-xs text-gray-400">
                  {showReal ? "Ubuntu 22.04" : "Enterprise Edition"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* CPU Usage Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-game-slate border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <i className="fas fa-chart-bar text-red-400 mr-2"></i>
                  CPU Usage by Core
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={cpuData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #666",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="usage" fill="#ef4444" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* RAM Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-game-slate border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <i className="fas fa-chart-pie text-purple-400 mr-2"></i>
                  RAM Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ramData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#888" />
                    <YAxis dataKey="name" type="category" stroke="#888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1a1a2e",
                        border: "1px solid #666",
                        borderRadius: "8px"
                      }}
                    />
                    <Bar dataKey="value" fill="#a855f7" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Running Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-game-slate border-gray-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-gears text-green-400 mr-2"></i>
                Running Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {specs.running.map((service, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-500/30 flex items-center gap-3"
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-medium text-gray-200">{service}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card className={`border-2 ${showReal ? "bg-blue-900/20 border-blue-500/50" : "bg-amber-900/20 border-amber-500/50"}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <i className={`${showReal ? "fas fa-info-circle text-blue-400" : "fas fa-star text-amber-400"} text-2xl mt-1`}></i>
                <div>
                  <h4 className={`font-semibold mb-2 ${showReal ? "text-blue-400" : "text-amber-400"}`}>
                    {showReal ? "Real Server Specifications" : "Premium Tier Features"}
                  </h4>
                  <p className="text-gray-300">
                    {showReal
                      ? "These are the actual specifications of your DiscordHub Pro server. Monitor these metrics to ensure optimal performance and availability."
                      : "Upgrade to Premium for access to dedicated enterprise-grade servers with extreme performance capabilities, 24/7 priority support, and unlimited scaling potential."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
