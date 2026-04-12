import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ScoringService } from '../../services/scoring.service';
import { ClaudeAIService } from '../../services/claude-ai.service';
import { Startup, Insight } from '../../models';

@Component({
  selector: 'app-startup-detail',
  templateUrl: './startup-detail.component.html',
  styleUrls: ['./startup-detail.component.css']
})
export class StartupDetailComponent implements OnInit {
  startup: Startup | null = null;
  insight: Insight | null = null;
  scores = { ir_score: 0, mp_score: 0, overall_score: 0 };
  loadingAI = false;
  aiTab = 'analysis';
  showSettings = false;
  apiKey = '';
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabase: SupabaseService,
    private scoring: ScoringService,
    private claude: ClaudeAIService,
    private ai: ClaudeAIService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadStartup(id);
  }

  private loadStartup(id: number) {
    this.supabase.getStartups().subscribe(startups => {
      this.startup = startups.find(s => s.id === id) || null;
      if (this.startup) {
        this.scores = this.scoring.calculateScores(this.startup.data);
        this.loadInsight(id);
      }
    });
  }

  private loadInsight(startupId: number) {
    this.supabase.getInsight(startupId).then(insight => {
      this.insight = insight;
    });
  }

  async generateAnalysis() {
    if (!this.startup) return;
    this.loadingAI = true;
    try {
      const analysis = await this.claude.analyzeStartup(this.startup);
      this.saveInsight({ analysis });
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Failed to generate analysis'));
    } finally {
      this.loadingAI = false;
    }
  }

  async generateMarketIntel() {
    if (!this.startup) return;
    this.loadingAI = true;
    try {
      const market_intel = await this.claude.generateMarketIntel(this.startup);
      this.saveInsight({ market_intel });
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Failed to generate market intel'));
    } finally {
      this.loadingAI = false;
    }
  }

  async generateActionPlan() {
    if (!this.startup) return;
    this.loadingAI = true;
    try {
      const action_plan = await this.claude.generateActionPlan(this.startup);
      this.saveInsight({ action_plan });
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Failed to generate action plan'));
    } finally {
      this.loadingAI = false;
    }
  }

  async generateValuation() {
    if (!this.startup) return;
    this.loadingAI = true;
    try {
      const valuation = await this.claude.estimateValuation(this.startup);
      this.saveInsight({ valuation });
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Failed to estimate valuation'));
    } finally {
      this.loadingAI = false;
    }
  }

  async matchSchemes() {
    if (!this.startup) return;
    this.loadingAI = true;
    try {
      const schemes = await this.claude.matchGovernmentSchemes(this.startup);
      this.saveInsight({ schemes });
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Failed to match schemes'));
    } finally {
      this.loadingAI = false;
    }
  }

  private async saveInsight(data: any) {
    if (!this.startup) return;
    const institution = await this.supabase.getCurrentInstitution().toPromise();
    if (!institution) return;
    const updated = {
      ...this.insight?.data,
      ...data,
      ir_score: this.scores.ir_score,
      mp_score: this.scores.mp_score,
      overall_score: this.scores.overall_score
    };
    const insight = await this.supabase.saveInsight(this.startup.id, institution.id, updated);
    this.insight = insight;
  }

  setAPIKey() {
    if (this.apiKey) {
      this.claude.setAPIKey(this.apiKey);
      this.showSettings = false;
    }
  }

  deleteStartup() {
    if (this.startup && confirm('Are you sure? This cannot be undone.')) {
      this.supabase.deleteStartup(this.startup.id).then(() => {
        this.router.navigate(['/dashboard']);
      });
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  getScoreColor(score: number): string {
    if (score >= 75) return 'score-excellent';
    if (score >= 60) return 'score-good';
    if (score >= 45) return 'score-fair';
    return 'score-poor';
  }
}
