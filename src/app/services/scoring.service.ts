import { Injectable } from '@angular/core';
import { StartupData } from '../models';

interface ScoringResult {
  ir_score: number;
  mp_score: number;
  overall_score: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScoringService {
  calculateScores(startup: StartupData): ScoringResult {
    const ir_score = this.calculateIRScore(startup);
    const mp_score = this.calculateMPScore(startup);
    const overall_score = Math.round(ir_score * 0.55 + mp_score * 0.45);

    return { ir_score, mp_score, overall_score };
  }

  private calculateIRScore(startup: StartupData): number {
    let score = 0;

    // Revenue (0-25 pts)
    const revenue = startup.revenue || 0;
    if (revenue > 10000000) score += 25;
    else if (revenue > 5000000) score += 20;
    else if (revenue > 1000000) score += 15;
    else if (revenue > 100000) score += 10;
    else if (revenue > 0) score += 5;

    // Runway (0-18 pts)
    const runway = startup.runway || 0;
    if (runway > 24) score += 18;
    else if (runway > 18) score += 15;
    else if (runway > 12) score += 12;
    else if (runway > 6) score += 8;
    else if (runway > 0) score += 4;

    // MoM Growth (0-20 pts)
    const growth = startup.growth_rate || 0;
    if (growth > 0.15) score += 20;
    else if (growth > 0.10) score += 15;
    else if (growth > 0.05) score += 10;
    else if (growth > 0.02) score += 5;

    // Team Size (0-12 pts)
    const teamSize = startup.team_size || 0;
    if (teamSize > 20) score += 12;
    else if (teamSize > 10) score += 10;
    else if (teamSize > 5) score += 7;
    else if (teamSize > 2) score += 4;
    else if (teamSize > 0) score += 2;

    // Funding Stage (0-15 pts)
    const fundingStage = startup.funding_stage || '';
    const stages: { [key: string]: number } = {
      'series-c+': 15,
      'series-c': 14,
      'series-b': 12,
      'series-a': 10,
      'seed': 6,
      'pre-seed': 3
    };
    score += stages[fundingStage.toLowerCase()] || 0;

    // LTV/CAC Ratio (0-10 pts)
    const ltvCac = startup.ltv_cac_ratio || 0;
    if (ltvCac > 3) score += 10;
    else if (ltvCac > 2) score += 8;
    else if (ltvCac > 1) score += 5;
    else if (ltvCac > 0) score += 2;

    return Math.min(score, 100);
  }

  private calculateMPScore(startup: StartupData): number {
    let score = 0;

    // TAM Size (0-35 pts)
    const tam = startup.tam || 0;
    if (tam > 10000000000) score += 35;
    else if (tam > 1000000000) score += 28;
    else if (tam > 100000000) score += 20;
    else if (tam > 10000000) score += 12;
    else if (tam > 0) score += 5;

    // Market Growth (0-25 pts)
    const marketGrowth = startup.market_growth || 0;
    if (marketGrowth > 0.30) score += 25;
    else if (marketGrowth > 0.20) score += 20;
    else if (marketGrowth > 0.10) score += 15;
    else if (marketGrowth > 0.05) score += 10;
    else if (marketGrowth > 0) score += 5;

    // Competitive Moat (0-25 pts)
    const moat = startup.competitive_moat || '';
    const moatScores: { [key: string]: number } = {
      'network-effect': 25,
      'brand': 22,
      'switching-cost': 20,
      'scale-economy': 18,
      'patent': 15,
      'technology': 12,
      'none': 0
    };
    score += moatScores[moat.toLowerCase()] || 8;

    // Customer Traction (0-15 pts)
    const traction = startup.customer_traction || 0;
    if (traction > 100000) score += 15;
    else if (traction > 10000) score += 12;
    else if (traction > 1000) score += 10;
    else if (traction > 100) score += 6;
    else if (traction > 0) score += 3;

    return Math.min(score, 100);
  }
}
