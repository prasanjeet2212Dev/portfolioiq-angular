import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { Institution, Startup, Insight } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private sb: SupabaseClient | null = null;
  private currentInstitution$ = new BehaviorSubject<Institution | null>(null);
  private startups$ = new BehaviorSubject<Startup[]>([]);
  private realtimeChannel: any = null;

  constructor() {
    this.initSupabase();
    this.restoreSession();
  }

  private initSupabase() {
    const config = JSON.parse(localStorage.getItem('piq_config') || '{}');
    const url = config.url || 'https://eejwbapeabedzvtknjad.supabase.co';
    const key = config.key || 'sb_publishable_dZXEzlt_Ztwsa6hARg-Lzg_iyeGbbYi';

    if (url && key) {
      this.sb = createClient(url, key);
    }
  }

  private restoreSession() {
    const saved = sessionStorage.getItem('piq_session');
    if (saved) {
      const session = JSON.parse(saved);
      this.currentInstitution$.next(session);
    }
  }

  getCurrentInstitution(): Observable<Institution | null> {
    return this.currentInstitution$.asObservable();
  }

  getStartups(): Observable<Startup[]> {
    return this.startups$.asObservable();
  }

  async login(slug: string, passcode: string): Promise<Institution> {
    if (!this.sb) throw new Error('Supabase not initialized');

    const { data, error } = await this.sb
      .from('institutions')
      .select('*')
      .eq('slug', slug.toLowerCase())
      .eq('passcode', passcode)
      .single();

    if (error) throw new Error('Invalid credentials');

    const institution = data as Institution;
    sessionStorage.setItem('piq_session', JSON.stringify(institution));
    this.currentInstitution$.next(institution);

    await this.fetchStartups(institution.id);
    this.subscribeToRealtimeUpdates(institution.id);

    return institution;
  }

  async register(name: string, slug: string, city: string, passcode: string): Promise<Institution> {
    if (!this.sb) throw new Error('Supabase not initialized');

    const { data, error } = await this.sb
      .from('institutions')
      .insert({
        name,
        slug: slug.toLowerCase(),
        city,
        passcode
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);

    const institution = data as Institution;
    sessionStorage.setItem('piq_session', JSON.stringify(institution));
    this.currentInstitution$.next(institution);

    return institution;
  }

  async fetchStartups(institutionId: number): Promise<Startup[]> {
    if (!this.sb) throw new Error('Supabase not initialized');

    const { data, error } = await this.sb
      .from('startups')
      .select('*')
      .eq('institution_id', institutionId)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);

    const startups = (data || []) as Startup[];
    this.startups$.next(startups);
    return startups;
  }

  async addStartup(institutionId: number, startupData: any): Promise<Startup> {
    if (!this.sb) throw new Error('Supabase not initialized');

    const { data, error } = await this.sb
      .from('startups')
      .insert({
        institution_id: institutionId,
        data: startupData
      })
      .select('*')
      .single();

    if (error) throw new Error(error.message);

    const startup = data as Startup;
    const current = this.startups$.value;
    this.startups$.next([startup, ...current]);
    return startup;
  }

  async updateStartup(id: number, startupData: any): Promise<Startup> {
    if (!this.sb) throw new Error('Supabase not initialized');

    const { data, error } = await this.sb
      .from('startups')
      .update({ data: startupData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new Error(error.message);

    const updated = data as Startup;
    const startups = this.startups$.value.map(s => s.id === id ? updated : s);
    this.startups$.next(startups);
    return updated;
  }

  async deleteStartup(id: number): Promise<void> {
    if (!this.sb) throw new Error('Supabase not initialized');

    const { error } = await this.sb
      .from('startups')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);

    const startups = this.startups$.value.filter(s => s.id !== id);
    this.startups$.next(startups);
  }

  async getInsight(startupId: number): Promise<Insight | null> {
    if (!this.sb) throw new Error('Supabase not initialized');

    const { data, error } = await this.sb
      .from('insights')
      .select('*')
      .eq('startup_id', startupId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return (data || null) as Insight | null;
  }

  async saveInsight(startupId: number, institutionId: number, insightData: any): Promise<Insight> {
    if (!this.sb) throw new Error('Supabase not initialized');

    const { data, error } = await this.sb
      .from('insights')
      .upsert({
        startup_id: startupId,
        institution_id: institutionId,
        data: insightData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'startup_id' })
      .select('*')
      .single();

    if (error) throw new Error(error.message);
    return (data as Insight);
  }

  private subscribeToRealtimeUpdates(institutionId: number) {
    if (!this.sb) return;

    if (this.realtimeChannel) {
      this.sb.removeChannel(this.realtimeChannel);
    }

    this.realtimeChannel = this.sb
      .channel(`startups:institution_${institutionId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'startups', filter: `institution_id=eq.${institutionId}` },
        () => this.fetchStartups(institutionId)
      )
      .subscribe();
  }

  logout() {
    sessionStorage.removeItem('piq_session');
    this.currentInstitution$.next(null);
    this.startups$.next([]);

    if (this.realtimeChannel && this.sb) {
      this.sb.removeChannel(this.realtimeChannel);
    }
  }
}
