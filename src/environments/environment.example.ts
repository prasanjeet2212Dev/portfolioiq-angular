// Copy this file to environment.ts and add your actual API keys
export const environment = {
  production: false,
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    key: 'YOUR_SUPABASE_ANON_KEY'
  },
  claude: {
    apiKey: 'YOUR_CLAUDE_API_KEY' // Get from https://console.anthropic.com/
  }
};
