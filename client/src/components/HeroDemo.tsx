import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Eye, Heart, MessageCircle, Play, Users } from 'lucide-react';

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(start + (end - start) * easeOutQuart));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, start]);
  
  return count;
}

// Format number with K/M suffix
function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// Mini video card component
function MiniVideoCard({ 
  views, 
  likes, 
  delay,
  isViral 
}: { 
  views: number; 
  likes: number; 
  delay: number;
  isViral?: boolean;
}) {
  const animatedViews = useAnimatedCounter(views, 2500, Math.floor(views * 0.3));
  const animatedLikes = useAnimatedCounter(likes, 2500, Math.floor(likes * 0.3));
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`relative bg-black/40 backdrop-blur-sm rounded-lg p-2 border ${
        isViral ? 'border-accent/50 shadow-[0_0_20px_rgba(0,255,136,0.2)]' : 'border-white/10'
      }`}
    >
      {isViral && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.3 }}
          className="absolute -top-2 -right-2 bg-accent text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full"
        >
          VIRAL
        </motion.div>
      )}
      
      {/* Video thumbnail placeholder */}
      <div className="relative w-16 h-20 sm:w-20 sm:h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-md mb-2 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-white" />
          </motion.div>
        </div>
        
        {/* Animated gradient overlay */}
        <motion.div
          animate={{ 
            background: [
              'linear-gradient(45deg, rgba(139,92,246,0.3) 0%, transparent 100%)',
              'linear-gradient(45deg, transparent 0%, rgba(6,182,212,0.3) 100%)',
              'linear-gradient(45deg, rgba(139,92,246,0.3) 0%, transparent 100%)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0"
        />
      </div>
      
      {/* Stats */}
      <div className="space-y-1">
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-white/80">
          <Eye className="w-3 h-3" />
          <span className="font-medium">{formatNumber(animatedViews)}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-white/80">
          <Heart className="w-3 h-3 text-red-400" />
          <span className="font-medium">{formatNumber(animatedLikes)}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Growth chart component
function GrowthChart() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 500);
    return () => clearTimeout(timer);
  }, []);
  
  // SVG path for growth curve
  const pathD = "M 0 60 Q 20 55, 40 45 T 80 30 T 120 15 T 160 5";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative"
    >
      <svg width="100%" height="70" viewBox="0 0 160 70" className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgb(139, 92, 246)" />
            <stop offset="100%" stopColor="rgb(6, 182, 212)" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <motion.path
          d="M 0 60 Q 20 55, 40 45 T 80 30 T 120 15 T 160 5 L 160 70 L 0 70 Z"
          fill="url(#areaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        />
        
        {/* Main line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="url(#chartGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: progress / 100 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        
        {/* Animated dot at end */}
        <motion.circle
          cx="160"
          cy="5"
          r="4"
          fill="rgb(6, 182, 212)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2 }}
        />
        <motion.circle
          cx="160"
          cy="5"
          r="8"
          fill="rgb(6, 182, 212)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.5, 0], scale: [1, 2, 2] }}
          transition={{ delay: 2, duration: 1.5, repeat: Infinity }}
        />
      </svg>
    </motion.div>
  );
}

export function HeroDemo() {
  const followerCount = useAnimatedCounter(52400, 3000, 12000);
  const viewsCount = useAnimatedCounter(1250000, 3000, 250000);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative w-full max-w-2xl mx-auto mb-6 sm:mb-8"
    >
      {/* Main container */}
      <div className="relative bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 p-3 sm:p-4 overflow-hidden">
        {/* Animated gradient border */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-50"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), rgba(6,182,212,0.3), transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 0%', '200% 0%'],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="relative z-10">
          {/* Header stats */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Profile avatar */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-medium text-white">@demo_account</div>
                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-accent">
                  <TrendingUp className="w-3 h-3" />
                  <span>+340% Wachstum</span>
                </div>
              </div>
            </div>
            
            {/* Live indicator */}
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1.5 text-[10px] sm:text-xs text-white/60"
            >
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full" />
              Live Demo
            </motion.div>
          </div>
          
          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="bg-white/5 rounded-lg p-2 sm:p-3">
              <div className="text-[10px] sm:text-xs text-white/60 mb-0.5 sm:mb-1">Follower</div>
              <div className="text-base sm:text-xl font-bold text-white">{formatNumber(followerCount)}</div>
              <div className="text-[10px] sm:text-xs text-accent flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12.4K
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-2 sm:p-3">
              <div className="text-[10px] sm:text-xs text-white/60 mb-0.5 sm:mb-1">Views (30d)</div>
              <div className="text-base sm:text-xl font-bold text-white">{formatNumber(viewsCount)}</div>
              <div className="text-[10px] sm:text-xs text-accent flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +890K
              </div>
            </div>
          </div>
          
          {/* Growth chart */}
          <div className="mb-3 sm:mb-4">
            <div className="text-[10px] sm:text-xs text-white/60 mb-1 sm:mb-2">Follower-Wachstum</div>
            <GrowthChart />
          </div>
          
          {/* Video cards */}
          <div className="flex items-end justify-center gap-2 sm:gap-3">
            <MiniVideoCard views={45000} likes={3200} delay={0.5} />
            <MiniVideoCard views={892000} likes={67000} delay={0.7} isViral />
            <MiniVideoCard views={128000} likes={9400} delay={0.9} />
          </div>
        </div>
      </div>
      
      {/* Floating elements */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute -left-2 sm:-left-4 top-1/4 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5"
      >
        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-accent">
          <Heart className="w-3 h-3 fill-accent" />
          <span className="font-medium">+2.4K</span>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8 }}
        className="absolute -right-2 sm:-right-4 top-1/3 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5"
      >
        <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-primary">
          <MessageCircle className="w-3 h-3" />
          <span className="font-medium">+847</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default HeroDemo;
