import { Injectable } from '@angular/core';
import { Startup } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private provider: 'claude' | 'github' = 'github';

  constructor() {
    this.provider = (environment as any).ai?.provider || 'github';
    console.log('AI: Using server-side token via Netlify Function');
  }

  async analyzeStartup(startup: Startup): Promise<string> {
    // Local API key is optional when a backend server secret is configured.

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
    // Local API key is optional when a backend server secret is configured.

    const prompt = `Provide market intelligence on the ${startup.data.sector} sector in India affecting ${startup.data.name}. Focus on opportunities and threats in 2-3 sentences.`;

    return this.callClaude(prompt);
  }

  async generateActionPlan(startup: Startup): Promise<string> {
    // Local API key is optional when a backend server secret is configured.

    const prompt = `Create a 90-day action plan for ${startup.data.name} (${startup.data.stage} stage, ${startup.data.sector}). Focus on 3-4 key milestones.`;

    return this.callClaude(prompt);
  }

  async estimateValuation(startup: Startup): Promise<string> {
    // Local API key is optional when a backend server secret is configured.

    const prompt = `Estimate a valuation range in ₹ Cr for ${startup.data.name}:
- Stage: ${startup.data.stage}
- Revenue: ₹${startup.data.revenue || 0}
- Sector: ${startup.data.sector}
Provide 1-2 comparable Indian deals and justify the range.`;

    return this.callClaude(prompt);
  }

  async matchGovernmentSchemes(startup: Startup): Promise<any[]> {
    // Local API key is optional when a backend server secret is configured.

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

  /**
   * Public method for chatbot conversations
   */
  async chat(userMessage: string): Promise<string> {
    return this.callClaude(userMessage);
  }

  private async callClaude(prompt: string): Promise<string> {
    if (this.provider === 'github') {
      return this.callGitHubModels(prompt);
    } else {
      return this.callClaudeAPI(prompt);
    }
  }

  private async callGitHubModels(prompt: string): Promise<string> {
    const env = environment as any;
    const model = env.ai?.github?.model || 'gpt-4o';
    
    console.log('GitHub Models - Making request with model:', model);
    console.log('GitHub Models - Using Netlify Function (server-side token)');
    
    const requestBody = {
      messages: [
        {
          role: 'system',
          content: 'You are an expert startup analyst specializing in the Indian startup ecosystem. Provide concise, actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: model,
      temperature: 0.7,
      max_tokens: 1024
    };

    // Use Netlify Function which has access to GITHUB_TOKEN env var
    const response = await fetch('/api/github-models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('GitHub Models - Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub Models - Error response:', errorText);
      let errorMsg = 'Unknown error';
      try {
        const error = JSON.parse(errorText);
        errorMsg = error.error?.message || error.message || errorMsg;
      } catch {
        errorMsg = errorText || errorMsg;
      }
      throw new Error(`GitHub Models API error (${response.status}): ${errorMsg}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return content;
  }

  private async callClaudeAPI(prompt: string): Promise<string> {
    const headers: Record<string, string> = {
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json'
    };

    const response = await fetch('/api/claude', {
      method: 'POST',
      headers,
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
