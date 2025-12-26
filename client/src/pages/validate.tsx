import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function Validate() {
  const [, setLocation] = useLocation();
  const [validationData, setValidationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const validate = async () => {
      try {
        const response = await fetch('/api/validate');
        const data = await response.json();
        
        if (data.status === 'validated') {
          setValidationData(data);
          setLoading(false);
          
          // Progress bar animation over 20 seconds
          const startTime = Date.now();
          const duration = 20000; // 20 seconds
          
          const progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);
            
            if (elapsed >= duration) {
              clearInterval(progressInterval);
              setLocation('/dashboard');
            }
          }, 50);
        } else {
          setLocation('/api/login');
        }
      } catch (error) {
        console.error('Validation error:', error);
        setLocation('/api/login');
      }
    };

    validate();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gray-900/90 backdrop-blur-xl border-purple-500/30 shadow-2xl shadow-purple-500/10 max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="mb-6 flex justify-center"
                >
                  <Loader2 className="w-12 h-12 text-amber-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">Validating Account...</h2>
                <p className="text-gray-400">Checking your credentials</p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="mb-6 flex justify-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">Account Validated!</h2>
                
                {validationData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800/50 rounded-lg p-4 space-y-3 mb-6"
                  >
                    <div className="text-left">
                      <p className="text-gray-400 text-sm">Username</p>
                      <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                        {validationData.username}
                      </Badge>
                    </div>
                    <div className="text-left">
                      <p className="text-gray-400 text-sm">Email</p>
                      <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                        {validationData.email}
                      </Badge>
                    </div>
                    <div className="text-left">
                      <p className="text-gray-400 text-sm">Servers Connected</p>
                      <Badge variant="secondary" className="bg-amber-500/20 text-amber-300">
                        {validationData.guilds} Guild{validationData.guilds !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </motion.div>
                )}
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <p className="text-gray-400 text-xs mt-2">{Math.round(progress)}% - Redirecting to dashboard...</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
