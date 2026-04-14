import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ScoringService } from '../../services/scoring.service';
import { Startup } from '../../models';

interface ComparisonStartup {
  id: number;
  name: string;
  sector: string;
  stage: string;
  ir_score: number;
  mp_score: number;
  overall_score: number;
  mrr: number;
  runway: number;
  teamSize: number;
  growth: number;
}

@Component({
  selector: 'app-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.css']
})
export class ComparisonComponent implements OnInit {
  allStartups: Startup[] = [];
  selectedIds: number[] = [];
  comparisonData: ComparisonStartup[] = [];
  maxSelections = 4;
  isSuperAdmin = false;
  loading = true;

  constructor(
    private supabase: SupabaseService,
    private scoring: ScoringService,
    private router: Router
  ) {}

  ngOnInit() {
    this.checkAdminStatus();
    this.loadStartups();
  }

  checkAdminStatus() {
    this.isSuperAdmin = this.supabase.getSuperAdminStatus();
    console.log('Comparison: Is Super Admin =', this.isSuperAdmin);
    console.log('Comparison: Session flags =', {
      piq_super_admin: sessionStorage.getItem('piq_super_admin'),
      session: sessionStorage.getItem('session')
    });
  }

  async loadStartups() {
    try {
      if (this.isSuperAdmin) {
        console.log('Loading all startups across institutions...');
        this.allStartups = await this.supabase.getAllStartupsAcrossInstitutions();
        console.log('Loaded', this.allStartups.length, 'startups');
        this.loading = false;
      } else {
        console.log('Loading institution startups...');
        this.supabase.getStartups().subscribe({
          next: (startups) => {
            this.allStartups = startups;
            console.log('Loaded', startups.length, 'startups');
            this.loading = false;
          },
          error: (err) => {
            console.error('Error loading startups:', err);
            this.loading = false;
          }
        });
      }
    } catch (err) {
      console.error('Error loading startups:', err);
      this.loading = false;
    }
  }

  toggleStartup(id: number) {
    const index = this.selectedIds.indexOf(id);
    if (index > -1) {
      this.selectedIds.splice(index, 1);
    } else {
      if (this.selectedIds.length < this.maxSelections) {
        this.selectedIds.push(id);
      }
    }
    this.updateComparison();
  }

  isSelected(id: number): boolean {
    return this.selectedIds.includes(id);
  }

  canSelect(): boolean {
    return this.selectedIds.length < this.maxSelections;
  }

  updateComparison() {
    this.comparisonData = this.selectedIds
      .map(id => this.allStartups.find(s => s.id === id))
      .filter((s): s is Startup => s !== undefined)
      .map(startup => {
        const data = startup.data as any;
        const scores = this.scoring.calculateScores(startup.data);
        return {
          id: startup.id,
          name: data['name'] || 'Unnamed',
          sector: data['sector'] || 'Unknown',
          stage: data['stage'] || 'Unknown',
          ir_score: scores.ir_score,
          mp_score: scores.mp_score,
          overall_score: scores.overall_score,
          mrr: +(data['mrr'] || 0),
          runway: +(data['runway'] || 0),
          teamSize: +(data['teamSize'] || 0),
          growth: +(data['growthRate'] || 0)
        };
      });
  }

  clearAll() {
    this.selectedIds = [];
    this.comparisonData = [];
  }

  viewStartup(id: number) {
    this.router.navigate(['/startup', id]);
  }

  getScoreClass(score: number): string {
    if (score >= 70) return 'score-high';
    if (score >= 40) return 'score-medium';
    return 'score-low';
  }

  getBestInCategory(category: keyof ComparisonStartup): number {
    if (this.comparisonData.length === 0) return 0;
    const values = this.comparisonData.map(s => {
      const val = s[category];
      return typeof val === 'number' ? val : 0;
    });
    return Math.max(...values);
  }

  isBest(startup: ComparisonStartup, category: keyof ComparisonStartup): boolean {
    const value = startup[category];
    if (typeof value !== 'number') return false;
    return value === this.getBestInCategory(category) && value > 0;
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

  getStartupName(startup: Startup): string {
    const data = startup.data as any;
    return data['name'] || 'Unnamed';
  }

  getStartupSector(startup: Startup): string {
    const data = startup.data as any;
    return data['sector'] || 'Unknown';
  }

  getStartupStage(startup: Startup): string {
    const data = startup.data as any;
    return data['stage'] || 'Unknown';
  }

  getSessionInfo(): string {
    return sessionStorage.getItem('session') || 'No session';
  }
}
