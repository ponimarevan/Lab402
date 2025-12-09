// Pipeline Types for Lab402 v1.6.0

export type PipelineStepType = 
  | 'instrument'    // Run lab instrument
  | 'ai-analysis'   // AI model analysis
  | 'transform'     // Data transformation
  | 'condition'     // Conditional branching
  | 'storage'       // Store results
  | 'webhook'       // HTTP callback
  | 'custom';       // Custom function

export type PipelineStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused';

export interface PipelineStep {
  id: string;
  name: string;
  type: PipelineStepType;
  config: PipelineStepConfig;
  retryPolicy?: RetryPolicy;
  timeout?: number; // milliseconds
  dependsOn?: string[]; // step IDs
  onSuccess?: string; // next step ID
  onFailure?: string; // fallback step ID
  skip?: boolean;
}

export interface PipelineStepConfig {
  // Instrument step
  instrument?: string;
  samples?: number;
  priority?: 'cost' | 'speed' | 'quality' | 'balanced';
  
  // AI analysis step
  aiModel?: string;
  task?: string;
  
  // Transform step
  transform?: (data: any) => any | Promise<any>;
  
  // Condition step
  condition?: (data: any) => boolean | Promise<boolean>;
  ifTrue?: string; // step ID
  ifFalse?: string; // step ID
  
  // Storage step
  destination?: string;
  format?: string;
  
  // Webhook step
  url?: string;
  method?: 'GET' | 'POST' | 'PUT';
  headers?: Record<string, string>;
  
  // Custom step
  execute?: (context: PipelineContext) => any | Promise<any>;
  
  // Common
  input?: any;
  output?: string; // variable name to store result
}

export interface RetryPolicy {
  maxAttempts: number;
  backoff?: 'linear' | 'exponential';
  initialDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
}

export interface PipelineContext {
  pipelineId: string;
  variables: Map<string, any>;
  results: Map<string, any>;
  metadata: Record<string, any>;
  startTime: number;
  currentStep?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  steps: PipelineStep[];
  context: PipelineContext;
  status: PipelineStatus;
  startStep: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: PipelineError;
}

export interface PipelineError {
  stepId: string;
  stepName: string;
  message: string;
  code?: string;
  timestamp: number;
  attempt?: number;
}

export interface PipelineResult {
  pipelineId: string;
  status: PipelineStatus;
  results: Map<string, any>;
  executionTime: number;
  stepsCompleted: number;
  stepsFailed: number;
  error?: PipelineError;
}

export interface PipelineTemplate {
  name: string;
  description: string;
  version: string;
  steps: Omit<PipelineStep, 'id'>[];
  variables?: Record<string, any>;
  tags?: string[];
}

export interface PipelineEvent {
  type: 'step.started' | 'step.completed' | 'step.failed' | 'step.retrying' | 'pipeline.completed' | 'pipeline.failed' | 'pipeline.paused';
  pipelineId: string;
  stepId?: string;
  timestamp: number;
  data?: any;
}

export interface PipelineExecutionOptions {
  maxConcurrentSteps?: number;
  stopOnError?: boolean;
  saveIntermediateResults?: boolean;
  webhookUrl?: string;
  metadata?: Record<string, any>;
}

export interface StepExecutionResult {
  stepId: string;
  status: 'success' | 'failure' | 'skipped';
  output?: any;
  error?: string;
  duration: number;
  timestamp: number;
  retryCount?: number;
}

export interface PipelineMetrics {
  totalSteps: number;
  completedSteps: number;
  failedSteps: number;
  skippedSteps: number;
  totalDuration: number;
  averageStepDuration: number;
  retryCount: number;
}

export interface ConditionalBranch {
  condition: (context: PipelineContext) => boolean | Promise<boolean>;
  trueBranch: string; // step ID
  falseBranch: string; // step ID
}

export interface DataTransform {
  from: string; // source variable
  to: string; // destination variable
  transform: (data: any) => any | Promise<any>;
}

export interface StorageConfig {
  provider: 's3' | 'ipfs' | 'local' | 'postgres' | 'mongodb';
  connection: string;
  path?: string;
  bucket?: string;
  credentials?: Record<string, string>;
}

export interface WebhookConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  onEvent?: PipelineEvent['type'][];
}

// Built-in pipeline templates
export type BuiltInTemplate = 
  | 'genomics-analysis'      // DNA sequencing → AI analysis → Storage
  | 'drug-discovery'         // Mass-spec → AI prediction → Results
  | 'quality-control'        // Multiple tests → QC check → Approve/Reject
  | 'batch-processing'       // Instrument → Transform → Batch storage
  | 'research-workflow';     // Multi-step scientific protocol

export interface PipelineBuilder {
  addStep(name: string, config: PipelineStepConfig): PipelineBuilder;
  addInstrument(instrument: string, config: any): PipelineBuilder;
  addAIAnalysis(model: string, task: string): PipelineBuilder;
  addTransform(fn: (data: any) => any): PipelineBuilder;
  addCondition(name: string, condition: (data: any) => boolean): PipelineBuilder;
  addStorage(destination: string, format?: string): PipelineBuilder;
  addWebhook(url: string, config?: Partial<WebhookConfig>): PipelineBuilder;
  onFailure(action: 'retry' | 'skip' | 'stop', config?: any): PipelineBuilder;
  setTimeout(ms: number): PipelineBuilder;
  setRetry(policy: RetryPolicy): PipelineBuilder;
  parallel(...steps: string[]): PipelineBuilder;
  build(): Pipeline;
  execute(): Promise<PipelineResult>;
}

export interface PipelineSchedule {
  pipelineId: string;
  cron?: string; // Cron expression
  interval?: number; // Milliseconds
  startAt?: number; // Timestamp
  endAt?: number; // Timestamp
  enabled: boolean;
}
