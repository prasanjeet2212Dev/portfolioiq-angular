export interface Startup {
  id: number;
  institution_id: number;
  data: StartupData;
  created_at?: string;
  updated_at?: string;
}

export interface StartupData {
  name: string;
  stage: string; // seed, series-a, series-b, etc.
  city: string;
  sector: string;
  team_size: number;
  revenue?: number;
  mrr?: number;
  runway?: number;
  growth_rate?: number;
  ltv_cac_ratio?: number;
  funding_stage?: string;
  tam?: number;
  market_growth?: number;
  competitive_moat?: string;
  customer_traction?: number;
  [key: string]: unknown;
}
