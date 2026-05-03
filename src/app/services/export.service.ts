import { Injectable } from '@angular/core';
import { Startup } from '../models';
import { ScoringService } from './scoring.service';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor(private scoring: ScoringService) {}

  /**
   * Export startup data to CSV format
   */
  exportToCSV(startups: Startup[], filename: string = 'startups-export.csv'): void {
    if (!startups || startups.length === 0) {
      console.warn('No startups to export');
      return;
    }

    const headers = [
      'Name', 'Sector', 'Stage', 'Overall Score', 'IR Score', 'MP Score',
      'MRR', 'Funding Raised', 'Runway (months)', 'Team Size', 'Growth Rate'
    ];

    const rows = startups.map(startup => {
      const data = startup.data as any;
      const scores = this.scoring.calculateScores(startup.data);
      
      return [
        data['name'] || 'N/A',
        data['sector'] || 'N/A',
        data['stage'] || 'N/A',
        scores.overall_score,
        scores.ir_score,
        scores.mp_score,
        data['mrr'] || 0,
        data['fundingRaised'] || 0,
        data['runway'] || 0,
        data['teamSize'] || 0,
        data['growthRate'] || 0
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape cells with commas
        if (typeof cell === 'string' && cell.includes(',')) {
          return `"${cell}"`;
        }
        return cell;
      }).join(','))
    ].join('\n');

    this.downloadFile(csvContent, filename, 'text/csv');
  }

  /**
   * Export single startup to detailed text report
   */
  exportStartupReport(startup: Startup): void {
    const data = startup.data as any;
    const scores = this.scoring.calculateScores(startup.data);

    const report = `
═══════════════════════════════════════════════════════
     STARTUP REPORT - ${data['name'] || 'Unnamed Startup'}
═══════════════════════════════════════════════════════

BASIC INFORMATION
─────────────────────────────────────────────────────
Sector:           ${data['sector'] || 'N/A'}
Stage:            ${data['stage'] || 'N/A'}
Founded:          ${data['foundedYear'] || 'N/A'}
Location:         ${data['location'] || 'N/A'}

SCORING METRICS
─────────────────────────────────────────────────────
Overall Score:    ${scores.overall_score}/100
IR Score:         ${scores.ir_score}/100
MP Score:         ${scores.mp_score}/100

FINANCIAL METRICS
─────────────────────────────────────────────────────
Monthly Revenue:  ${this.formatCurrency(data['mrr'] || 0)}
Funding Raised:   ${this.formatCurrency(data['fundingRaised'] || 0)}
Runway:           ${data['runway'] || 0} months
CAC:              ${this.formatCurrency(data['cac'] || 0)}
LTV:              ${this.formatCurrency(data['ltv'] || 0)}
LTV/CAC Ratio:    ${data['ltv'] && data['cac'] ? (data['ltv'] / data['cac']).toFixed(2) : 'N/A'}

TRACTION METRICS
─────────────────────────────────────────────────────
Total Customers:  ${data['totalCustomers'] || 'N/A'}
Paying Customers: ${data['payingCustomers'] || 'N/A'}
Growth Rate:      ${data['growthRate'] ? (data['growthRate'] * 100).toFixed(1) + '%' : 'N/A'}

TEAM INFORMATION
─────────────────────────────────────────────────────
Team Size:        ${data['teamSize'] || 'N/A'}
Founders:         ${data['founders'] || 'N/A'}
Key Roles:        ${data['keyRoles'] || 'N/A'}

MARKET INFORMATION
─────────────────────────────────────────────────────
TAM Size:         ${this.formatCurrency(data['tamSize'] || 0)}
Market Growth:    ${data['marketGrowth'] ? (data['marketGrowth'] * 100).toFixed(1) + '%' : 'N/A'}
Competition:      ${data['competition'] || 'N/A'}

PRODUCT DETAILS
─────────────────────────────────────────────────────
Description:      ${data['description'] || 'N/A'}
USP:              ${data['usp'] || 'N/A'}
Technology:       ${data['technology'] || 'N/A'}

═══════════════════════════════════════════════════════
Report generated on ${new Date().toLocaleString()}
Portfolio IQ - Intelligent Startup Portfolio Management
═══════════════════════════════════════════════════════
`;

    this.downloadFile(report.trim(), `${data['name'] || 'startup'}-report.txt`, 'text/plain');
  }

  /**
   * Export portfolio summary
   */
  exportPortfolioSummary(startups: Startup[]): void {
    const totalMRR = startups.reduce((sum, s) => {
      const data = s.data as any;
      return sum + (+(data['mrr'] || 0));
    }, 0);

    const totalFunding = startups.reduce((sum, s) => {
      const data = s.data as any;
      return sum + (+(data['fundingRaised'] || 0));
    }, 0);

    const avgScore = startups.reduce((sum, s) => {
      const scores = this.scoring.calculateScores(s.data);
      return sum + scores.overall_score;
    }, 0) / (startups.length || 1);

    const stageDistribution = this.getDistribution(startups, 'stage');
    const sectorDistribution = this.getDistribution(startups, 'sector');

    const summary = `
═══════════════════════════════════════════════════════
          PORTFOLIO SUMMARY REPORT
═══════════════════════════════════════════════════════

OVERVIEW
─────────────────────────────────────────────────────
Total Startups:   ${startups.length}
Total MRR:        ${this.formatCurrency(totalMRR)}
Total Funding:    ${this.formatCurrency(totalFunding)}
Avg Score:        ${Math.round(avgScore)}/100

STAGE DISTRIBUTION
─────────────────────────────────────────────────────
${Object.entries(stageDistribution).map(([stage, count]) => 
  `${stage.padEnd(20)} ${count} startups`).join('\n')}

SECTOR DISTRIBUTION
─────────────────────────────────────────────────────
${Object.entries(sectorDistribution).map(([sector, count]) => 
  `${sector.padEnd(20)} ${count} startups`).join('\n')}

TOP PERFORMERS (by Overall Score)
─────────────────────────────────────────────────────
${startups
  .map(s => ({
    name: (s.data as any)['name'] || 'Unnamed',
    score: this.scoring.calculateScores(s.data).overall_score
  }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 10)
  .map((s, i) => `${(i + 1).toString().padStart(2)}. ${s.name.padEnd(30)} ${s.score}/100`)
  .join('\n')}

═══════════════════════════════════════════════════════
Report generated on ${new Date().toLocaleString()}
Portfolio IQ - Intelligent Startup Portfolio Management
═══════════════════════════════════════════════════════
`;

    this.downloadFile(summary.trim(), 'portfolio-summary.txt', 'text/plain');
  }

  /**
   * Export comparison data to CSV
   */
  exportComparison(startups: Startup[]): void {
    this.exportToCSV(startups, 'startup-comparison.csv');
  }

  private getDistribution(startups: Startup[], field: string): Record<string, number> {
    const distribution: Record<string, number> = {};
    startups.forEach(startup => {
      const data = startup.data as any;
      const value = data[field] || 'Unknown';
      distribution[value] = (distribution[value] || 0) + 1;
    });
    return distribution;
  }

  private formatCurrency(amount: number): string {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    } else if (amount > 0) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return '₹0';
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
