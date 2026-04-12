import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Institution } from '../../models';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  institution: Institution | null = null;
  currentDate = new Date();
  startupCount = 0;
  isSuperAdmin = false;

  constructor(
    private router: Router,
    private supabase: SupabaseService
  ) {}

  ngOnInit() {
    this.supabase.getCurrentInstitution().subscribe(institution => {
      this.institution = institution;
    });
    
    this.supabase.isSuperAdmin().subscribe(async isAdmin => {
      this.isSuperAdmin = isAdmin;
      
      if (isAdmin) {
        // Super admin: get count from all institutions
        const allStartups = await this.supabase.getAllStartupsAcrossInstitutions();
        this.startupCount = allStartups.length;
      } else {
        // Regular institution: subscribe to their startups
        this.supabase.getStartups().subscribe(startups => {
          this.startupCount = startups.length;
        });
      }
    });
  }

  logout() {
    this.supabase.logout();
    this.router.navigate(['/auth']);
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
}
