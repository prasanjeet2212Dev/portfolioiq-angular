import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Startup } from '../../models';

@Component({
  selector: 'app-all-startups',
  templateUrl: './all-startups.component.html',
  styleUrls: ['./all-startups.component.css']
})
export class AllStartupsComponent implements OnInit {
  selectedStage = 'all';
  selectedSector = 'all';
  selectedScore = 'all';
  searchQuery = '';
  
  allStartups: Startup[] = [];
  filteredStartups: Startup[] = [];
  loading = true;

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStartups();
  }

  async loadStartups() {
    this.loading = true;
    try {
      // Check if user is super admin
      const isSuperAdmin = this.supabase.getSuperAdminStatus();
      console.log('Is super admin?', isSuperAdmin);
      
      if (isSuperAdmin) {
        // Super admin: fetch all startups across all institutions
        console.log('Fetching all startups for super admin...');
        const allStartups = await this.supabase.getAllStartupsAcrossInstitutions();
        console.log('All startups (super admin):', allStartups);
        this.allStartups = allStartups;
        this.applyFilters();
        this.loading = false;
      } else {
        // Regular institution: subscribe to their startups
        console.log('Fetching startups for institution...');
        this.supabase.getStartups().subscribe(startups => {
          console.log('Loaded startups (institution):', startups);
          this.allStartups = startups;
          this.applyFilters();
          this.loading = false;
        });
      }
    } catch (err) {
      console.error('Error loading startups:', err);
      this.loading = false;
    }
  }

  applyFilters() {
    console.log('Applying filters...');
    console.log('All startups:', this.allStartups);
    console.log('Selected stage:', this.selectedStage);
    console.log('Selected sector:', this.selectedSector);
    console.log('Search query:', this.searchQuery);
    
    this.filteredStartups = this.allStartups.filter(startup => {
      console.log('Filtering startup:', startup);
      const data = startup.data || {};
      console.log('Startup data:', data);
      
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const name = (data['name'] as string) || '';
        const sector = (data['sector'] as string) || '';
        const founderNames = (data['founderNames'] as string) || '';
        
        const matchesSearch = 
          name.toLowerCase().includes(query) ||
          sector.toLowerCase().includes(query) ||
          founderNames.toLowerCase().includes(query);
        if (!matchesSearch) {
          console.log('Filtered out by search');
          return false;
        }
      }
      
      // Stage filter
      if (this.selectedStage !== 'all' && data['stage'] !== this.selectedStage) {
        console.log('Filtered out by stage:', data['stage'], 'vs', this.selectedStage);
        return false;
      }
      
      // Sector filter
      if (this.selectedSector !== 'all') {
        const sector = (data['sector'] as string) || '';
        if (sector.toLowerCase() !== this.selectedSector.toLowerCase()) {
          console.log('Filtered out by sector:', sector, 'vs', this.selectedSector);
          return false;
        }
      }
      
      console.log('Startup passed all filters');
      return true;
    });
    
    console.log('Filtered startups count:', this.filteredStartups.length);
    console.log('Filtered startups:', this.filteredStartups);
  }

  onSearchChange() {
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  viewStartup(startup: Startup) {
    this.router.navigate(['/startup', startup.id]);
  }

  getIRScore(startup: Startup): number {
    // Placeholder - implement actual scoring logic
    return 0;
  }

  getScoreClass(score: number): string {
    if (score >= 70) return 'score-good';
    if (score >= 40) return 'score-medium';
    return 'score-poor';
  }
}
