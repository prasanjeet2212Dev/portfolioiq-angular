import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { AIService } from '../../services/ai.service';
import { ToastService } from '../toast/toast.service';
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
  
  // Settings panel
  showSettings = false;
  githubToken = '';

  constructor(
    private router: Router,
    private supabase: SupabaseService,
    private ai: AIService,
    private toast: ToastService
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

  toggleSettings() {
    this.showSettings = !this.showSettings;
    if (this.showSettings) {
      // Load existing token from localStorage if available
      this.githubToken = localStorage.getItem('piq_ai_key') || '';
    }
  }

  saveGitHubToken() {
    if (!this.githubToken.trim()) {
      this.toast.warning('Please enter a GitHub token');
      return;
    }

    if (!this.githubToken.startsWith('ghp_')) {
      this.toast.warning('Invalid token format. GitHub tokens start with ghp_');
      return;
    }

    this.ai.setAPIKey(this.githubToken);
    this.toast.success('GitHub token saved successfully! AI features enabled.');
    this.showSettings = false;
  }

  clearGitHubToken() {
    this.githubToken = '';
    localStorage.removeItem('piq_ai_key');
    this.toast.info('GitHub token cleared. AI features disabled.');
  }
}
