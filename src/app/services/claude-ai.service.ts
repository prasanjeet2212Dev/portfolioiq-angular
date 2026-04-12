import { Injectable } from '@angular/core';
import { Startup } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ClaudeAIService {
  private apiKey = '';

  constructor() {
    this.restoreAPIKey();
  }

  setAPIKey(key: string) {
    this.apiKey = key;
    localStorage.setItem('piq_claude_key', key);
  }

  private restoreAPIKey() {
    this.apiKey = localStorage.getItem('piq_claude_key') || '';
  }

  async analyzeStartup(startup: Startup): Promise<string> {
    if (!this.apiKey) throw new Error('Claude API key not configured');

    const prompt = `Analyze this Indian startup for investment readiness in 2-3 sentences:
Name: ${startup.data.name}
Stage: ${startup.data.stage}
Sector: ${startup.data.sector}
City: ${startup.data.city}
Team: ${startup.data.team_size} people
Revenue: ₹${startup.data.revenue || 0}
MRR: ₹${startup.data.mrr || 0}
Runway: ${startup.data.runway || 0} months`;

    return this.callClaude(prompt);
  }

  async generateMarketIntel(startup: Startup): Promise<string> {
    if (!this.apiKey) throw new Error('Claude API key not configured');

    const prompt = `Provide market intelligence on the ${startup.data.sector} sector in India affecting ${startup.data.name}. Focus on opportunities and threats in 2-3 sentences.`;

    return this.callClaude(prompt);
  }

  async generateActionPlan(startup: Startup): Promise<string> {
    if (!this.apiKey) throw new Error('Claude API key not configured');

    const prompt = `Create a 90-day action plan for ${startup.data.name} (${startup.data.stage} stage, ${startup.data.sector}). Focus on 3-4 key milestones.`;

    return this.callClaude(prompt);
  }

  async estimateValuation(startup: Startup): Promise<string> {
    if (!this.apiKey) throw new Error('Claude API key not configured');

    const prompt = `Estimate a valuation range in ₹ Cr for ${startup.data.name}:
- Stage: ${startup.data.stage}
- Revenue: ₹${startup.data.revenue || 0}
- Sector: ${startup.data.sector}
Provide 1-2 comparable Indian deals and justify the range.`;

    return this.callClaude(prompt);
  }

  async matchGovernmentSchemes(startup: Startup): Promise<any[]> {
    if (!this.apiKey) throw new Error('Claude API key not configured');

    const prompt = `Identify government schemes (central & state) for this startup:
Name: ${startup.data.name}
Stage: ${startup.data.stage}
Sector: ${startup.data.sector}
City: ${startup.data.city}
Team: ${startup.data.team_size}

Return as JSON array: [{"name": "scheme name", "description": "brief", "url": "link"}]
Only return the JSON array, no other text.`;

    const response = await this.callClaude(prompt);
    try {
      return JSON.parse(response);
    } catch {
      return [];
    }
  }

  private async callClaude(prompt: string): Promise<string> {
    // Browser-side API call to Anthropic (client-side to avoid exposing key on backend)
    // Note: In production, you'd route through a backend auth layer
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';
  }
}
