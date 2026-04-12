import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ScoringService } from '../../services/scoring.service';
import { Startup } from '../../models';

interface DashboardKPIs {
  totalMRR: number;
  totalFunding: number;
  avgIRScore: number;
  avgRunway: number;
  criticalRunway: number;
  startupCount: number;
}

interface StageDistribution {
  [key: string]: number;
}

interface SectorDistribution {
  [key: string]: number;
}

interface TopStartup {
  id: number;
  name: string;
  sector: string;
  stage: string;
  ir_score: number;
}

interface NeedsAttentionItem {
  id: number;
  name: string;
  tags: string[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  startups: Startup[] = [];
  kpis: DashboardKPIs = {
    totalMRR: 0,
    totalFunding: 0,
    avgIRScore: 0,
    avgRunway: 0,
    criticalRunway: 0,
    startupCount: 0
  };
  stageDistribution: StageDistribution = {};
  sectorDistribution: SectorDistribution = {};
  topStartups: TopStartup[] = [];
  needsAttention: NeedsAttentionItem[] = [];
  loading = true;

  constructor(
    private supabase: SupabaseService,
    private scoring: ScoringService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    
    try {
      // Check if user is super admin
      const isSuperAdmin = this.supabase.getSuperAdminStatus();
      console.log('Dashboard - Is super admin?', isSuperAdmin);
      
      if (isSuperAdmin) {
        // Super admin: fetch all startups across all institutions
        console.log('Dashboard - Fetching all startups for super admin...');
        const allStartups = await this.supabase.getAllStartupsAcrossInstitutions();
        console.log('Dashboard - All startups (super admin):', allStartups);
        this.startups = allStartups;
        this.calculateKPIs();
        this.calculateDistributions();
        this.calculateTopStartups();
        this.calculateNeedsAttention();
        this.loading = false;
      } else {
        // Regular institution: subscribe to their startups
        console.log('Dashboard - Fetching startups for institution...');
        this.supabase.getStartups().subscribe(startups => {
          console.log('Dashboard - Loaded startups (institution):', startups);
          this.startups = startups;
          this.calculateKPIs();
          this.calculateDistributions();
          this.calculateTopStartups();
          this.calculateNeedsAttention();
          this.loading = false;
        });
      }
    } catch (err) {
      console.error('Dashboard - Error loading startups:', err);
      this.loading = false;
    }
  }

  private calculateKPIs() {
    let totalMRR = 0;
    let totalFunding = 0;
    let totalIRScore = 0;
    let totalRunway = 0;
    let criticalRunway = 0;

    this.startups.forEach(startup => {
      const data = startup.data as any;
      const mrr = +(data['mrr'] || 0);
      const funding = +(data['fundingRaised'] || 0);
      const runway = +(data['runway'] || 0);

      totalMRR += mrr;
      totalFunding += funding;
      totalRunway += runway;

      if (runway <= 3) {
        criticalRunway++;
      }

      // Calculate IR score for this startup
      const scores = this.scoring.calculateScores(startup.data);
      totalIRScore += scores.ir_score;
    });

    this.kpis = {
      totalMRR,
      totalFunding,
      avgIRScore: this.startups.length > 0 ? Math.round(totalIRScore / this.startups.length) : 0,
      avgRunway: this.startups.length > 0 ? Math.round(totalRunway / this.startups.length) : 0,
      criticalRunway,
      startupCount: this.startups.length
    };
  }

  private calculateDistributions() {
    this.stageDistribution = {};
    this.sectorDistribution = {};

    this.startups.forEach(startup => {
      const data = startup.data as any;
      const stage = data['stage'] || 'Unknown';
      const sector = data['sector'] || 'Unknown';

      this.stageDistribution[stage] = (this.stageDistribution[stage] || 0) + 1;
      this.sectorDistribution[sector] = (this.sectorDistribution[sector] || 0) + 1;
    });
  }

  private calculateTopStartups() {
    const startupsWithScores = this.startups.map(startup => {
      const data = startup.data as any;
      const scores = this.scoring.calculateScores(startup.data);
      return {
        id: startup.id,
        name: data['name'] || 'Unnamed',
        sector: data['sector'] || 'Unknown',
        stage: data['stage'] || 'Unknown',
        ir_score: scores.ir_score
      };
    });

    this.topStartups = startupsWithScores
      .sort((a, b) => b.ir_score - a.ir_score)
      .slice(0, 5);
  }

  private calculateNeedsAttention() {
    this.needsAttention = [];

    this.startups.forEach(startup => {
      const data = startup.data as any;
      const tags: string[] = [];
      const runway = +(data['runway'] || 0);
      const mrr = +(data['mrr'] || 0);
      const scores = this.scoring.calculateScores(startup.data);

      if (runway <= 3) {
        tags.push('Critical runway');
      } else if (runway <= 6) {
        tags.push('Low runway');
      }

      if (mrr === 0) {
        tags.push('No revenue');
      }

      if (scores.ir_score < 30) {
        tags.push('Low IR score');
      }

      if (scores.mp_score < 30) {
        tags.push('Market potential');
      }

      if (tags.length > 0) {
        this.needsAttention.push({
          id: startup.id,
          name: data['name'] || 'Unnamed',
          tags
        });
      }
    });
  }

  getStageEntries(): { label: string; count: number; percentage: number }[] {
    const total = this.kpis.startupCount;
    if (total === 0) return [];

    return Object.entries(this.stageDistribution).map(([label, count]) => ({
      label,
      count,
      percentage: (count / total) * 100
    }));
  }

  getSectorEntries(): { label: string; count: number; percentage: number }[] {
    const total = this.kpis.startupCount;
    if (total === 0) return [];

    return Object.entries(this.sectorDistribution)
      .map(([label, count]) => ({      label,
        count,
        percentage: (count / total)  * 100
      }))
      .sort((a, b) => b.count - a.count);
  }

  getScoreClass(score: number): string {
    if (score >= 70) return 'score-good';
    if (score >= 40) return 'score-medium';
    return 'score-poor';
  }

  viewStartup(id: number) {
    this.router.navigate(['/startup', id]);
  }

  formatCurrency(amount: number): string {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount > 0) {
      return `₹${Math.round(amount / 1000)}K`;
    }
    return '₹0';
  }
}
