import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { ClaudeAIService } from '../../services/claude-ai.service';
import { Startup } from '../../models';

@Component({
  selector: 'app-govt-schemes',
  templateUrl: './govt-schemes.component.html',
  styleUrls: ['./govt-schemes.component.css']
})
export class GovtSchemesComponent implements OnInit {
  startups: Startup[] = [];
  selectedStartup: Startup | null = null;
  isSuperAdmin = false;

  // Form fields
  startupName = '';
  sector = '';
  stage = '';
  state = '';
  founderCategory = 'general';
  institutionType = 'private-incubator';
  dpitRegistration = 'yes';
  companyRegistration = 'pvt-ltd';
  annualRevenue = 'no-revenue';
  techInnovation = 'yes';
  socialRuralImpact = 'yes';
  grantsReceived = 'none';

  matchedSchemes: any[] = [];
  loading = false;

  sectors = ['Select...', 'AgriTech', 'FinTech', 'HealthTech', 'EdTech', 'E-Commerce', 'SaaS', 'CleanTech', 'Other'];
  stages = ['Select...', 'Idea', 'MVP', 'Early Traction', 'Growth', 'Scale'];
  states = ['Select state...', 'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Other'];

  constructor(
    private supabase: SupabaseService,
    private claude: ClaudeAIService
  ) {}

  async ngOnInit() {
    // Check if super admin
    this.isSuperAdmin = await this.supabase.getSuperAdminStatus();
    console.log('Govt Schemes - Is Super Admin:', this.isSuperAdmin);

    if (this.isSuperAdmin) {
      // Super admin: fetch all startups across institutions
      this.startups = await this.supabase.getAllStartupsAcrossInstitutions();
      console.log('Govt Schemes - Loaded startups for super admin:', this.startups.length);
    } else {
      // Regular institution: subscribe to their startups
      this.supabase.getStartups().subscribe(startups => {
        this.startups = startups;
        console.log('Govt Schemes - Loaded startups for institution:', this.startups.length);
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
  }

  async findSchemes() {
    if (!this.startupName || !this.sector || !this.stage) {
      alert('Please fill in at least Startup Name, Sector, and Stage');
      return;
    }

    this.loading = true;
    this.matchedSchemes = [];

    try {
      // Create a temporary startup object for the API call
      const tempStartup: Startup = {
        id: 0,
        institution_id: 0,
        data: {
          name: this.startupName,
          sector: this.sector,
          stage: this.stage,
          city: this.state,
          revenue: 0,
          team_size: 0,
          funding_raised: 0,
          runway: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const schemes = await this.claude.matchGovernmentSchemes(tempStartup);
      this.matchedSchemes = Array.isArray(schemes) ? schemes : [];
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Failed to match schemes'));
    } finally {
      this.loading = false;
    }
  }
}
