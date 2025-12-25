import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  Play, 
  Users, 
  Brain, 
  Calendar, 
  Sparkles,
  CheckCircle2,
  Zap,
  Target,
  Clock,
  Hash,
  MessageSquare,
  BarChart3,
  FileText,
  Music,
  Scissors
} from 'lucide-react';
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

// Real creator thumbnails
const reelThumbnails = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=180&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=180&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=180&fit=crop&crop=face',
];

// Animated typing effect
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
        }
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);
  
  return <span>{displayText}<span className="animate-pulse">|</span></span>;
}

// Mini video card
function MiniVideoCard({ 
  views, 
  likes, 
  isViral, 
  thumbnail,
  onClick,
  delay = 0
}: { 
  views: number; 
  likes: number; 
  isViral?: boolean;
  thumbnail: string;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className={`relative bg-black/40 backdrop-blur-sm rounded-lg p-1.5 border cursor-pointer transition-all ${
        isViral ? 'border-accent/50 shadow-[0_0_20px_rgba(0,255,136,0.3)]' : 'border-white/10 hover:border-white/30'
      }`}
    >
      {isViral && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2, type: "spring" }}
          className="absolute -top-2 -right-2 bg-gradient-to-r from-accent to-cyan-400 text-black text-[8px] font-bold px-2 py-0.5 rounded-full z-10 shadow-lg"
        >
          🔥 VIRAL
        </motion.div>
      )}
      <div className="relative w-12 h-16 sm:w-14 sm:h-20 rounded-md mb-1.5 overflow-hidden group">
        <img 
          src={thumbnail} 
          alt="Reel thumbnail"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.div
            whileHover={{ scale: 1.2 }}
            className="w-6 h-6 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Play className="w-3 h-3 text-white fill-white" />
          </motion.div>
        </div>
        {/* Reel indicator */}
        <div className="absolute top-1 right-1 bg-black/50 rounded px-1">
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
        </div>
      </div>
      <div className="space-y-0.5">
        <div className="flex items-center gap-1 text-[9px] text-white/80">
          <Eye className="w-2.5 h-2.5" />
          <span className="font-medium">{formatNumber(views)}</span>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-white/80">
          <Heart className="w-2.5 h-2.5 text-red-400 fill-red-400" />
          <span className="font-medium">{formatNumber(likes)}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Animated growth chart
function GrowthChart() {
  return (
    <svg width="100%" height="40" viewBox="0 0 140 40" className="overflow-visible">
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(139, 92, 246)" />
          <stop offset="50%" stopColor="rgb(236, 72, 153)" />
          <stop offset="100%" stopColor="rgb(6, 182, 212)" />
        </linearGradient>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
          <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d="M 0 35 Q 20 32, 35 28 T 70 18 T 105 10 T 140 3 L 140 40 L 0 40 Z"
        fill="url(#areaGradient)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />
      <motion.path
        d="M 0 35 Q 20 32, 35 28 T 70 18 T 105 10 T 140 3"
        fill="none"
        stroke="url(#chartGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#glow)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />
      <motion.circle
        cx="140"
        cy="3"
        r="4"
        fill="rgb(6, 182, 212)"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2 }}
      >
        <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" />
      </motion.circle>
    </svg>
  );
}

// KI Analysis Preview Card
function AIAnalysisPreview() {
  const [currentStep, setCurrentStep] = useState(0);
  
  const analysisSteps = [
    { icon: <Brain className="w-3 h-3" />, label: "HAPSS-Framework", value: "94/100", color: "text-violet-400" },
    { icon: <Zap className="w-3 h-3" />, label: "Hook-Score", value: "87/100", color: "text-amber-400" },
    { icon: <Target className="w-3 h-3" />, label: "Viral-Potenzial", value: "92%", color: "text-accent" },
    { icon: <Clock className="w-3 h-3" />, label: "Beste Zeit", value: "18:00", color: "text-cyan-400" },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % analysisSteps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5 }}
      className="bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-cyan-500/20 rounded-xl p-3 border border-violet-500/30 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
          <Brain className="w-3 h-3 text-white" />
        </div>
        <span className="text-[10px] sm:text-xs font-semibold text-white">KI-Analyse läuft...</span>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="ml-auto"
        >
          <Sparkles className="w-3 h-3 text-violet-400" />
        </motion.div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {analysisSteps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0.5, scale: 0.95 }}
            animate={{ 
              opacity: currentStep === index ? 1 : 0.6,
              scale: currentStep === index ? 1 : 0.95,
              borderColor: currentStep === index ? 'rgba(139, 92, 246, 0.5)' : 'rgba(255,255,255,0.1)'
            }}
            className="bg-black/30 rounded-lg p-2 border border-white/10"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className={step.color}>{step.icon}</span>
              <span className="text-[8px] text-white/60">{step.label}</span>
            </div>
            <span className={`text-sm font-bold ${step.color}`}>{step.value}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Content Plan Preview Card
function ContentPlanPreview() {
  const [activeDay, setActiveDay] = useState(1);
  
  const contentDays = [
    { day: 1, topic: "Hook-Masterclass", framework: "HAPSS", time: "18:00" },
    { day: 2, topic: "Pain Point Story", framework: "AIDA", time: "19:00" },
    { day: 3, topic: "Transformation", framework: "HAPSS", time: "12:00" },
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDay((prev) => (prev % 3) + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2 }}
      className="bg-gradient-to-br from-pink-500/20 via-orange-500/10 to-amber-500/20 rounded-xl p-3 border border-pink-500/30 backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
          <Calendar className="w-3 h-3 text-white" />
        </div>
        <span className="text-[10px] sm:text-xs font-semibold text-white">30-Tage Content-Plan</span>
        <span className="ml-auto text-[8px] bg-pink-500/30 text-pink-300 px-1.5 py-0.5 rounded-full">PRO</span>
      </div>
      
      <div className="space-y-1.5">
        {contentDays.map((item) => (
          <motion.div
            key={item.day}
            animate={{ 
              opacity: activeDay === item.day ? 1 : 0.5,
              x: activeDay === item.day ? 4 : 0,
              backgroundColor: activeDay === item.day ? 'rgba(236, 72, 153, 0.2)' : 'rgba(0,0,0,0.2)'
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg border border-white/5"
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
              activeDay === item.day ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/60'
            }`}>
              {item.day}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-medium text-white truncate">{item.topic}</div>
              <div className="flex items-center gap-2 text-[8px] text-white/50">
                <span className="bg-violet-500/30 text-violet-300 px-1 rounded">{item.framework}</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-2 h-2" />{item.time}
                </span>
              </div>
            </div>
            {activeDay === item.day && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-accent"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Feature Pills
function FeaturePills() {
  const features = [
    { icon: <Brain className="w-3 h-3" />, label: "3.000+ KI-Parameter" },
    { icon: <Hash className="w-3 h-3" />, label: "Hashtag-Analyse" },
    { icon: <Music className="w-3 h-3" />, label: "Trending Audio" },
    { icon: <Scissors className="w-3 h-3" />, label: "Schnitt-Tipps" },
    { icon: <FileText className="w-3 h-3" />, label: "PDF-Export" },
    { icon: <BarChart3 className="w-3 h-3" />, label: "Wachstums-Tracking" },
  ];
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5 }}
      className="flex flex-wrap justify-center gap-1.5 mt-3"
    >
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2.5 + index * 0.1 }}
          whileHover={{ scale: 1.05, y: -2 }}
          className="flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] text-white/70 hover:bg-white/10 hover:text-white transition-all cursor-default"
        >
          {feature.icon}
          <span>{feature.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function HeroDemo() {
  const [, setLocation] = useLocation();
  const followerCount = useAnimatedCounter(52400, 2000, 12000);
  const viewsCount = useAnimatedCounter(1250000, 2000, 250000);
  
  const handleCardClick = () => {
    setLocation('/analysis/cristiano?demo=true');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative w-full max-w-3xl mx-auto mb-6"
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-pink-500/20 to-cyan-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
      
      {/* Main container */}
      <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 p-3 sm:p-4 overflow-hidden">
        {/* Animated gradient border */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(236,72,153,0.4), rgba(6,182,212,0.4), transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 flex items-center justify-center p-0.5"
              >
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
              </motion.div>
              <div>
                <div className="text-xs sm:text-sm font-semibold text-white">@demo_account</div>
                <div className="flex items-center gap-1 text-[10px] text-accent">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-medium">+340% Wachstum</span>
                </div>
              </div>
            </div>
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1.5 px-2 py-1 bg-accent/20 rounded-full"
            >
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-[10px] text-accent font-medium">Live Analyse</span>
            </motion.div>
          </div>
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Left Column - Stats & Videos */}
            <div className="space-y-3">
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-2">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 rounded-xl p-2.5 border border-white/10"
                >
                  <div className="text-[10px] text-white/60 mb-0.5">Follower</div>
                  <div className="text-lg sm:text-xl font-bold text-white">{formatNumber(followerCount)}</div>
                  <div className="text-[10px] text-accent flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5" />
                    <span>+12.4K diese Woche</span>
                  </div>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 rounded-xl p-2.5 border border-white/10"
                >
                  <div className="text-[10px] text-white/60 mb-0.5">Views</div>
                  <div className="text-lg sm:text-xl font-bold text-white">{formatNumber(viewsCount)}</div>
                  <div className="text-[10px] text-accent flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5" />
                    <span>+890K diese Woche</span>
                  </div>
                </motion.div>
              </div>
              
              {/* Growth Chart */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-white/5 rounded-xl p-2.5 border border-white/10"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white/60">Wachstumskurve</span>
                  <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">+340%</span>
                </div>
                <GrowthChart />
              </motion.div>
              
              {/* Video Cards */}
              <div className="flex items-center justify-center gap-2">
                <MiniVideoCard 
                  views={45000} 
                  likes={3200} 
                  thumbnail={reelThumbnails[0]}
                  onClick={handleCardClick}
                  delay={0.5}
                />
                <MiniVideoCard 
                  views={892000} 
                  likes={67000} 
                  isViral 
                  thumbnail={reelThumbnails[1]}
                  onClick={handleCardClick}
                  delay={0.7}
                />
                <MiniVideoCard 
                  views={128000} 
                  likes={9400} 
                  thumbnail={reelThumbnails[2]}
                  onClick={handleCardClick}
                  delay={0.9}
                />
              </div>
            </div>
            
            {/* Right Column - AI Analysis & Content Plan */}
            <div className="space-y-3">
              <AIAnalysisPreview />
              <ContentPlanPreview />
            </div>
          </div>
          
          {/* Feature Pills */}
          <FeaturePills />
          
          {/* Click hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="text-center mt-3"
          >
            <span className="text-[9px] sm:text-[10px] text-white/40">
              ✨ Klicke auf ein Video für die vollständige KI-Analyse
            </span>
          </motion.div>
        </div>
      </div>
      
      {/* Floating elements */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute -left-2 sm:-left-4 top-1/4 bg-gradient-to-r from-accent/30 to-cyan-500/30 backdrop-blur-sm border border-accent/40 rounded-lg px-2 py-1 shadow-lg"
      >
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-accent font-medium">
          <Heart className="w-3 h-3 fill-accent" />
          <span>+2.4K Likes</span>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.4 }}
        className="absolute -right-2 sm:-right-4 top-1/3 bg-gradient-to-r from-violet-500/30 to-pink-500/30 backdrop-blur-sm border border-violet-500/40 rounded-lg px-2 py-1 shadow-lg"
      >
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-violet-300 font-medium">
          <MessageSquare className="w-3 h-3" />
          <span>+847 Comments</span>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 }}
        className="absolute -bottom-2 left-1/4 bg-gradient-to-r from-pink-500/30 to-orange-500/30 backdrop-blur-sm border border-pink-500/40 rounded-lg px-2 py-1 shadow-lg"
      >
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-pink-300 font-medium">
          <Eye className="w-3 h-3" />
          <span>892K Views</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default HeroDemo;
