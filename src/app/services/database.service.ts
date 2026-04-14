import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

// =========================================
// NEW MODELS FOR DATABASE TABLES
// =========================================

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  institution_id?: number;
  role: 'user' | 'admin' | 'super_admin';
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ChatSession {
  id: number;
  session_type: 'guest' | 'user' | 'admin';
  user_id?: number;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  ip_address?: string;
  user_agent?: string;
  started_at: Date;
  ended_at?: Date;
  message_count: number;
  source_page?: string;
  conversion_status: 'pending' | 'registered' | 'dismissed';
  created_at: Date;
  updated_at: Date;
}

export interface ChatMessage {
  id: number;
  session_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  ai_model?: string;
  tokens_used?: number;
  response_time_ms?: number;
  is_quick_question: boolean;
  feedback_rating?: number;
  created_at: Date;
}

export interface GovtScheme {
  id: number;
  name: string;
  slug: string;
  description?: string;
  category: 'funding' | 'tax_benefit' | 'infrastructure' | 'mentorship' | 'other';
  funding_amount_min?: number;
  funding_amount_max?: number;
  eligibility_criteria?: any;
  official_website?: string;
  application_link?: string;
  documents_required?: string[];
  issuing_authority?: string;
  status: 'active' | 'inactive' | 'expired';
  launch_date?: Date;
  deadline?: Date;
  keywords?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface StartupSchemeMatch {
  id: number;
  startup_id: number;
  scheme_id: number;
  match_score?: number;
  match_reason?: string;
  status: 'suggested' | 'reviewing' | 'applied' | 'approved' | 'rejected' | 'ignored';
  applied_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface LandingAnalytics {
  id: number;
  visitor_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  action_type: 'page_view' | 'signup_click' | 'feature_explore' | 'search_used' | 'chatbot_opened' | 'form_submitted' | 'cta_clicked';
  action_data?: any;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  os?: string;
  timestamp: Date;
}

export interface StartupShowcase {
  id: number;
  startup_id: number;
  institution_id: number;
  is_public: boolean;
  slug?: string;
  public_data: any;
  meta_title?: string;
  meta_description?: string;
  view_count: number;
  last_viewed_at?: Date;
  allow_contact: boolean;
  contact_email?: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  constructor(private supabase: SupabaseService) {}

  // =========================================
  // CHAT SESSIONS & MESSAGES
  // =========================================

  async createChatSession(sessionData: {
    session_type: 'guest' | 'user' | 'admin';
    user_id?: number;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    source_page?: string;
  }): Promise<ChatSession> {
    const sb = this.supabase['sb'];
    if (!sb) throw new Error('Supabase not initialized');

    const { data, error } = await sb
      .from('chat_sessions')
      .insert({
        ...sessionData,
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        conversion_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data as ChatSession;
  }

  async saveChatMessage(
    session_id: number,
    role: 'user' | 'assistant',
    content: string,
    metadata?: {
      ai_model?: string;
      tokens_used?: number;
      response_time_ms?: number;
      is_quick_question?: boolean;
    }
  ): Promise<ChatMessage> {
    const sb = this.supabase['sb'];
    if (!sb) throw new Error('Supabase not initialized');

    // Save message
    const { data, error } = await sb
      .from('chat_messages')
      .insert({
        session_id,
        role,
        content,
        ...metadata
      })
      .select()
      .single();

    if (error) throw error;

    // Update message count
    await sb
      .from('chat_sessions')
      .update({ message_count: sb.rpc('increment', { row_id: session_id }) })
      .eq('id', session_id);

    return data as ChatMessage;
  }

  async getChatHistory(session_id: number): Promise<ChatMessage[]> {
    const sb = this.supabase['sb'];
    if (!sb) throw new Error('Supabase not initialized');

    const { data, error } = await sb
      .from('chat_messages')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as ChatMessage[];
  }

  async endChatSession(session_id: number): Promise<void> {
    const sb = this.supabase['sb'];
    if (!sb) throw new Error('Supabase not initialized');

    await sb
      .from('chat_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', session_id);
  }

  async markChatConversion(session_id: number, status: 'registered' | 'dismissed'): Promise<void> {
    const sb = this.supabase['sb'];
    if (!sb) throw new Error('Supabase not initialized');

    await sb
      .from('chat_sessions')
      .update({ conversion_status: status })
      .eq('id', session_id);
  }

  // =========================================
  // LANDING PAGE ANALYTICS
  // =========================================

  async trackLandingEvent(
    action_type: LandingAnalytics['action_type'],
    action_data?: any
  ): Promise<void> {
    const sb = this.supabase['sb'];
    if (!sb) throw new Error('Supabase not initialized');

    const visitor_id = this.getOrCreateVisitorId();

    await sb
      .from('landing_analytics')
      .insert({
        visitor_id,
        action_type,
        action_data,
        user_agent: navigator.userAgent,
        device_type: this.getDeviceType(),
        browser: this.getBrowserName(),
        os: this.getOSName(),
        referrer: document.referrer || null
      });
  }

  // =========================================
  // GOVERNMENT SCHEMES
  // =========================================

  async getGovtSchemes(filters?: {
    category?: string;
    status?: string;
    search?: string;
  }): Promise<GovtScheme[]> {
    const sb = this.supabase['sb'];
    if (!sb) throw new Error('Supabase not initialized');

    let query = sb.from('govt_schemes').select('*');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      query = query.eq('status', 'active'); // Default to active schemes
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('name');

    if (error) throw error;
    return data as GovtScheme[];
  }

  async getSchemeById(id: number): Promise<GovtScheme> {
    const sb = this.supabase['sb'];
    if (!sb) throw new Error('Supabase not initialized');

    const { data, error } = await sb
      .from('govt_schemes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as GovtScheme;
  }

  // =========================================
  // STARTUP SCHEME MATCHES
  // =========================================

  async saveSchemeMatch(matchData: {
    startup_id: number;
    scheme_id: number;
    match_score?: number;
    match_reason?: string;
  }): Promise<StartupSchemeMatch> {
    const sb = this.supabase['sb'];
    if (!sb) throw new Error('Supabase not initialized');

    const { data, error } = await sb
      .from('startup_scheme_matches')
      .upsert(matchData)
      .select()
      .single();

    if (error) throw error;
    return data as StartupSchemeMatch;
  }

  async getStartupSchemeMatches(startup_id: number): Promise<Array<StartupSchemeMatch & { scheme: GovtScheme }>> {
    const sb = this.supabase['sb'];
    if (!sb) throw new Error('Supabase not initialized');

    const { data, error } = await sb
      .from('startup_scheme_matches')
      .select(`
        *,
        scheme:govt_schemes(*)
      `)
      .eq('startup_id', startup_id)
      .order('match_score', { ascending: false });

    if (error) throw error;
    return data as any;
  }

  async updateSchemeMatchStatus(
    match_id: number,
    status: StartupSchemeMatch['status'],
    notes?: string
  ): Promise<void> {
    const sb = this.supabase['sb'];
    if (!sb) throw new Error('Supabase not initialized');

    const updateData: any = { status };
    if (status === 'applied') {
      updateData.applied_at = new Date().toISOString();
    }
    if (notes) {
      updateData.notes = notes;
    }

    await sb
      .from('startup_scheme_matches')
      .update(updateData)
      .eq('id', match_id);
  }

  // =========================================
  // STARTUP SHOWCASE
  // =========================================

  async createShowcase(showcaseData: {
    startup_id: number;
    institution_id: number;
    slug: string;
    public_data: any;
    meta_title?: string;
    meta_description?: string;
  }): Promise<StartupShowcase> {
    const sb = this.supabase['sb'];
    if (!sb) throw new Error('Supabase not initialized');

    const { data, error } = await sb
      .from('startup_showcase')
      .insert(showcaseData)
      .select()
      .single();

    if (error) throw error;
    return data as StartupShowcase;
  }

  async getShowcaseBySlug(slug: string): Promise<StartupShowcase | null> {
    const sb = this.supabase['sb'];
    if (!sb) throw new Error('Supabase not initialized');

    const { data, error } = await sb
      .from('startup_showcase')
      .select('*')
      .eq('slug', slug)
      .eq('is_public', true)
      .maybeSingle();

    if (error) throw error;

    // Increment view count
    if (data) {
      await sb
        .from('startup_showcase')
        .update({
          view_count: (data.view_count || 0) + 1,
          last_viewed_at: new Date().toISOString()
        })
        .eq('id', data.id);
    }

    return data as StartupShowcase | null;
  }

  async toggleShowcaseVisibility(showcase_id: number, is_public: boolean): Promise<void> {
    const sb = this.supabase['sb'];
    if (!sb) throw new Error('Supabase not initialized');

    await sb
      .from('startup_showcase')
      .update({ is_public })
      .eq('id', showcase_id);
  }

  // =========================================
  // FEATURE USAGE TRACKING
  // =========================================

  async trackFeatureUsage(
    feature_name: string,
    action: string,
    context_data?: any
  ): Promise<void> {
    const sb = this.supabase['sb'];
    if (!sb) throw new Error('Supabase not initialized');

    // Get current user/institution from session
    const session = sessionStorage.getItem('piq_session');
    let institution_id = null;
    
    if (session) {
      const institution = JSON.parse(session);
      institution_id = institution.id;
    }

    await sb
      .from('feature_usage')
      .insert({
        institution_id,
        feature_name,
        action,
        context_data,
        success: true
      });
  }

  // =========================================
  // UTILITY METHODS
  // =========================================

  private async getClientIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  }

  private getOrCreateVisitorId(): string {
    let visitorId = localStorage.getItem('piq_visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substring(7);
      localStorage.setItem('piq_visitor_id', visitorId);
    }
    return visitorId;
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getBrowserName(): string {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    return 'Unknown';
  }

  private getOSName(): string {
    const ua = navigator.userAgent;
    if (ua.indexOf('Win') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'macOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iOS') > -1) return 'iOS';
    return 'Unknown';
  }
}
