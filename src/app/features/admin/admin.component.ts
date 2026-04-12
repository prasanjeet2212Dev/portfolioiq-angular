import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Institution } from '../../models';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  institutions: Institution[] = [];
  loading = true;

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {
    this.loadInstitutions();
  }

  async loadInstitutions() {
    try {
      this.institutions = await this.supabase.getAllInstitutions();
    } catch (err) {
      console.error('Error loading institutions:', err);
    } finally {
      this.loading = false;
    }
  }

  async resetPasscode(institution: Institution) {
    const newPasscode = prompt(`Enter new passcode for ${institution.name}:`);
    if (newPasscode) {
      try {
        await this.supabase.updateInstitutionPasscode(institution.id, newPasscode);
        alert('Passcode updated successfully');
      } catch (err: any) {
        alert('Error: ' + (err.message || 'Failed to update passcode'));
      }
    }
  }

  async deleteInstitution(institution: Institution) {
    if (confirm(`Are you sure you want to delete ${institution.name}?`)) {
      try {
        await this.supabase.deleteInstitution(institution.id);
        await this.loadInstitutions();
        alert('Institution deleted successfully');
      } catch (err: any) {
        alert('Error: ' + (err.message || 'Failed to delete institution'));
      }
    }
  }
}
