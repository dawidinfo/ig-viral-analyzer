import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ProfileData {
  username: string;
  fullName: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isVerified: boolean;
  isBusinessAccount: boolean;
}

interface MetricsData {
  avgLikes: number;
  avgComments: number;
  avgViews: number;
  avgShares: number;
  avgSaves: number;
  engagementRate: number;
}

interface ViralFactors {
  hook: number;
  emotion: number;
  shareability: number;
  replay: number;
  caption: number;
  hashtags: number;
}

interface AnalysisData {
  profile: ProfileData;
  metrics: MetricsData;
  viralScore: number;
  viralFactors: ViralFactors;
  isDemo: boolean;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export async function generateAnalysisPDF(data: AnalysisData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [139, 92, 246]; // Purple
  const accentColor: [number, number, number] = [6, 182, 212]; // Cyan
  const darkBg: [number, number, number] = [15, 15, 25];
  const textColor: [number, number, number] = [255, 255, 255];
  const mutedColor: [number, number, number] = [156, 163, 175];

  // Background
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

  // Header with gradient effect (simulated)
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ReelSpy.ai', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Instagram Analytics Report', 20, 35);
  
  // Date
  const date = new Date().toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(date, pageWidth - 20, 25, { align: 'right' });
  
  // Demo badge if applicable
  if (data.isDemo) {
    doc.setFillColor(245, 158, 11);
    doc.roundedRect(pageWidth - 50, 30, 35, 8, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text('Demo-Daten', pageWidth - 32.5, 35.5, { align: 'center' });
  }

  let yPos = 60;

  // Profile Section
  doc.setTextColor(...textColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`@${data.profile.username}`, 20, yPos);
  
  if (data.profile.isVerified) {
    doc.setFillColor(59, 130, 246);
    doc.circle(20 + doc.getTextWidth(`@${data.profile.username}`) + 8, yPos - 3, 4, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.text('✓', 20 + doc.getTextWidth(`@${data.profile.username}`) + 6, yPos - 1.5);
  }
  
  yPos += 8;
  doc.setTextColor(...mutedColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(data.profile.fullName || data.profile.username, 20, yPos);
  
  // Viral Score Circle (simulated)
  const scoreX = pageWidth - 40;
  const scoreY = 70;
  
  // Score background
  doc.setDrawColor(...mutedColor);
  doc.setLineWidth(3);
  doc.circle(scoreX, scoreY, 18, 'S');
  
  // Score arc (simplified)
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(3);
  doc.circle(scoreX, scoreY, 18, 'S');
  
  // Score text
  doc.setTextColor(...accentColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.viralScore.toString(), scoreX, scoreY + 2, { align: 'center' });
  
  doc.setTextColor(...mutedColor);
  doc.setFontSize(8);
  doc.text('Viral Score', scoreX, scoreY + 12, { align: 'center' });

  yPos += 15;

  // Stats Row
  const statsData = [
    { label: 'Follower', value: formatNumber(data.profile.followerCount) },
    { label: 'Following', value: formatNumber(data.profile.followingCount) },
    { label: 'Posts', value: formatNumber(data.profile.postCount) },
    { label: 'Engagement', value: `${data.metrics.engagementRate.toFixed(2)}%` }
  ];
  
  const statWidth = (pageWidth - 40) / 4;
  statsData.forEach((stat, index) => {
    const x = 20 + (index * statWidth);
    
    doc.setTextColor(...primaryColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.value, x + statWidth/2, yPos, { align: 'center' });
    
    doc.setTextColor(...mutedColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(stat.label, x + statWidth/2, yPos + 8, { align: 'center' });
  });

  yPos += 25;

  // Divider
  doc.setDrawColor(50, 50, 70);
  doc.setLineWidth(0.5);
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  yPos += 15;

  // Metrics Section
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance-Metriken', 20, yPos);
  
  yPos += 10;

  // Metrics Table
  const metricsTableData = [
    ['Durchschn. Likes', formatNumber(data.metrics.avgLikes)],
    ['Durchschn. Kommentare', formatNumber(data.metrics.avgComments)],
    ['Durchschn. Views', formatNumber(data.metrics.avgViews)],
    ['Durchschn. Shares', formatNumber(data.metrics.avgShares)],
    ['Durchschn. Saves', formatNumber(data.metrics.avgSaves)],
    ['Engagement Rate', `${data.metrics.engagementRate.toFixed(2)}%`]
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metrik', 'Wert']],
    body: metricsTableData,
    theme: 'plain',
    styles: {
      fillColor: [25, 25, 40],
      textColor: [255, 255, 255],
      fontSize: 10,
      cellPadding: 5
    },
    headStyles: {
      fillColor: [139, 92, 246],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [35, 35, 55]
    },
    margin: { left: 20, right: 20 }
  });

  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  // Viral Factors Section
  doc.setTextColor(...textColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Viral-Faktoren Analyse', 20, yPos);
  
  yPos += 10;

  const viralFactorsData = [
    ['Hook-Stärke', `${data.viralFactors.hook}/100`],
    ['Emotionale Wirkung', `${data.viralFactors.emotion}/100`],
    ['Teilbarkeit', `${data.viralFactors.shareability}/100`],
    ['Replay-Wert', `${data.viralFactors.replay}/100`],
    ['Caption-Qualität', `${data.viralFactors.caption}/100`],
    ['Hashtag-Strategie', `${data.viralFactors.hashtags}/100`]
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Faktor', 'Bewertung']],
    body: viralFactorsData,
    theme: 'plain',
    styles: {
      fillColor: [25, 25, 40],
      textColor: [255, 255, 255],
      fontSize: 10,
      cellPadding: 5
    },
    headStyles: {
      fillColor: [6, 182, 212],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [35, 35, 55]
    },
    margin: { left: 20, right: 20 }
  });

  yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 15;

  // Recommendations Section
  if (yPos < 240) {
    doc.setTextColor(...textColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Empfehlungen', 20, yPos);
    
    yPos += 10;
    
    const recommendations = getRecommendations(data);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    recommendations.forEach((rec, index) => {
      if (yPos < 270) {
        doc.setTextColor(...accentColor);
        doc.text('•', 20, yPos);
        doc.setTextColor(...mutedColor);
        doc.text(rec, 28, yPos);
        yPos += 8;
      }
    });
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setDrawColor(50, 50, 70);
  doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);
  
  doc.setTextColor(...mutedColor);
  doc.setFontSize(8);
  doc.text('Erstellt mit ReelSpy.ai - Instagram Analytics & Viral Score', pageWidth / 2, footerY, { align: 'center' });
  doc.text('© 2024 ReelSpy.ai', pageWidth / 2, footerY + 5, { align: 'center' });

  // Save the PDF
  doc.save(`reelspy-analyse-${data.profile.username}-${new Date().toISOString().split('T')[0]}.pdf`);
}

function getRecommendations(data: AnalysisData): string[] {
  const recommendations: string[] = [];
  
  if (data.metrics.engagementRate < 2) {
    recommendations.push('Engagement-Rate verbessern durch mehr interaktive Inhalte');
  }
  if (data.viralFactors.hook < 70) {
    recommendations.push('Stärkere Hooks in den ersten 3 Sekunden einsetzen');
  }
  if (data.viralFactors.emotion < 70) {
    recommendations.push('Mehr emotionale Elemente in den Content einbauen');
  }
  if (data.viralFactors.shareability < 70) {
    recommendations.push('Content teilbarer gestalten mit klaren CTAs');
  }
  if (data.viralScore < 60) {
    recommendations.push('Viral-Potenzial durch Trend-Analyse erhöhen');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Weiter so! Dein Content performt überdurchschnittlich gut.');
  }
  
  return recommendations.slice(0, 5);
}

export default generateAnalysisPDF;
