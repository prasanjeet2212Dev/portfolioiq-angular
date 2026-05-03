import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ToastService } from '../../shared/toast/toast.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-add-startup',
  templateUrl: './add-startup.component.html',
  styleUrls: ['./add-startup.component.css']
})
export class AddStartupComponent {
  // Stage selection
  selectedStage = '';

  // About the Startup
  name = '';
  whatTheyDo = '';
  problemSolving = '';
  sector = '';
  targetCustomer = '';
  founderNames = '';
  founderBackground = '';
  city = '';
  yearStarted = '';
  website = '';
  teamSize = '';

  // Progress & Traction
  revenue = '';
  mrr = '';
  growthRate = '';
  runway = '';

  // Funding
  fundsRaisedSoFar = '';
  currentlyRaising = '';
  targetAmountToRaise = '';
  totalAmountRaised = '';

  // Market
  marketOpportunity = '';
  mainCompetitors = '';
  mainAdvantage = '';
  geographyFocus = '';

  // Program Manager Assessment
  cohortBatch = '';
  programType = '';
  priorityLevel = '';
  nextReviewDate = '';
  mentorDomainNeeded = '';
  aiTasksToRun = '';
  keyActionThisMonth = '';
  internalNotes = '';

  // Government Scheme Eligibility
  dpitRecognition = '';
  grantsReceived = '';
  womanFounder = '';
  patents = '';

  // Current Status Note
  statusNote = '';
  overallHealth = '';
  engagementWithIncubator = '';
  programManagerNotes = '';

  error = '';
  loading = false;

  // Section expansion states
  sections = {
    about: true,
    progress: false,
    funding: false,
    market: false,
    assessment: false,
    govtSchemes: false,
    statusNote: false
  };

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private toast: ToastService
  ) {}

  toggleSection(section: keyof typeof this.sections) {
    this.sections[section] = !this.sections[section];
  }

  selectStage(stage: string) {
    this.selectedStage = stage;
  }

  async addStartup() {
    console.log('addStartup() called');
    
    if (!this.name || !this.sector) {
      this.error = 'Please fill in at least Startup Name and Sector';
      console.error('Validation failed:', { name: this.name, sector: this.sector });
      return;
    }

    this.loading = true;
    this.error = '';
    
    try {
      console.log('Getting current institution...');
      const institution = await firstValueFrom(this.supabase.getCurrentInstitution());
      console.log('Current institution:', institution);
      
      if (!institution) {
        throw new Error('Not logged in - institution is null');
      }

      const startupData = {
        name: this.name,
        whatTheyDo: this.whatTheyDo,
        problemSolving: this.problemSolving,
        sector: this.sector,
        targetCustomer: this.targetCustomer,
        founderNames: this.founderNames,
        founderBackground: this.founderBackground,
        stage: this.selectedStage || 'idea',
        city: this.city,
        yearStarted: this.yearStarted,
        website: this.website,
        teamSize: parseInt(this.teamSize) || 0,
        revenue: parseInt(this.revenue) || 0,
        mrr: parseInt(this.mrr) || 0,
        growthRate: this.growthRate,
        runway: parseInt(this.runway) || 0,
        fundsRaisedSoFar: this.fundsRaisedSoFar,
        currentlyRaising: this.currentlyRaising,
        targetAmountToRaise: this.targetAmountToRaise,
        totalAmountRaised: parseInt(this.totalAmountRaised) || 0,
        marketOpportunity: this.marketOpportunity,
        mainCompetitors: this.mainCompetitors,
        mainAdvantage: this.mainAdvantage,
        geographyFocus: this.geographyFocus,
        cohortBatch: this.cohortBatch,
        programType: this.programType,
        priorityLevel: this.priorityLevel,
        nextReviewDate: this.nextReviewDate,
        mentorDomainNeeded: this.mentorDomainNeeded,
        aiTasksToRun: this.aiTasksToRun,
        keyActionThisMonth: this.keyActionThisMonth,
        internalNotes: this.internalNotes,
        dpitRecognition: this.dpitRecognition,
        grantsReceived: this.grantsReceived,
        womanFounder: this.womanFounder,
        patents: this.patents,
        statusNote: this.statusNote,
        overallHealth: this.overallHealth,
        engagementWithIncubator: this.engagementWithIncubator,
        programManagerNotes: this.programManagerNotes
      };

      console.log('Saving startup data:', startupData);
      await this.supabase.addStartup(institution.id, startupData);
      console.log('Startup saved successfully');
      
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      console.error('Error adding startup:', err);
      this.error = err.message || 'Failed to add startup';
    } finally {
      this.loading = false;
    }
  }

  reset() {
    if (confirm('Are you sure you want to reset the form?')) {
      this.selectedStage = '';
      this.name = '';
      this.whatTheyDo = '';
      this.sector = '';
      this.toast.info('Form reset successfully');
      // Reset other fields as needed
    }
  }
}
