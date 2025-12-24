import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  TrendingUp, 
  Eye, 
  Heart, 
  BarChart3,
  Play,
  ArrowRight,
  Check,
  X
} from "lucide-react";

/**
 * Design-Vergleichsseite: Aktuelles Design vs. Premium Design
 * Zeigt beide Varianten nebeneinander für A/B-Entscheidung
 */
export default function DesignCompare() {
  const [activeView, setActiveView] = useState<'split' | 'current' | 'premium'>('split');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Design-Vergleich</h1>
        <p className="text-gray-400 mb-6">Wähle zwischen dem aktuellen und dem neuen Premium-Design</p>
        
        {/* View Toggle */}
        <div className="inline-flex gap-2 p-1 bg-gray-800/50 rounded-lg">
          <button
            onClick={() => setActiveView('split')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === 'split' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Split-View
          </button>
          <button
            onClick={() => setActiveView('current')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === 'current' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Aktuell
          </button>
          <button
            onClick={() => setActiveView('premium')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeView === 'premium' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Premium
          </button>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className={`grid gap-8 ${activeView === 'split' ? 'md:grid-cols-2' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
        
        {/* CURRENT DESIGN */}
        {(activeView === 'split' || activeView === 'current') && (
          <div className="space-y-6">
            <div className="text-center">
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 mb-2">
                Aktuelles Design
              </Badge>
              <p className="text-sm text-gray-500">Neon & Grell</p>
            </div>

            {/* Current: Hero Card */}
            <div 
              className="p-6 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.3), 0 0 60px rgba(6, 182, 212, 0.2)'
              }}
            >
              <h3 className="text-xl font-bold mb-2" style={{
                background: 'linear-gradient(90deg, #a855f7, #06b6d4, #10b981)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                KI-Analyse starten
              </h3>
              <p className="text-gray-300 text-sm mb-4">Analysiere jeden Instagram-Account</p>
              <Button 
                className="w-full"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
                  boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)'
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Jetzt analysieren
              </Button>
            </div>

            {/* Current: Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div 
                className="p-4 rounded-lg text-center"
                style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.5)',
                  boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)'
                }}
              >
                <Eye className="w-5 h-5 mx-auto mb-1" style={{ color: '#a855f7' }} />
                <div className="text-lg font-bold" style={{ color: '#a855f7' }}>1.3M</div>
                <div className="text-xs text-gray-400">Views</div>
              </div>
              <div 
                className="p-4 rounded-lg text-center"
                style={{
                  background: 'rgba(6, 182, 212, 0.2)',
                  border: '1px solid rgba(6, 182, 212, 0.5)',
                  boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)'
                }}
              >
                <Heart className="w-5 h-5 mx-auto mb-1" style={{ color: '#06b6d4' }} />
                <div className="text-lg font-bold" style={{ color: '#06b6d4' }}>52.4K</div>
                <div className="text-xs text-gray-400">Likes</div>
              </div>
              <div 
                className="p-4 rounded-lg text-center"
                style={{
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)'
                }}
              >
                <TrendingUp className="w-5 h-5 mx-auto mb-1" style={{ color: '#10b981' }} />
                <div className="text-lg font-bold" style={{ color: '#10b981' }}>+340%</div>
                <div className="text-xs text-gray-400">Growth</div>
              </div>
            </div>

            {/* Current: Chart Bars */}
            <div 
              className="p-4 rounded-lg"
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)'
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4" style={{ color: '#a855f7' }} />
                <span className="text-sm font-medium">Performance</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-full h-6 bg-gray-800 rounded overflow-hidden">
                    <div 
                      className="h-full rounded"
                      style={{ 
                        width: '85%', 
                        background: 'linear-gradient(90deg, #a855f7, #06b6d4)',
                        boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)'
                      }} 
                    />
                  </div>
                  <span className="text-xs w-10" style={{ color: '#a855f7' }}>85%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full h-6 bg-gray-800 rounded overflow-hidden">
                    <div 
                      className="h-full rounded"
                      style={{ 
                        width: '72%', 
                        background: 'linear-gradient(90deg, #06b6d4, #10b981)',
                        boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)'
                      }} 
                    />
                  </div>
                  <span className="text-xs w-10" style={{ color: '#06b6d4' }}>72%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full h-6 bg-gray-800 rounded overflow-hidden">
                    <div 
                      className="h-full rounded"
                      style={{ 
                        width: '93%', 
                        background: 'linear-gradient(90deg, #10b981, #a855f7)',
                        boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                      }} 
                    />
                  </div>
                  <span className="text-xs w-10" style={{ color: '#10b981' }}>93%</span>
                </div>
              </div>
            </div>

            {/* Current: Pros/Cons */}
            <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
              <h4 className="font-medium mb-3 text-sm">Eigenschaften</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-4 h-4" />
                  <span>Auffällig, zieht Blicke</span>
                </div>
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="w-4 h-4" />
                  <span>Modern, trendy Look</span>
                </div>
                <div className="flex items-center gap-2 text-red-400">
                  <X className="w-4 h-4" />
                  <span>Kann billig wirken</span>
                </div>
                <div className="flex items-center gap-2 text-red-400">
                  <X className="w-4 h-4" />
                  <span>Zu viel visuelle Konkurrenz</span>
                </div>
                <div className="flex items-center gap-2 text-red-400">
                  <X className="w-4 h-4" />
                  <span>Ermüdend bei längerem Nutzen</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PREMIUM DESIGN */}
        {(activeView === 'split' || activeView === 'premium') && (
          <div className="space-y-6">
            <div className="text-center">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 mb-2">
                Premium Design
              </Badge>
              <p className="text-sm text-gray-500">Sophistiziert & Elegant</p>
            </div>

            {/* Premium: Hero Card */}
            <div 
              className="p-6 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(100, 100, 120, 0.08) 0%, rgba(80, 80, 100, 0.05) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
              }}
            >
              <h3 className="text-xl font-bold mb-2 text-white">
                KI-Analyse starten
              </h3>
              <p className="text-gray-400 text-sm mb-4">Analysiere jeden Instagram-Account</p>
              <Button 
                className="w-full text-white"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  boxShadow: '0 2px 12px rgba(99, 102, 241, 0.25)'
                }}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Jetzt analysieren
              </Button>
            </div>

            {/* Premium: Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div 
                className="p-4 rounded-lg text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <Eye className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <div className="text-lg font-bold text-white">1.3M</div>
                <div className="text-xs text-gray-500">Views</div>
              </div>
              <div 
                className="p-4 rounded-lg text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <Heart className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                <div className="text-lg font-bold text-white">52.4K</div>
                <div className="text-xs text-gray-500">Likes</div>
              </div>
              <div 
                className="p-4 rounded-lg text-center"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <TrendingUp className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
                <div className="text-lg font-bold text-emerald-500">+340%</div>
                <div className="text-xs text-gray-500">Growth</div>
              </div>
            </div>

            {/* Premium: Chart Bars */}
            <div 
              className="p-4 rounded-lg"
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-300">Performance</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Engagement</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: '85%', 
                        background: '#6366f1'
                      }} 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Reichweite</span>
                    <span>72%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: '72%', 
                        background: '#8b5cf6'
                      }} 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Viral Score</span>
                    <span>93%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: '93%', 
                        background: '#10b981'
                      }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Premium: Pros/Cons */}
            <div className="p-4 rounded-lg" style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h4 className="font-medium mb-3 text-sm text-gray-300">Eigenschaften</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span>Professionell & vertrauenswürdig</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span>Angenehm für die Augen</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span>Fokus auf Inhalt, nicht Effekte</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span>Wie Notion, Linear, Stripe</span>
                </div>
                <div className="flex items-center gap-2 text-amber-400">
                  <span className="w-4 h-4 text-center">~</span>
                  <span>Weniger "wow" auf den ersten Blick</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decision Section */}
      <div className="mt-12 text-center max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Welches Design bevorzugst du?</h2>
        <p className="text-gray-400 text-sm mb-6">
          Das Premium-Design folgt den Prinzipien von Apple, Stripe und Linear - 
          weniger ist mehr, Fokus auf Inhalt und Lesbarkeit statt Effekte.
        </p>
        <div className="flex gap-4 justify-center">
          <Button 
            variant="outline" 
            className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
            onClick={() => window.history.back()}
          >
            Aktuelles behalten
          </Button>
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => {
              // Hier würde die Umstellung auf Premium-Design erfolgen
              alert('Premium-Design wird aktiviert! (Demo)');
            }}
          >
            Premium aktivieren
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
