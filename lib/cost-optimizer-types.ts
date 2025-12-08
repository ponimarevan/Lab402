// Cost Optimizer Types for Lab402+ v1.5.0

export type OptimizationPriority = 'cost' | 'speed' | 'quality' | 'balanced';

export interface OptimizationConstraints {
  maxCost?: number;           // Maximum budget (USD)
  minQuality?: number;         // Minimum lab quality (1-5)
  maxTime?: string;            // Maximum time (e.g. '24h', '2d', '1w')
  priority: OptimizationPriority;
  preferredLocations?: string[];
  requireCertifications?: string[];
}

export interface OptimizationResult {
  lab: {
    id: string;
    name: string;
    cost: number;
    quality: number;
    eta: string;
    location: string;
  };
  aiModel: {
    id: string;
    name: string;
    costPerSample: number;
    accuracy: number;
  };
  compute: {
    tier: string;
    gpu: number;
    vram: number;
    costPerMs: number;
  };
  batch?: {
    samples: number;
    discount: number;
    savings: number;
  };
  totals: {
    baseCost: number;
    discountedCost: number;
    totalSavings: number;
    estimatedTime: number;
    averageQuality: number;
  };
  alternatives: OptimizationAlternative[];
}

export interface OptimizationAlternative {
  description: string;
  changes: string[];
  cost: number;
  savings: number;
  quality: number;
  time: string;
}

export interface WhatIfScenario {
  name: string;
  changes: {
    samples?: number;
    priority?: OptimizationPriority;
    maxCost?: number;
    minQuality?: number;
  };
  result: OptimizationResult;
}

export interface CostBreakdown {
  instrument: number;
  compute: number;
  ai: number;
  storage: number;
  subtotal: number;
  discount: number;
  total: number;
}

export interface SavingsEstimate {
  worstCase: CostBreakdown;
  optimized: CostBreakdown;
  savings: {
    absolute: number;
    percentage: number;
  };
  recommendations: string[];
}

export interface PriceComparison {
  metric: string;
  options: Array<{
    name: string;
    value: number;
    cost: number;
    selected: boolean;
  }>;
}

export interface OptimizationRequest {
  instrument: string;
  samples: number;
  sampleType?: string;
  constraints: OptimizationConstraints;
  includeAlternatives?: boolean;
  includeWhatIf?: boolean;
}
