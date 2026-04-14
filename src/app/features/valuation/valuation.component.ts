import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { ClaudeAIService } from '../../services/claude-ai.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Startup } from '../../models';

@Component({
  selector: 'app-valuation',
  templateUrl: './valuation.component.html',
  styleUrls: ['./valuation.component.css']
})
export class ValuationComponent implements OnInit {
  startups: Startup[] = [];
  selectedStartup: Startup | null = null;
  isSuperAdmin = false;

  // Form fields
  startupName = '';
  sector = '';
  stage = '';
  city = '';
  monthlyRevenue = '';
  revenueGrowth = 'no-revenue';
  totalCustomers = '';
  grossMargin = 'unknown';
  founderBackground = 'first-time';
  intellectualProperty = 'none';
  fundingRaised = 'bootstrapped';
  currentFundingRound = 'pre-seed';
  keyAchievements = '';

  valuationResult = '';
  loading = false;

  sectors = ['Select...', 'AgriTech', 'FinTech', 'HealthTech', 'EdTech', 'E-Commerce', 'SaaS', 'CleanTech', 'Other'];
  stages = ['Select...', 'Idea', 'MVP', 'Early Traction', 'Growth', 'Scale'];

  constructor(
    private supabase: SupabaseService,
    private claude: ClaudeAIService,
    private toast: ToastService
  ) {}

  async ngOnInit() {
    // Check if super admin
    this.isSuperAdmin = await this.supabase.getSuperAdminStatus();
    console.log('Valuation - Is Super Admin:', this.isSuperAdmin);

    if (this.isSuperAdmin) {
      // Super admin: fetch all startups across institutions
      this.startups = await this.supabase.getAllStartupsAcrossInstitutions();
      console.log('Valuation - Loaded startups for super admin:', this.startups.length);
    } else {
      // Regular institution: subscribe to their startups
      this.supabase.getStartups().subscribe(startups => {
        this.startups = startups;
        console.log('Valuation - Loaded startups for institution:', this.startups.length);
      });
    }
  }

  onStartupSelected(event: any) {
    const startupId = parseInt(event.target.value);
    if (startupId && this.startups.length > 0) {
      this.selectedStartup = this.startups.find(s => s.id === startupId) || null;
      if (this.selectedStartup) {
        this.loadStartupData(this.selectedStartup);
      }
    }
  }

  loadStartupData(startup: Startup) {
    this.startupName = startup.data['name'] || '';
    this.sector = startup.data['sector'] || '';
    this.stage = startup.data['stage'] || '';
    this.city = startup.data['city'] || '';
    this.monthlyRevenue = startup.data['mrr'] ? (startup.data['mrr'] / 100000).toString() : '';
  }

  async estimateValuation() {
    if (!this.startupName || !this.sector || !this.stage) {
      this.toast.warning('Please fill in at least Startup Name, Sector, and Stage');
      return;
    }

    this.loading = true;
    this.valuationResult = '';

    try {
      // Create a temporary startup object for the API call
      const tempStartup: Startup = {
        id: 0,
        institution_id: 0,
        data: {
          name: this.startupName,
          sector: this.sector,
          stage: this.stage,
          city: this.city,
          revenue: this.monthlyRevenue ? parseFloat(this.monthlyRevenue) * 100000 : 0,
          team_size: 0,
          funding_raised: this.fundingRaised === 'bootstrapped' ? 0 : 0,
          runway: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await this.claude.estimateValuation(tempStartup);
      this.valuationResult = result;
      this.toast.success(`Valuation estimate generated for ${this.startupName}`);
    } catch (err: any) {
      this.toast.error(err.message || 'Failed to estimate valuation');
    } finally {
      this.loading = false;
    }
  }
}
