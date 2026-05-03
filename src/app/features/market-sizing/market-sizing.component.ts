import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { ToastService } from '../../shared/toast/toast.service';
import { Startup } from '../../models';

@Component({
  selector: 'app-market-sizing',
  templateUrl: './market-sizing.component.html',
  styleUrls: ['./market-sizing.component.css']
})
export class MarketSizingComponent implements OnInit {
  startups: Startup[] = [];
  selectedStartup: Startup | null = null;
  isSuperAdmin = false;
  
  linkToStartup = 'standalone';
  customerType = 'b2c';
  geography = 'pan-india';
  totalUniverse = '';
  digitallyReachable = '';
  willingToPay = '';
  
  dataSource = 'census';
  revenueModel = 'subscription';
  arpu = '';
  samPercentage = '';
  founderClaimTam = '';
  founderClaimSam = '';

  result: any = null;

  constructor(
    private supabase: SupabaseService,
    private toast: ToastService
  ) {}

  async ngOnInit() {
    // Check if super admin
    this.isSuperAdmin = await this.supabase.getSuperAdminStatus();
    console.log('Market Sizing - Is Super Admin:', this.isSuperAdmin);

    if (this.isSuperAdmin) {
      // Super admin: fetch all startups across institutions
      this.startups = await this.supabase.getAllStartupsAcrossInstitutions();
      console.log('Market Sizing - Loaded startups for super admin:', this.startups.length);
    } else {
      // Regular institution: subscribe to their startups
      this.supabase.getStartups().subscribe(startups => {
        this.startups = startups;
        console.log('Market Sizing - Loaded startups for institution:', this.startups.length);
      });
    }
  }

  onStartupSelected(event: any) {
    const startupId = parseInt(event.target.value);
    if (startupId && this.startups.length > 0) {
      this.selectedStartup = this.startups.find(s => s.id === startupId) || null;
      if (this.selectedStartup) {
        // Pre-fill form with startup data if available
        console.log('Selected startup:', this.selectedStartup);
      }
    } else {
      this.selectedStartup = null;
    }
  }

  calculate() {
    // Placeholder calculation
    this.result = {
      tam: '4500000',
      sam: '36',
      validation: 'Founder claims are 10× inflated'
    };
  }

  validateWithAI() {
    this.toast.info('AI validation coming soon - will analyze market size assumptions');
  }
}
