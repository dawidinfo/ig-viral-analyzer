import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Eye, Heart, Play, Users } from 'lucide-react';
import { useLocation } from 'wouter';

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000, start: number = 0) {
  const [count, setCount] = useState(start);
  
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
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

// Real reel thumbnail images
const reelThumbnails = [
  'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=150&fit=crop', // Social media content
  'https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=100&h=150&fit=crop', // Instagram style
  'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=100&h=150&fit=crop', // Lifestyle
];

// Compact mini video card with real thumbnail
function MiniVideoCard({ 
  views, 
  likes, 
  isViral, 
  thumbnail,
  onClick 
}: { 
  views: number; 
  likes: number; 
  isViral?: boolean;
  thumbnail: string;
  onClick: () => void;
}) {
  return (
    <motion.div 
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative bg-black/40 backdrop-blur-sm rounded-md p-1.5 border cursor-pointer transition-all ${
        isViral ? 'border-accent/50 shadow-[0_0_12px_rgba(0,255,136,0.2)]' : 'border-white/10 hover:border-white/30'
      }`}
    >
      {isViral && (
        <div className="absolute -top-1.5 -right-1.5 bg-accent text-black text-[8px] font-bold px-1 py-0.5 rounded-full z-10">
          VIRAL
        </div>
      )}
      <div className="relative w-10 h-12 sm:w-12 sm:h-14 rounded mb-1 overflow-hidden group">
        {/* Real thumbnail image */}
        <img 
          src={thumbnail} 
          alt="Reel thumbnail"
          className="w-full h-full object-cover"
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
          <motion.div
            whileHover={{ scale: 1.2 }}
            className="w-4 h-4 sm:w-5 sm:h-5 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Play className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white fill-white" />
          </motion.div>
        </div>
      </div>
      <div className="space-y-0.5">
        <div className="flex items-center gap-0.5 text-[8px] sm:text-[9px] text-white/80">
          <Eye className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
          <span>{formatNumber(views)}</span>
        </div>
        <div className="flex items-center gap-0.5 text-[8px] sm:text-[9px] text-white/80">
          <Heart className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-red-400" />
          <span>{formatNumber(likes)}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Compact growth chart
function GrowthChart() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setProgress(100), 300);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <svg width="100%" height="32" viewBox="0 0 120 32" className="overflow-visible">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(139, 92, 246)" />
          <stop offset="100%" stopColor="rgb(6, 182, 212)" />
        </linearGradient>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(139, 92, 246, 0.2)" />
          <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
        </linearGradient>
      </defs>
      <motion.path
        d="M 0 28 Q 15 26, 30 22 T 60 15 T 90 8 T 120 3 L 120 32 L 0 32 Z"
        fill="url(#areaGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      />
      <motion.path
        d="M 0 28 Q 15 26, 30 22 T 60 15 T 90 8 T 120 3"
        fill="none"
        stroke="url(#chartGradient)"
        strokeWidth="1.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: progress / 100 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      <motion.circle
        cx="120"
        cy="3"
        r="3"
        fill="rgb(6, 182, 212)"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
      />
    </svg>
  );
}

export function HeroDemo() {
  const [, setLocation] = useLocation();
  const followerCount = useAnimatedCounter(52400, 2000, 12000);
  const viewsCount = useAnimatedCounter(1250000, 2000, 250000);
  
  // Navigate to demo analysis
  const handleCardClick = () => {
    setLocation('/analysis/cristiano?demo=true');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative w-full max-w-xl mx-auto mb-4"
    >
      {/* Main container - compact */}
      <div className="relative bg-black/30 backdrop-blur-md rounded-xl border border-white/10 p-2.5 sm:p-3 overflow-hidden">
        {/* Animated gradient border */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-40"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.3), rgba(6,182,212,0.3), transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="relative z-10">
          {/* Header - compact */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              </div>
              <div>
                <div className="text-[10px] sm:text-xs font-medium text-white">@demo_account</div>
                <div className="flex items-center gap-0.5 text-[8px] sm:text-[10px] text-accent">
                  <TrendingUp className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                  <span>+340%</span>
                </div>
              </div>
            </div>
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1 text-[8px] sm:text-[10px] text-white/60"
            >
              <span className="w-1.5 h-1.5 bg-accent rounded-full" />
              Live
            </motion.div>
          </div>
          
          {/* Stats + Chart row */}
          <div className="flex gap-2 mb-2">
            {/* Stats */}
            <div className="flex-1 grid grid-cols-2 gap-1.5">
              <div className="bg-white/5 rounded-md p-1.5 sm:p-2">
                <div className="text-[8px] sm:text-[10px] text-white/60">Follower</div>
                <div className="text-sm sm:text-base font-bold text-white">{formatNumber(followerCount)}</div>
                <div className="text-[8px] sm:text-[10px] text-accent flex items-center gap-0.5">
                  <TrendingUp className="w-2 h-2" />+12.4K
                </div>
              </div>
              <div className="bg-white/5 rounded-md p-1.5 sm:p-2">
                <div className="text-[8px] sm:text-[10px] text-white/60">Views</div>
                <div className="text-sm sm:text-base font-bold text-white">{formatNumber(viewsCount)}</div>
                <div className="text-[8px] sm:text-[10px] text-accent flex items-center gap-0.5">
                  <TrendingUp className="w-2 h-2" />+890K
                </div>
              </div>
            </div>
            
            {/* Chart */}
            <div className="flex-1 bg-white/5 rounded-md p-1.5 sm:p-2">
              <div className="text-[8px] sm:text-[10px] text-white/60 mb-0.5">Wachstum</div>
              <GrowthChart />
            </div>
          </div>
          
          {/* Video cards - compact row with real thumbnails */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            <MiniVideoCard 
              views={45000} 
              likes={3200} 
              thumbnail={reelThumbnails[0]}
              onClick={handleCardClick}
            />
            <MiniVideoCard 
              views={892000} 
              likes={67000} 
              isViral 
              thumbnail={reelThumbnails[1]}
              onClick={handleCardClick}
            />
            <MiniVideoCard 
              views={128000} 
              likes={9400} 
              thumbnail={reelThumbnails[2]}
              onClick={handleCardClick}
            />
          </div>
          
          {/* Click hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-center mt-2"
          >
            <span className="text-[8px] sm:text-[10px] text-white/40">
              Klicke auf ein Video für eine Beispiel-Analyse
            </span>
          </motion.div>
        </div>
      </div>
      
      {/* Floating elements - smaller */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1 }}
        className="absolute -left-1 sm:-left-2 top-1/4 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded px-1.5 py-0.5"
      >
        <div className="flex items-center gap-0.5 text-[8px] sm:text-[10px] text-accent">
          <Heart className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-accent" />
          <span className="font-medium">+2.4K</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default HeroDemo;
