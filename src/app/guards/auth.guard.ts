import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  canActivate() {
    return combineLatest([
      this.supabase.getCurrentInstitution(),
      this.supabase.isSuperAdmin()
    ]).pipe(
      map(([institution, isSuperAdmin]) => {
        if (institution || isSuperAdmin) {
          return true;
        } else {
          this.router.navigate(['/auth']);
          return false;
        }
      })
    );
  }
}
