/*
 * Design: Neo-Geometric Minimalism
 * Dashboard with KPI cards, charts, and recent analyses
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Play,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Clock,
  Zap
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Demo data for charts
const engagementData = [
  { name: 'Mo', engagement: 4.2, views: 12400 },
  { name: 'Di', engagement: 5.1, views: 15600 },
  { name: 'Mi', engagement: 4.8, views: 14200 },
  { name: 'Do', engagement: 6.2, views: 18900 },
  { name: 'Fr', engagement: 7.1, views: 22100 },
  { name: 'Sa', engagement: 8.4, views: 28500 },
  { name: 'So', engagement: 7.8, views: 25200 },
];

const contentTypeData = [
  { name: 'Reels', value: 65, color: '#3730A3' },
  { name: 'Posts', value: 25, color: '#6366F1' },
  { name: 'Stories', value: 10, color: '#F97316' },
];

const recentAnalyses = [
  { username: '@fitness_coach', followers: '125K', engagement: '8.4%', viralScore: 92, trend: 'up' },
  { username: '@travel_adventures', followers: '89K', engagement: '6.2%', viralScore: 78, trend: 'up' },
  { username: '@food_blogger', followers: '234K', engagement: '5.1%', viralScore: 65, trend: 'down' },
  { username: '@tech_reviews', followers: '56K', engagement: '9.2%', viralScore: 88, trend: 'up' },
];

export default function Dashboard() {
  const [searchUsername, setSearchUsername] = useState("");
  const [, setLocation] = useLocation();

  const handleSearch = () => {
    if (searchUsername.trim()) {
      setLocation(`/analysis?username=${encodeURIComponent(searchUsername.replace('@', ''))}`);
    }
  };

  const kpiCards = [
    { 
      title: "Durchschn. Engagement", 
      value: "6.8%", 
      change: "+1.2%", 
      trend: "up",
      icon: <Heart className="w-5 h-5" />,
      description: "vs. letzte Woche"
    },
    { 
      title: "Gesamte Views", 
      value: "1.2M", 
      change: "+15.3%", 
      trend: "up",
      icon: <Eye className="w-5 h-5" />,
      description: "letzte 7 Tage"
    },
    { 
      title: "Viral Score Ø", 
      value: "78", 
      change: "+5", 
      trend: "up",
      icon: <Zap className="w-5 h-5" />,
      description: "von 100 Punkten"
    },
    { 
      title: "Analysierte Accounts", 
      value: "24", 
      change: "+8", 
      trend: "up",
      icon: <Users className="w-5 h-5" />,
      description: "diesen Monat"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">ReelSpy.ai</span>
          </div>
          
          {/* Search Bar */}
          <div className="flex items-center gap-2 max-w-md flex-1 mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="@username analysieren..."
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Analysieren</Button>
          </div>

          <Button variant="ghost" onClick={() => setLocation("/")}>
            Zurück zur Startseite
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Übersicht deiner Instagram-Analysen und KPIs</p>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiCards.map((kpi, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="geo-card">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {kpi.icon}
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        kpi.trend === 'up' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {kpi.change}
                        {kpi.trend === 'up' ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{kpi.title}</p>
                      <p className="text-2xl font-bold font-mono">{kpi.value}</p>
                      <p className="text-xs text-muted-foreground">{kpi.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Engagement Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <Card className="geo-card h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Engagement Trend
                  </CardTitle>
                  <CardDescription>Engagement Rate der letzten 7 Tage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={engagementData}>
                        <defs>
                          <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3730A3" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3730A3" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `${v}%`} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                          formatter={(value: number) => [`${value}%`, 'Engagement']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="engagement" 
                          stroke="#3730A3" 
                          strokeWidth={2}
                          fill="url(#engagementGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Content Type Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="geo-card h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-primary" />
                    Content Verteilung
                  </CardTitle>
                  <CardDescription>Nach Content-Typ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={contentTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {contentTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number) => [`${value}%`, '']}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 mt-4">
                    {contentTypeData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Recent Analyses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="geo-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Letzte Analysen
                </CardTitle>
                <CardDescription>Deine zuletzt analysierten Accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Account</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Follower</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Engagement</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Viral Score</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Trend</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Aktion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAnalyses.map((analysis, index) => (
                        <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-medium">{analysis.username}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-sm">{analysis.followers}</td>
                          <td className="py-3 px-4 font-mono text-sm">{analysis.engagement}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              analysis.viralScore >= 80 
                                ? 'bg-green-100 text-green-800' 
                                : analysis.viralScore >= 60 
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {analysis.viralScore}/100
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {analysis.trend === 'up' ? (
                              <ArrowUpRight className="w-5 h-5 text-green-600" />
                            ) : (
                              <ArrowDownRight className="w-5 h-5 text-red-500" />
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setLocation(`/analysis?username=${analysis.username.replace('@', '')}`)}
                            >
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 grid md:grid-cols-3 gap-6"
          >
            <Card className="geo-card bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Caption Analyse</h3>
                    <p className="text-sm text-muted-foreground">Optimiere deine Texte</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="geo-card bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Play className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Reels Analyse</h3>
                    <p className="text-sm text-muted-foreground">Video Performance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="geo-card bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Viral Check</h3>
                    <p className="text-sm text-muted-foreground">Viralitäts-Potenzial</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
