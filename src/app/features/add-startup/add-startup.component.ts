import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-add-startup',
  templateUrl: './add-startup.component.html',
  styleUrls: ['./add-startup.component.css']
})
export class AddStartupComponent {
  name = '';
  sector = '';
  stage = 'seed';
  city = '';
  teamSize = '';
  revenue = '';
  runway = '';
  mrr = '';
  growthRate = '';
  error = '';
  loading = false;

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async addStartup() {
    if (!this.name || !this.sector || !this.city) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    try {
      const institution = await this.supabase.getCurrentInstitution().toPromise();
      if (!institution) throw new Error('Not logged in');

      const startupData = {
        name: this.name,
        sector: this.sector,
        stage: this.stage,
        city: this.city,
        team_size: parseInt(this.teamSize) || 0,
        revenue: parseInt(this.revenue) || 0,
        runway: parseInt(this.runway) || 0,
        mrr: parseInt(this.mrr) || 0,
        growth_rate: parseFloat(this.growthRate) || 0
      };

      await this.supabase.addStartup(institution.id, startupData);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = err.message || 'Failed to add startup';
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
