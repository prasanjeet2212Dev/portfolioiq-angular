import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { ScoringService } from '../../services/scoring.service';
import { Router } from '@angular/router';
import { Institution, Startup, Insight } from '../../models';

interface StartupWithScore extends Startup {
  score?: number;
  ir_score?: number;
  status?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  institution: Institution | null = null;
  startups: StartupWithScore[] = [];
  insights: { [key: number]: Insight } = {};
  stats = {
    total: 0,
    avgScore: 0,
    highRisk: 0,
    aboveTarget: 0
  };
  stageDistribution: { [key: string]: number } = {};
  loading = true;

  constructor(
    private supabase: SupabaseService,
    private scoring: ScoringService,
    private router: Router
  ) {}

  ngOnInit() {
    this.supabase.getCurrentInstitution().subscribe(institution => {
      this.institution = institution;
    });

    this.supabase.getStartups().subscribe(startups => {
      this.startups = startups.map(s => {
        const scores = this.scoring.calculateScores(s.data);
        return {
          ...s,
          score: scores.overall_score,
          ir_score: scores.ir_score,
          status: this.getStatus(s)
        };
      });
      this.calculateStats();
      this.loading = false;
    });
  }

  private getStatus(startup: Startup): string {
    const runway = startup.data.runway || 0;
    if (runway < 3) return 'critical';
    if (runway < 6) return 'warning';
    return 'healthy';
  }

  private calculateStats() {
    this.stats.total = this.startups.length;
    this.stats.avgScore = Math.round(
      this.startups.reduce((sum, s) => sum + (s.score || 0), 0) / (this.startups.length || 1)
    );
    this.stats.highRisk = this.startups.filter(s => s.status === 'critical' || s.status === 'warning').length;
    this.stats.aboveTarget = this.startups.filter(s => (s.score || 0) >= 70).length;

    // Stage distribution
    this.stageDistribution = {};
    this.startups.forEach(s => {
      const stage = s.data.stage || 'unknown';
      this.stageDistribution[stage] = (this.stageDistribution[stage] || 0) + 1;
    });
  }

  viewStartup(startupId: number) {
    this.router.navigate(['/startup', startupId]);
  }

  addStartup() {
    this.router.navigate(['/add-startup']);
  }

  logout() {
    this.supabase.logout();
    this.router.navigate(['/auth']);
  }

  getScoreColor(score: number): string {
    if (score >= 75) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 45) return 'score-fair';
    return 'score-poor';
  }
}
