# 🚀 Quick Start - Database Features Integration

## Step 1: Run SQL Script in Supabase

1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Copy and paste the contents of `database-schema-improvements.sql`
4. Click **RUN** button
5. Verify success: Check **Table Editor** to see new tables

---

## Step 2: Update Chatbot to Use Database

### **File:** `src/app/shared/chatbot/chatbot.component.ts`

Add database tracking:

```typescript
import { DatabaseService } from '../../services/database.service';

export class ChatbotComponent implements OnInit {
  private currentSessionId?: number;

  constructor(
    private aiService: ClaudeAIService,
    private router: Router,
    private dbService: DatabaseService  // ADD THIS
  ) {}

  // REPLACE submitGuestRegistration() with:
  async submitGuestRegistration(): Promise<void> {
    if (!this.guestUser.name.trim() || !this.guestUser.email.trim() || !this.guestUser.phone.trim()) {
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.guestUser.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    try {
      // Create chat session in database
      const session = await this.dbService.createChatSession({
        session_type: 'guest',
        guest_name: this.guestUser.name,
        guest_email: this.guestUser.email,
        guest_phone: this.guestUser.phone,
        source_page: this.router.url
      });
      
      this.currentSessionId = session.id;
      
      // Save to sessionStorage for frontend state
      sessionStorage.setItem('piq_guest_chat', JSON.stringify(this.guestUser));
      sessionStorage.setItem('piq_chat_session_id', session.id.toString());
      
      this.isAuthenticated = true;
      this.showAuthForm = false;
      this.initializeChat();
      
      // Track conversion
      await this.dbService.trackLandingEvent('chatbot_opened', {
        user_type: 'guest',
        guest_email: this.guestUser.email
      });
    } catch (error) {
      console.error('Failed to create chat session:', error);
      alert('Something went wrong. Please try again.');
    }
  }

  // REPLACE sendMessage() to save messages:
  async sendMessage(message?: string): Promise<void> {
    const messageToSend = message || this.userInput.trim();
    
    if (!messageToSend || !this.currentSessionId) return;

    this.addMessage('user', messageToSend);
    this.userInput = '';
    this.isLoading = true;

    try {
      // Save user message to database
      await this.dbService.saveChatMessage(
        this.currentSessionId,
        'user',
        messageToSend,
        { is_quick_question: !!message }
      );

      const contextPrompt = `...`; // Your existing prompt

      const startTime = Date.now();
      const response = await this.aiService['callGitHubModels'](contextPrompt);
      const responseTime = Date.now() - startTime;
      
      // Save assistant response to database
      await this.dbService.saveChatMessage(
        this.currentSessionId,
        'assistant',
        response,
        {
          ai_model: 'gpt-4o',
          response_time_ms: responseTime
        }
      );
      
      this.addMessage('assistant', response || 'I apologize, but I encountered an issue.');
      
    } catch (error) {
      console.error('Chatbot error:', error);
      this.addMessage('assistant', 
        'I\'m having trouble connecting right now. Please try again in a moment!'
      );
    } finally {
      this.isLoading = false;
    }
  }

  // ADD: Load chat history on init
  async ngOnInit(): Promise<void> {
    this.checkAuthentication();
    
    const sessionId = sessionStorage.getItem('piq_chat_session_id');
    if (sessionId) {
      this.currentSessionId = parseInt(sessionId, 10);
      await this.loadChatHistory();
    }
  }

  private async loadChatHistory(): Promise<void> {
    if (!this.currentSessionId) return;
    
    try {
      const history = await this.dbService.getChatHistory(this.currentSessionId);
      this.messages = history.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  }
}
```

---

## Step 3: Add Landing Page Analytics

### **File:** `src/app/features/landing/landing.component.ts`

```typescript
import { DatabaseService } from '../../services/database.service';

export class LandingComponent implements OnInit {
  constructor(
    private router: Router,
    private dbService: DatabaseService  // ADD THIS
  ) {}

  async ngOnInit(): Promise<void> {
    const session = sessionStorage.getItem('piq_session');
    const superAdmin = sessionStorage.getItem('piq_super_admin');
    
    if (session || superAdmin) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Track page view
    await this.dbService.trackLandingEvent('page_view');
  }

  async navigateToAuth(): Promise<void> {
    // Track CTA click
    await this.dbService.trackLandingEvent('cta_clicked', {
      button: 'signup',
      location: 'hero'
    });
    
    this.router.navigate(['/auth']);
  }

  async performSearch(): Promise<void> {
    if (this.searchQuery.trim()) {
      // Track search usage
      await this.dbService.trackLandingEvent('search_used', {
        query: this.searchQuery,
        category: this.activeCategory
      });
      
      this.navigateToAuth();
    }
  }

  async scrollToSection(sectionId: string): Promise<void> {
    // Track feature exploration
    await this.dbService.trackLandingEvent('feature_explore', {
      section: sectionId
    });
    
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
```

---

## Step 4: Integrate Government Schemes

### **File:** `src/app/features/govt-schemes/govt-schemes.component.ts`

```typescript
import { DatabaseService, GovtScheme } from '../../services/database.service';

export class GovtSchemesComponent implements OnInit {
  schemes: GovtScheme[] = [];
  filteredSchemes: GovtScheme[] = [];
  selectedCategory = 'all';
  searchQuery = '';

  constructor(
    private dbService: DatabaseService,
    private supabaseService: SupabaseService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadSchemes();
    
    // Track feature usage
    await this.dbService.trackFeatureUsage('govt_schemes', 'viewed');
  }

  async loadSchemes(): Promise<void> {
    try {
      this.schemes = await this.dbService.getGovtSchemes({
        status: 'active'
      });
      this.filteredSchemes = this.schemes;
    } catch (error) {
      console.error('Failed to load schemes:', error);
    }
  }

  async filterSchemes(): Promise<void> {
    const filters: any = {};
    
    if (this.selectedCategory !== 'all') {
      filters.category = this.selectedCategory;
    }
    
    if (this.searchQuery.trim()) {
      filters.search = this.searchQuery;
    }

    this.filteredSchemes = await this.dbService.getGovtSchemes(filters);
  }

  async matchSchemesToStartup(startupId: number): Promise<void> {
    // This would be called from startup detail page
    const matches = await this.dbService.getStartupSchemeMatches(startupId);
    console.log('Matched schemes:', matches);
  }
}
```

---

## Step 5: Track Feature Usage Across App

Add to **every major feature component**:

```typescript
// In ngOnInit() or when feature is used:
await this.dbService.trackFeatureUsage(
  'feature_name',  // 'ai_scoring', 'comparison', 'valuation', etc.
  'used',          // 'viewed', 'used', 'completed'
  {                // Optional context
    startup_id: 123,
    success: true
  }
);
```

**Examples:**

### Dashboard
```typescript
ngOnInit() {
  this.dbService.trackFeatureUsage('dashboard', 'viewed');
}
```

### Comparison
```typescript
compareStartups() {
  this.dbService.trackFeatureUsage('comparison', 'used', {
    startup_count: this.selectedStartups.length
  });
}
```

### AI Scoring
```typescript
async generateScore() {
  const start = Date.now();
  try {
    const score = await this.aiService.analyzeStartup(startup);
    await this.dbService.trackFeatureUsage('ai_scoring', 'completed', {
      startup_id: startup.id,
      execution_time_ms: Date.now() - start,
      success: true
    });
  } catch (error) {
    await this.dbService.trackFeatureUsage('ai_scoring', 'failed', {
      error: error.message
    });
  }
}
```

---

## Step 6: Create Public Showcase

### **File:** `src/app/features/startup-detail/startup-detail.component.ts`

Add showcase toggle:

```typescript
async togglePublicShowcase(): Promise<void> {
  try {
    if (!this.startup.showcase_id) {
      // Create showcase
      const showcase = await this.dbService.createShowcase({
        startup_id: this.startup.id,
        institution_id: this.startup.institution_id,
        slug: this.generateSlug(this.startup.data.name),
        public_data: this.sanitizePublicData(this.startup.data),
        meta_title: `${this.startup.data.name} - Portfolio IQ`,
        meta_description: this.startup.data.description?.substring(0, 160)
      });
      
      console.log('Public URL:', `https://portfolioiq.com/showcase/${showcase.slug}`);
    } else {
      // Toggle visibility
      await this.dbService.toggleShowcaseVisibility(
        this.startup.showcase_id,
        !this.startup.is_public
      );
    }
  } catch (error) {
    console.error('Failed to toggle showcase:', error);
  }
}

private sanitizePublicData(data: any): any {
  // Remove sensitive information before making public
  return {
    name: data.name,
    description: data.description,
    sector: data.sector,
    stage: data.stage,
    founded_year: data.founded_year,
    website: data.website,
    // Remove: revenue, financials, internal notes, etc.
  };
}

private generateSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

---

## Step 7: View Analytics Dashboard

### Create Admin Analytics Component

```typescript
// src/app/features/admin/analytics/analytics.component.ts
export class AnalyticsComponent implements OnInit {
  async loadAnalytics(): Promise<void> {
    const sb = this.supabase['sb'];
    
    // Landing page analytics
    const { data: landingStats } = await sb
      .from('landing_analytics')
      .select('action_type, count(*)')
      .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .group('action_type');
    
    // Chat sessions
    const { data: chatStats } = await sb
      .from('chat_sessions')
      .select('session_type, conversion_status, count(*)')
      .group('session_type, conversion_status');
    
    // Feature usage
    const { data: featureStats } = await sb
      .from('feature_usage')
      .select('feature_name, count(*)')
      .group('feature_name')
      .order('count', { ascending: false });
    
    console.log('Analytics:', { landingStats, chatStats, featureStats });
  }
}
```

---

## ✅ Verification Checklist

After implementation, verify:

- [ ] New tables appear in Supabase Table Editor
- [ ] Chatbot creates sessions in `chat_sessions` table
- [ ] Chat messages saved to `chat_messages` table
- [ ] Landing page events tracked in `landing_analytics`
- [ ] Government schemes loadable from database
- [ ] Feature usage tracked across all components
- [ ] No console errors related to database operations

---

## 📊 Expected Data Flow

```
User Opens Landing Page
  ↓
landing_analytics INSERT (page_view)
  ↓
User Opens Chatbot
  ↓
landing_analytics INSERT (chatbot_opened)
  ↓
User Registers as Guest
  ↓
chat_sessions INSERT (guest session)
  ↓
User Sends Message
  ↓
chat_messages INSERT (user message)
  ↓
AI Responds
  ↓
chat_messages INSERT (assistant message)
  ↓
User Clicks "Login to Account"
  ↓
chat_sessions UPDATE (conversion_status = 'registered')
  ↓
User Creates Account
  ↓
users INSERT (new user)
```

---

## 🎯 Next Steps

1. **Week 1:** Implement Steps 1-2 (Chatbot database tracking)
2. **Week 2:** Implement Step 3 (Landing analytics)
3. **Week 3:** Implement Steps 4-5 (Schemes + Feature tracking)
4. **Week 4:** Implement Step 6 (Public showcase)
5. **Week 5:** Build analytics dashboard (Step 7)

---

## 🐛 Troubleshooting

**Issue:** "Supabase not initialized"
**Fix:** Check `environment.ts` has correct Supabase URL and key

**Issue:** "Foreign key violation"
**Fix:** Ensure parent records exist before inserting child records

**Issue:** "Row level security policy violation"
**Fix:** Update RLS policies or disable for testing:
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

**Issue:** "Column does not exist"
**Fix:** Re-run the SQL migration script in correct order
