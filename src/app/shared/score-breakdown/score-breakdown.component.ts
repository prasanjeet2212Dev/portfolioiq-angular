import { Component, Input, OnInit } from '@angular/core';
import { StartupData } from '../../models';

interface ScoreFactor {
  label: string;
  value: number;
  maxPoints: number;
  points: number;
}

@Component({
  selector: 'app-score-breakdown',
  templateUrl: './score-breakdown.component.html',
  styleUrls: ['./score-breakdown.component.css']
})
export class ScoreBreakdownComponent implements OnInit {
  @Input() startupData!: StartupData;
  @Input() scoreType: 'ir' | 'mp' = 'ir';

  irFactors: ScoreFactor[] = [];
  mpFactors: ScoreFactor[] = [];

  ngOnInit() {
    if (this.scoreType === 'ir') {
      this.calculateIRFactors();
    } else {
      this.calculateMPFactors();
    }
  }

  private calculateIRFactors() {
    const data = this.startupData;
    
    // Revenue (0-25 pts)
    const revenue = data.revenue || 0;
    let revenuePoints = 0;
    if (revenue > 10000000) revenuePoints = 25;
    else if (revenue > 5000000) revenuePoints = 20;
    else if (revenue > 1000000) revenuePoints = 15;
    else if (revenue > 100000) revenuePoints = 10;
    else if (revenue > 0) revenuePoints = 5;

    // Runway (0-18 pts)
    const runway = data.runway || 0;
    let runwayPoints = 0;
    if (runway > 24) runwayPoints = 18;
    else if (runway > 18) runwayPoints = 15;
    else if (runway > 12) runwayPoints = 12;
    else if (runway > 6) runwayPoints = 8;
    else if (runway > 0) runwayPoints = 4;

    // Growth Rate (0-20 pts)
    const growth = data.growth_rate || 0;
    let growthPoints = 0;
    if (growth > 0.15) growthPoints = 20;
    else if (growth > 0.10) growthPoints = 15;
    else if (growth > 0.05) growthPoints = 10;
    else if (growth > 0.02) growthPoints = 5;

    // Team Size (0-12 pts)
    const teamSize = data.team_size || 0;
    let teamPoints = 0;
    if (teamSize > 20) teamPoints = 12;
    else if (teamSize > 10) teamPoints = 10;
    else if (teamSize > 5) teamPoints = 7;
    else if (teamSize > 2) teamPoints = 4;
    else if (teamSize > 0) teamPoints = 2;

    // Funding Stage (0-15 pts)
    const fundingStage = data.funding_stage || '';
    const stages: { [key: string]: number } = {
      'series-c+': 15, 'series-c': 14, 'series-b': 12,
      'series-a': 10, 'seed': 6, 'pre-seed': 3
    };
    const stagePoints = stages[fundingStage.toLowerCase()] || 0;

    // LTV/CAC (0-10 pts)
    const ltvCac = data.ltv_cac_ratio || 0;
    let ltvCacPoints = 0;
    if (ltvCac > 3) ltvCacPoints = 10;
    else if (ltvCac > 2) ltvCacPoints = 8;
    else if (ltvCac > 1) ltvCacPoints = 5;
    else if (ltvCac > 0) ltvCacPoints = 2;

    this.irFactors = [
      { label: 'Monthly Revenue', value: revenue, maxPoints: 25, points: revenuePoints },
      { label: 'Runway (months)', value: runway, maxPoints: 18, points: runwayPoints },
      { label: 'MoM Growth Rate', value: growth * 100, maxPoints: 20, points: growthPoints },
      { label: 'Team Size', value: teamSize, maxPoints: 12, points: teamPoints },
      { label: 'Funding Stage', value: 0, maxPoints: 15, points: stagePoints },
      { label: 'LTV/CAC Ratio', value: ltvCac, maxPoints: 10, points: ltvCacPoints }
    ];
  }

  private calculateMPFactors() {
    const data = this.startupData;

    // TAM Size (0-35 pts)
    const tam = data.tam || 0;
    let tamPoints = 0;
    if (tam > 10000000000) tamPoints = 35;
    else if (tam > 1000000000) tamPoints = 28;
    else if (tam > 100000000) tamPoints = 20;
    else if (tam > 10000000) tamPoints = 12;
    else if (tam > 0) tamPoints = 5;

    // Market Growth (0-25 pts)
    const marketGrowth = data.market_growth || 0;
    let marketGrowthPoints = 0;
    if (marketGrowth > 0.30) marketGrowthPoints = 25;
    else if (marketGrowth > 0.20) marketGrowthPoints = 20;
    else if (marketGrowth > 0.10) marketGrowthPoints = 15;
    else if (marketGrowth > 0.05) marketGrowthPoints = 10;
    else if (marketGrowth > 0) marketGrowthPoints = 5;

    // Competitive Moat (0-25 pts)
    const moat = data.competitive_moat || '';
    const moatScores: { [key: string]: number } = {
      'network-effect': 25, 'brand': 22, 'switching-cost': 20,
      'scale-economy': 18, 'patent': 15, 'technology': 12, 'none': 0
    };
    const moatPoints = moatScores[moat.toLowerCase()] || 8;

    // Customer Traction (0-15 pts)
    const traction = data.customer_traction || 0;
    let tractionPoints = 0;
    if (traction > 100000) tractionPoints = 15;
    else if (traction > 10000) tractionPoints = 12;
    else if (traction > 1000) tractionPoints = 10;
    else if (traction > 100) tractionPoints = 6;
    else if (traction > 0) tractionPoints = 3;

    this.mpFactors = [
      { label: 'TAM Size', value: tam, maxPoints: 35, points: tamPoints },
      { label: 'Market Growth', value: marketGrowth * 100, maxPoints: 25, points: marketGrowthPoints },
      { label: 'Competitive Moat', value: 0, maxPoints: 25, points: moatPoints },
      { label: 'Customer Traction', value: traction, maxPoints: 15, points: tractionPoints }
    ];
  }

  getFactors(): ScoreFactor[] {
    return this.scoreType === 'ir' ? this.irFactors : this.mpFactors;
  }

  getTotalScore(): number {
    return this.getFactors().reduce((sum, factor) => sum + factor.points, 0);
  }

  getTotalMaxPoints(): number {
    return this.getFactors().reduce((sum, factor) => sum + factor.maxPoints, 0);
  }

  getPercentage(factor: ScoreFactor): number {
    return factor.maxPoints > 0 ? (factor.points / factor.maxPoints) * 100 : 0;
  }

  formatNumber(num: number): string {
    if (num >= 10000000) {
      return (num / 10000000).toFixed(1) + 'Cr';
    } else if (num >= 100000) {
      return (num / 100000).toFixed(1) + 'L';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
}
