import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { ScoringService } from '../../services/scoring.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Institution, Startup } from '../../models';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  institutions: Institution[] = [];
  startups: Startup[] = [];
  loading = true;
  
  kpis = {
    institutionCount: 0,
    startupCount: 0,
    totalMRR: 0,
    totalFunding: 0,
    avgIRScore: 0
  };
  
  institutionStats = new Map<number, { count: number; mrr: number; avgScore: number }>();

  constructor(
    private supabase: SupabaseService,
    public scoring: ScoringService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadAllData();
  }

  async loadAllData() {
    try {
      await Promise.all([
        this.loadInstitutions(),
        this.loadStartups()
      ]);
      this.calculateKPIs();
      this.calculateInstitutionStats();
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      this.loading = false;
    }
  }

  async loadInstitutions() {
    try {
      this.institutions = await this.supabase.getAllInstitutions();
      this.kpis.institutionCount = this.institutions.length;
    } catch (err) {
      console.error('Error loading institutions:', err);
    }
  }
  
  async loadStartups() {
    try {
      this.startups = await this.supabase.getAllStartupsAcrossInstitutions();
    } catch (err) {
      console.error('Error loading startups:', err);
    }
  }
  
  calculateKPIs() {
    this.kpis.startupCount = this.startups.length;
    this.kpis.totalMRR = this.startups.reduce((sum, s) => sum + (s.data.mrr || 0), 0);
    this.kpis.totalFunding = this.startups.reduce((sum, s) => sum + (s.data.revenue || 0), 0);
    
    const scores = this.startups
      .map(s => this.scoring['calculateIRScore'](s.data))
      .filter(score => score > 0);
    
    this.kpis.avgIRScore = scores.length > 0 
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;
  }
  
  calculateInstitutionStats() {
    this.institutionStats.clear();
    
    this.institutions.forEach(inst => {
      const instStartups = this.startups.filter(s => s.institution_id === inst.id);
      const mrr = instStartups.reduce((sum, s) => sum + (s.data.mrr || 0), 0);
      const scores = instStartups.map(s => this.scoring['calculateIRScore'](s.data)).filter(score => score > 0);
      const avgScore = scores.length > 0 
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0;
      
      this.institutionStats.set(inst.id, {
        count: instStartups.length,
        mrr,
        avgScore
      });
    });
  }
  
  getInstitutionStats(institutionId: number) {
    return this.institutionStats.get(institutionId) || { count: 0, mrr: 0, avgScore: 0 };
  }
  
  getInstitutionName(institutionId: number): string {
    const inst = this.institutions.find(i => i.id === institutionId);
    return inst?.name || 'Unknown';
  }
  
  getStartupIRScore(startup: Startup): number {
    return this.scoring['calculateIRScore'](startup.data);
  }

  async resetPasscode(institution: Institution) {
    const newPasscode = prompt(`Enter new passcode for ${institution.name}:`);
    if (newPasscode) {
      try {
        await this.supabase.updateInstitutionPasscode(institution.id, newPasscode);
        this.toast.success(`Passcode updated successfully for ${institution.name}`);
      } catch (err: any) {
        this.toast.error(err.message || 'Failed to update passcode');
      }
    }
  }

  async deleteInstitution(institution: Institution) {
    if (confirm(`Are you sure you want to delete ${institution.name}?`)) {
      try {
        await this.supabase.deleteInstitution(institution.id);
        await this.loadInstitutions();
        this.toast.success(`${institution.name} deleted successfully`);
      } catch (err: any) {
        this.toast.error(err.message || 'Failed to delete institution');
      }
    }
  }
}
