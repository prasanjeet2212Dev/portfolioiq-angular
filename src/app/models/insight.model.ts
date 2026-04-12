export interface Insight {
  startup_id: number;
  institution_id: number;
  data: InsightData;
  updated_at?: string;
}

export interface InsightData {
  ir_score: number; // Investment Readiness 0-100
  mp_score: number; // Market Potential 0-100
  overall_score: number;
  analysis?: string;
  market_intel?: string;
  action_plan?: string;
  valuation?: string;
  schemes?: GovernmentScheme[];
}

export interface GovernmentScheme {
  name: string;
  description: string;
  url?: string;
  eligibility_match?: number;
}
