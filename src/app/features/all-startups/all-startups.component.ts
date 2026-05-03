import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ExportService } from '../../services/export.service';
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
  isSuperAdmin = false;

  constructor(
    private supabase: SupabaseService,
    private exportService: ExportService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadStartups();
  }

  async loadStartups() {
    this.loading = true;
    try {
      // Check if user is super admin
      this.isSuperAdmin = this.supabase.getSuperAdminStatus();
      
      if (this.isSuperAdmin) {
        // Super admin: fetch all startups across all institutions
        const allStartups = await this.supabase.getAllStartupsAcrossInstitutions();
        this.allStartups = allStartups;
        this.applyFilters();
        this.loading = false;
      } else {
        // Regular institution: subscribe to their startups
        this.supabase.getStartups().subscribe(startups => {
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
    this.filteredStartups = this.allStartups.filter(startup => {
      const data = startup.data || {};
      
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
        if (!matchesSearch) return false;
      }
      
      // Stage filter
      if (this.selectedStage !== 'all' && data['stage'] !== this.selectedStage) {
        return false;
      }
      
      // Sector filter
      if (this.selectedSector !== 'all') {
        const sector = (data['sector'] as string) || '';
        if (sector.toLowerCase() !== this.selectedSector.toLowerCase()) {
          return false;
        }
      }
      
      return true;
    });
  }

  clearFilters() {
    this.selectedStage = 'all';
    this.selectedSector = 'all';
    this.selectedScore = 'all';
    this.searchQuery = '';
    this.applyFilters();
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

  exportData() {
    this.exportService.exportToCSV(this.filteredStartups, 'startups-export.csv');
  }
}
