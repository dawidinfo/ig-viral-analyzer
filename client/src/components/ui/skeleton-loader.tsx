import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-muted/50",
        className
      )}
      style={style}
    />
  );
}

// Profile Header Skeleton
export function ProfileSkeleton() {
  return (
    <div className="flex items-start gap-6 p-6 rounded-2xl bg-card/50 border border-border/30">
      {/* Avatar */}
      <Skeleton className="w-24 h-24 rounded-full shrink-0" />
      
      {/* Info */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-64" />
        
        {/* Stats */}
        <div className="flex gap-8 pt-2">
          <div className="space-y-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-card/50 border border-border/30 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// Analysis Card Skeleton
export function AnalysisCardSkeleton() {
  return (
    <div className="p-6 rounded-xl bg-card/50 border border-border/30 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      
      {/* Content */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
      
      {/* Footer */}
      <div className="flex gap-4 pt-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`p-6 rounded-xl bg-card/50 border border-border/30 ${height}`}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16 rounded-lg" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      </div>
      <div className="flex items-end justify-between h-40 gap-2">
        {[...Array(12)].map((_, i) => (
          <Skeleton 
            key={i} 
            className="flex-1 rounded-t-lg" 
            style={{ height: `${Math.random() * 60 + 40}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// Reel Card Skeleton
export function ReelCardSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-card/50 border border-border/30 space-y-4">
      <Skeleton className="aspect-[9/16] w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// Full Analysis Page Skeleton
export function AnalysisPageSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Profile Header */}
      <ProfileSkeleton />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>
      
      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      
      {/* Analysis Cards */}
      <div className="space-y-6">
        <AnalysisCardSkeleton />
        <AnalysisCardSkeleton />
      </div>
      
      {/* Reels Grid */}
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ReelCardSkeleton />
          <ReelCardSkeleton />
          <ReelCardSkeleton />
          <ReelCardSkeleton />
        </div>
      </div>
    </div>
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>
      
      {/* Content */}
      <div className="grid md:grid-cols-2 gap-6">
        <AnalysisCardSkeleton />
        <AnalysisCardSkeleton />
      </div>
    </div>
  );
}
