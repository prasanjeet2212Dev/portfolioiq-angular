import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ScoringService } from '../../services/scoring.service';
import { AIService } from '../../services/ai.service';
import { ExportService } from '../../services/export.service';
import { ToastService } from '../../shared/toast/toast.service';
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
  Math = Math;
  parseFloat = parseFloat;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabase: SupabaseService,
    private scoring: ScoringService,
    private ai: AIService,
    private exportService: ExportService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.loadStartup(id);
  }

  private async loadStartup(id: number) {
    const isSuperAdmin = this.supabase.getSuperAdminStatus();
    
    if (isSuperAdmin) {
      // Super admin: fetch all startups
      const allStartups = await this.supabase.getAllStartupsAcrossInstitutions();
      this.startup = allStartups.find(s => s.id === id) || null;
      if (this.startup) {
        this.scores = this.scoring.calculateScores(this.startup.data);
        this.loadInsight(id);
      }
    } else {
      // Regular institution
      this.supabase.getStartups().subscribe(startups => {
        this.startup = startups.find(s => s.id === id) || null;
        if (this.startup) {
          this.scores = this.scoring.calculateScores(this.startup.data);
          this.loadInsight(id);
        }
      });
    }
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
      const analysis = await this.ai.analyzeStartup(this.startup);
      this.saveInsight({ analysis });
      this.toast.success('Analysis generated successfully');
    } catch (err: any) {
      this.toast.error(err.message || 'Failed to generate analysis');
    } finally {
      this.loadingAI = false;
    }
  }

  async generateMarketIntel() {
    if (!this.startup) return;
    this.loadingAI = true;
    try {
      const market_intel = await this.ai.generateMarketIntel(this.startup);
      this.saveInsight({ market_intel });
      this.toast.success('Market intelligence generated successfully');
    } catch (err: any) {
      this.toast.error(err.message || 'Failed to generate market intel');
    } finally {
      this.loadingAI = false;
    }
  }

  async generateActionPlan() {
    if (!this.startup) return;
    this.loadingAI = true;
    try {
      const action_plan = await this.ai.generateActionPlan(this.startup);
      this.saveInsight({ action_plan });
      this.toast.success('Action plan generated successfully');
    } catch (err: any) {
      this.toast.error(err.message || 'Failed to generate action plan');
    } finally {
      this.loadingAI = false;
    }
  }

  async generateValuation() {
    if (!this.startup) return;
    this.loadingAI = true;
    try {
      const valuation = await this.ai.estimateValuation(this.startup);
      this.saveInsight({ valuation });
      this.toast.success('Valuation estimate generated successfully');
    } catch (err: any) {
      this.toast.error(err.message || 'Failed to estimate valuation');
    } finally {
      this.loadingAI = false;
    }
  }

  async matchSchemes() {
    if (!this.startup) return;
    this.loadingAI = true;
    try {
      const schemes = await this.ai.matchGovernmentSchemes(this.startup);
      this.saveInsight({ schemes });
      this.toast.success(`Matched ${schemes.length} government schemes`);
    } catch (err: any) {
      this.toast.error(err.message || 'Failed to match schemes');
    } finally {
      this.loadingAI = false;
    }
  }

  private async saveInsight(data: any) {
    if (!this.startup) return;
    
    // For super admin, use startup's institution_id
    let institutionId: number;
    const isSuperAdmin = this.supabase.getSuperAdminStatus();
    
    if (isSuperAdmin) {
      institutionId = this.startup.institution_id;
      console.log('Super admin - using startup institution_id:', institutionId);
    } else {
      const institution = await this.supabase.getCurrentInstitution().toPromise();
      if (!institution) {
        console.error('No institution found for regular user');
        this.toast.error('Unable to save insight - no institution found');
        return;
      }
      institutionId = institution.id;
    }
    
    const updated = {
      ...this.insight?.data,
      ...data,
      ir_score: this.scores.ir_score,
      mp_score: this.scores.mp_score,
      overall_score: this.scores.overall_score
    };
    
    console.log('Saving insight for startup:', this.startup.id, 'institution:', institutionId);
    
    try {
      const insight = await this.supabase.saveInsight(this.startup.id, institutionId, updated);
      this.insight = insight;
      console.log('Insight saved successfully:', insight);
    } catch (err) {
      console.error('Error saving insight:', err);
      this.toast.error('Error saving insight: ' + (err as any).message);
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

  getGrowthWidth(): number {
    if (!this.startup || !this.startup.data['growthRate']) return 0;
    const growth = parseFloat(this.startup.data['growthRate'] as any) || 0;
    return Math.min(growth, 100);
  }

  getTeamSizeWidth(): number {
    if (!this.startup || !this.startup.data['teamSize']) return 0;
    const teamSize = parseInt(this.startup.data['teamSize'] as any, 10) || 0;
    return Math.min(teamSize * 5, 100);
  }

  exportReport() {
    if (this.startup) {
      this.exportService.exportStartupReport(this.startup);
    }
  }
}
