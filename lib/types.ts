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
  | 'batch.created'
  | 'batch.started'
  | 'batch.progress'
  | 'batch.sample.completed'
  | 'batch.sample.failed'
  | 'batch.completed'
  | 'batch.failed'
  | 'sample.registered'
  | 'sample.status.updated'
  | 'sample.history.added'
  | 'sample.qc.checked'
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

// Batch Processing Types

export interface BatchSample {
  id: string;
  data: any;
  metadata?: Record<string, any>;
}

export interface BatchRequest {
  samples: BatchSample[];
  instrument: InstrumentType;
  compute?: ComputeRequirements;
  ai?: AIRequirements;
  routing?: RoutingOptions;
  priority?: 'low' | 'normal' | 'high';
}

export interface BatchPricing {
  baseCost: number;
  totalSamples: number;
  discountRate: number; // 0-1
  discountedCost: number;
  savings: number;
  perSampleCost: number;
}

export interface SampleResult {
  sampleId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  analysis?: any;
  aiReport?: AIReport;
  error?: string;
  startedAt?: number;
  completedAt?: number;
  processingTime?: number;
}

export interface BatchProgress {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  percentage: number;
  estimatedTimeRemaining?: number; // ms
}

export interface BatchAnalysisConfig {
  batchId: string;
  request: BatchRequest;
  pricing: BatchPricing;
  parallelism: number; // How many samples to process simultaneously
}

export interface BatchReport {
  batchId: string;
  totalSamples: number;
  completedSamples: number;
  failedSamples: number;
  averageProcessingTime: number;
  totalCost: number;
  results: SampleResult[];
  aggregateStatistics?: Record<string, any>;
  generatedAt: number;
}

// Sample Tracking Types

export interface SampleMetadata {
  origin?: string;
  collectionDate?: number;
  expirationDate?: number;
  storageConditions?: string;
  handler?: string;
  protocol?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface SampleHistory {
  timestamp: number;
  event: SampleEventType;
  actor?: string;
  details?: string;
  location?: string;
}

export type SampleEventType =
  | 'created'
  | 'registered'
  | 'stored'
  | 'retrieved'
  | 'prepared'
  | 'analyzed'
  | 'completed'
  | 'archived'
  | 'disposed'
  | 'transferred';

export interface TrackedSample {
  id: string;
  barcode?: string;
  type: string;
  metadata: SampleMetadata;
  status: SampleStatus;
  location?: string;
  history: SampleHistory[];
  analyses: string[]; // Analysis IDs
  qcChecks: QualityCheck[];
  createdAt: number;
  updatedAt: number;
}

export type SampleStatus =
  | 'registered'
  | 'stored'
  | 'in-preparation'
  | 'ready'
  | 'in-analysis'
  | 'completed'
  | 'archived'
  | 'disposed';

export interface QualityCheck {
  timestamp: number;
  inspector: string;
  passed: boolean;
  metrics?: Record<string, number>;
  notes?: string;
}

export interface SampleQuery {
  ids?: string[];
  barcodes?: string[];
  type?: string;
  status?: SampleStatus | SampleStatus[];
  tags?: string[];
  origin?: string;
  dateRange?: {
    start: number;
    end: number;
  };
  location?: string;
}

// AI Model Selection Types

export type AIModelType =
  | 'bio-gpt'
  | 'chem-bert'
  | 'protein-fold'
  | 'genomics-llm'
  | 'drug-discovery'
  | 'medical-vision'
  | 'pathology-ai';

export interface AIModel {
  id: string;
  name: string;
  type: AIModelType;
  version: string;
  description: string;
  capabilities: string[];
  pricing: {
    perSample: number;
    perToken?: number;
    perImage?: number;
  };
  parameters?: {
    size: string; // e.g., "7B", "70B", "405B"
    contextWindow?: number;
    accuracy?: number;
  };
  requirements: {
    minGPU?: number;
    minVRAM?: number;
    minRAM?: number;
  };
  specialization?: string[];
  trainingData?: string;
}

export interface AIModelSelection {
  model: AIModel;
  reason: string;
  confidence: number;
  alternatives?: AIModel[];
}

export interface ModelComparison {
  recommended: AIModel;
  alternatives: Array<{
    model: AIModel;
    pros: string[];
    cons: string[];
    costDiff: number;
  }>;
}
