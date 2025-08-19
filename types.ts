export interface Meter {
  meter: string;
  id: string;
  type: string;
  zone: string;
  daily: number[];
  level: string; // L1, L2, DC, L3, L4
}

export interface WaterData {
  L1: Omit<Meter, 'level'>[];
  L2: Omit<Meter, 'level'>[];
  DC: Omit<Meter, 'level'>[];
  L3: Omit<Meter, 'level'>[];
  L4: Omit<Meter, 'level'>[];
}

export interface Metrics {
  a1: number;
  a2: number;
  a3Bulk: number;
  a3Individual: number;
  stage1Loss: number;
  stage2LossBulk: number;
  stage2LossIndividual: number;
  stage3Loss: number;
  totalLoss: number;
  lossPercentage: number;
  efficiency: number;
}

export interface DailyTrend {
  day: number;
  consumption: number;
  distributed: number;
  loss: number;
  month?: string;
}

export interface ZonePerformance {
  zone: string;
  input: number;
  output: number;
  loss: number;
  lossPercent: number;
}

export type View = 'overview' | 'meters' | 'analysis' | 'zones';