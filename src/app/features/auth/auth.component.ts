import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  activeTab = 'login';
  loginSlug = '';
  loginPass = '';
  regName = '';
  regSlug = '';
  regCity = '';
  regPass = '';
  error = '';
  loading = false;

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  switchTab(tab: string) {
    this.activeTab = tab;
    this.error = '';
  }

  sanitizeSlug(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9-]/g, '');
  }

  onRegSlugChange() {
    this.regSlug = this.sanitizeSlug(this.regSlug);
  }

  async doLogin() {
    if (!this.loginSlug || !this.loginPass) {
      this.error = 'Please fill in all fields';
      return;
    }

    this.loading = true;
    this.error = '';
    
    try {
      // Check for super admin login
      if (this.loginSlug.toLowerCase().trim() === 'adminsuper') {
        console.log('Attempting super admin login...');
        const success = await this.supabase.loginSuperAdmin(this.loginPass);
        if (success) {
          console.log('Super admin login successful');
          this.router.navigate(['/admin']);
        } else {
          console.log('Super admin login failed - wrong password');
          this.error = 'Invalid super admin password. Use: SuperAdmin@2026';
        }
      } else {
        // Regular institution login
        console.log('Attempting institution login for:', this.loginSlug);
        await this.supabase.login(this.loginSlug, this.loginPass);
        this.router.navigate(['/dashboard']);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      this.error = err.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }

  async doRegister() {
    if (!this.regName || !this.regSlug || !this.regPass) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    try {
      await this.supabase.register(this.regName, this.regSlug, this.regCity, this.regPass);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error = err.message || 'Registration failed';
    } finally {
      this.loading = false;
    }
  }
}

