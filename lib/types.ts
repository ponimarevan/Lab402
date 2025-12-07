// Lab402+ Types
// Autonomous Laboratory & Compute Protocol

export interface Lab402Config {
  researcher: string; // HTTP 403 researcher identity key
  wallet: string; // Solana wallet address
  endpoint?: string; // API endpoint
  timeout?: number; // Request timeout (ms)
  retries?: number; // Retry attempts
}

export type InstrumentType = 
  | 'dna-sequencer'
  | 'spectroscopy'
  | 'microscopy'
  | 'mass-spec'
  | 'nmr'
  | 'x-ray-diffraction';

export type ComputeTier = 'standard' | 'performance' | 'extreme';

export interface ComputeRequirements {
  gpu?: number; // Number of GPUs
  cpu?: number; // Number of CPUs
  vram?: number; // GB of VRAM
  tier?: ComputeTier;
}

export interface AIRequirements {
  model: 'bio-gpt' | 'chem-llm' | 'lab-vision' | 'generic';
  interpretation: boolean;
  visualization?: boolean;
  anomalyDetection?: boolean;
}

export interface AnalysisRequest {
  instrument: InstrumentType;
  sample: any; // Sample data or metadata
  compute?: ComputeRequirements;
  ai?: AIRequirements;
  duration?: number; // Expected duration (ms)
  priority?: 'low' | 'normal' | 'high';
  routing?: RoutingOptions; // Multi-lab routing
}

export interface UnifiedInvoice {
  analysisId: string;
  instrumentCost: number; // USD
  computeCost: number; // USD
  aiCost: number; // USD
  storageCost: number; // USD
  totalCost: number; // USD
  paymentAddress: string; // Solana address
  expiresAt: number; // Timestamp
}

export interface AnalysisMetrics {
  instrumentTime: number; // ms
  computeTime: number; // ms
  aiProcessingTime: number; // ms
  totalTime: number; // ms
  costAccumulated: number; // USD
  dataGenerated: number; // bytes
  status: AnalysisStatus;
}

export type AnalysisStatus = 
  | 'pending'
  | 'running'
  | 'processing'
  | 'interpreting'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface AIReport {
  analysisId: string;
  summary: string;
  findings: string[];
  anomalies: string[];
  visualizations?: string[]; // URLs to generated graphs
  confidence: number; // 0-1
  recommendations: string[];
  rawData: any;
  generatedAt: number; // Timestamp
}

export interface ResearcherIdentity {
  id: string;
  credentials: string[];
  institution: string;
  clearanceLevel: number; // 1-5
  specializations: string[];
}

export interface InstrumentAvailability {
  instrument: InstrumentType;
  available: boolean;
  nextAvailable?: number; // Timestamp
  location: string;
  capabilities: string[];
}

export interface PricingTier {
  tier: string;
  instrumentRate: number; // per minute
  computeRate: number; // per ms (GPU)
  aiRate: number; // per request
  storageRate: number; // per GB
}

export type EventType = 
  | 'analysis.requested'
  | 'analysis.started'
  | 'analysis.running'
  | 'analysis.processing'
  | 'analysis.completed'
  | 'analysis.failed'
  | 'payment.pending'
  | 'payment.settled'
  | 'payment.failed'
  | 'ai.started'
  | 'ai.completed'
  | 'report.ready'
  | 'lab.selected'
  | 'lab.fallback'
  | 'error';

export interface Lab402Event {
  type: EventType;
  data: any;
  timestamp: number;
}

export interface InstrumentCapabilities {
  instrument: InstrumentType;
  maxSampleSize: number;
  resolution: string;
  throughput: string;
  dataFormat: string[];
}

// Multi-Lab Routing Types

export interface LabInfo {
  id: string;
  name: string;
  location: string; // "Boston, MA, USA"
  country: string; // "US"
  instruments: InstrumentType[];
  pricing: PricingTier;
  quality: number; // 1-5 stars
  availability: number; // 0-100%
  uptime: number; // 0-100% (e.g., 99.9)
  currentLoad: number; // 0-100%
  coordinates?: { lat: number; lon: number };
  certifications: string[]; // ["ISO-9001", "CLIA"]
}

export type RoutingStrategy = 
  | 'cost-optimized'
  | 'fastest'
  | 'highest-quality'
  | 'nearest'
  | 'balanced';

export interface RoutingOptions {
  strategy: RoutingStrategy;
  maxCost?: number;
  minQuality?: number; // 1-5
  maxDistance?: number; // km
  preferredLocations?: string[]; // ["US", "EU"]
  excludeLabs?: string[]; // Lab IDs to exclude
  requireCertifications?: string[];
  fallback?: LabFallback[];
}

export interface LabFallback {
  lab: string; // Lab ID
  priority: number; // 1 = first choice
}

export interface LabSelection {
  lab: LabInfo;
  score: number; // Routing score
  reasoning: string;
  alternatives: LabInfo[];
}

export interface LabPricing {
  lab: string;
  labName: string;
  price: number;
  quality: number;
  eta: string; // "2 hours"
  available: boolean;
}
