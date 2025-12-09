// Pipeline - Laboratory automation pipeline builder and executor

import { EventEmitter } from 'events';
import type {
  Pipeline as PipelineType,
  PipelineStep,
  PipelineStepConfig,
  PipelineContext,
  PipelineResult,
  PipelineStatus,
  PipelineBuilder,
  RetryPolicy,
  PipelineEvent,
  StepExecutionResult,
  PipelineError
} from './pipeline-types';

export class Pipeline extends EventEmitter implements PipelineBuilder {
  private pipeline: PipelineType;
  private lastStepId: string | null = null;

  constructor(name: string, description?: string) {
    super();
    
    const pipelineId = this.generateId();
    const startStepId = this.generateStepId();

    this.pipeline = {
      id: pipelineId,
      name,
      description,
      steps: [],
      context: {
        pipelineId,
        variables: new Map(),
        results: new Map(),
        metadata: {},
        startTime: Date.now()
      },
      status: 'pending',
      startStep: startStepId,
      createdAt: Date.now()
    };
  }

  /**
   * Add a generic step to the pipeline
   */
  addStep(name: string, config: PipelineStepConfig): PipelineBuilder {
    const stepId = this.generateStepId();
    
    const step: PipelineStep = {
      id: stepId,
      name,
      type: this.inferStepType(config),
      config,
      dependsOn: this.lastStepId ? [this.lastStepId] : []
    };

    this.pipeline.steps.push(step);
    this.lastStepId = stepId;

    return this;
  }

  /**
   * Add instrument analysis step
   */
  addInstrument(instrument: string, config: any = {}): PipelineBuilder {
    return this.addStep(`Run ${instrument}`, {
      instrument,
      samples: config.samples || 1,
      priority: config.priority || 'balanced',
      ...config
    });
  }

  /**
   * Add AI analysis step
   */
  addAIAnalysis(model: string, task: string = 'analysis'): PipelineBuilder {
    return this.addStep(`AI Analysis: ${model}`, {
      aiModel: model,
      task
    });
  }

  /**
   * Add data transformation step
   */
  addTransform(fn: (data: any) => any, name: string = 'Transform'): PipelineBuilder {
    return this.addStep(name, {
      transform: fn
    });
  }

  /**
   * Add conditional branching
   */
  addCondition(
    name: string,
    condition: (data: any) => boolean,
    ifTrue?: string,
    ifFalse?: string
  ): PipelineBuilder {
    return this.addStep(name, {
      condition,
      ifTrue,
      ifFalse
    });
  }

  /**
   * Add storage step
   */
  addStorage(destination: string, format?: string): PipelineBuilder {
    return this.addStep(`Store to ${destination}`, {
      destination,
      format: format || 'json'
    });
  }

  /**
   * Add webhook callback step
   */
  addWebhook(url: string, config: any = {}): PipelineBuilder {
    return this.addStep(`Webhook to ${url}`, {
      url,
      method: config.method || 'POST',
      headers: config.headers
    });
  }

  /**
   * Add custom execution step
   */
  addCustom(
    name: string,
    execute: (context: PipelineContext) => any | Promise<any>
  ): PipelineBuilder {
    return this.addStep(name, {
      execute
    });
  }

  /**
   * Set failure handling for last step
   */
  onFailure(action: 'retry' | 'skip' | 'stop', config?: any): PipelineBuilder {
    if (!this.lastStepId) {
      throw new Error('No step to apply onFailure to');
    }

    const lastStep = this.pipeline.steps.find(s => s.id === this.lastStepId);
    if (!lastStep) return this;

    if (action === 'retry') {
      lastStep.retryPolicy = {
        maxAttempts: config?.maxAttempts || 3,
        backoff: config?.backoff || 'exponential',
        initialDelay: config?.initialDelay || 1000,
        maxDelay: config?.maxDelay || 30000
      };
    } else if (action === 'skip') {
      lastStep.skip = true;
    }

    return this;
  }

  /**
   * Set timeout for last step
   */
  setTimeout(ms: number): PipelineBuilder {
    if (!this.lastStepId) {
      throw new Error('No step to apply timeout to');
    }

    const lastStep = this.pipeline.steps.find(s => s.id === this.lastStepId);
    if (lastStep) {
      lastStep.timeout = ms;
    }

    return this;
  }

  /**
   * Set retry policy for last step
   */
  setRetry(policy: RetryPolicy): PipelineBuilder {
    if (!this.lastStepId) {
      throw new Error('No step to apply retry policy to');
    }

    const lastStep = this.pipeline.steps.find(s => s.id === this.lastStepId);
    if (lastStep) {
      lastStep.retryPolicy = policy;
    }

    return this;
  }

  /**
   * Create parallel steps (execute simultaneously)
   */
  parallel(...stepNames: string[]): PipelineBuilder {
    // Mark all current steps as not depending on previous
    const currentSteps = this.pipeline.steps.slice(-stepNames.length);
    currentSteps.forEach(step => {
      step.dependsOn = [];
    });

    return this;
  }

  /**
   * Set variable in pipeline context
   */
  setVariable(name: string, value: any): PipelineBuilder {
    this.pipeline.context.variables.set(name, value);
    return this;
  }

  /**
   * Get variable from pipeline context
   */
  getVariable(name: string): any {
    return this.pipeline.context.variables.get(name);
  }

  /**
   * Build the pipeline
   */
  build(): PipelineType {
    // Validate pipeline
    if (this.pipeline.steps.length === 0) {
      throw new Error('Pipeline must have at least one step');
    }

    // Set start step if not set
    if (!this.pipeline.startStep && this.pipeline.steps.length > 0) {
      this.pipeline.startStep = this.pipeline.steps[0].id;
    }

    return this.pipeline;
  }

  /**
   * Execute the pipeline
   */
  async execute(): Promise<PipelineResult> {
    this.pipeline.status = 'running';
    this.pipeline.startedAt = Date.now();

    const result: PipelineResult = {
      pipelineId: this.pipeline.id,
      status: 'running',
      results: new Map(),
      executionTime: 0,
      stepsCompleted: 0,
      stepsFailed: 0
    };

    this.emitEvent('pipeline.started', { pipelineId: this.pipeline.id });

    try {
      // Execute steps in order
      for (const step of this.pipeline.steps) {
        // Check dependencies
        if (step.dependsOn && step.dependsOn.length > 0) {
          const allDependenciesComplete = step.dependsOn.every(depId => {
            return this.pipeline.context.results.has(depId);
          });

          if (!allDependenciesComplete) {
            throw new Error(`Dependencies not met for step: ${step.name}`);
          }
        }

        // Execute step
        const stepResult = await this.executeStep(step);

        if (stepResult.status === 'success') {
          result.stepsCompleted++;
          this.pipeline.context.results.set(step.id, stepResult.output);
          
          if (step.config.output) {
            this.pipeline.context.variables.set(step.config.output, stepResult.output);
          }
        } else if (stepResult.status === 'failure') {
          result.stepsFailed++;
          
          if (!step.skip) {
            // Pipeline failed
            this.pipeline.status = 'failed';
            result.status = 'failed';
            result.error = {
              stepId: step.id,
              stepName: step.name,
              message: stepResult.error || 'Step execution failed',
              timestamp: Date.now()
            };
            break;
          }
        }
      }

      if (this.pipeline.status === 'running') {
        this.pipeline.status = 'completed';
        result.status = 'completed';
      }

      this.pipeline.completedAt = Date.now();
      result.executionTime = this.pipeline.completedAt - this.pipeline.startedAt!;

      this.emitEvent('pipeline.completed', {
        pipelineId: this.pipeline.id,
        result
      });

    } catch (error: any) {
      this.pipeline.status = 'failed';
      result.status = 'failed';
      result.error = {
        stepId: 'unknown',
        stepName: 'unknown',
        message: error.message,
        timestamp: Date.now()
      };

      this.emitEvent('pipeline.failed', {
        pipelineId: this.pipeline.id,
        error: error.message
      });
    }

    result.results = this.pipeline.context.results;
    return result;
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: PipelineStep): Promise<StepExecutionResult> {
    const startTime = Date.now();
    let attempt = 0;
    const maxAttempts = step.retryPolicy?.maxAttempts || 1;

    this.emitEvent('step.started', {
      pipelineId: this.pipeline.id,
      stepId: step.id,
      stepName: step.name
    });

    while (attempt < maxAttempts) {
      attempt++;

      try {
        let output: any;

        // Execute based on step type
        switch (step.type) {
          case 'instrument':
            output = await this.executeInstrument(step);
            break;
          case 'ai-analysis':
            output = await this.executeAIAnalysis(step);
            break;
          case 'transform':
            output = await this.executeTransform(step);
            break;
          case 'condition':
            output = await this.executeCondition(step);
            break;
          case 'storage':
            output = await this.executeStorage(step);
            break;
          case 'webhook':
            output = await this.executeWebhook(step);
            break;
          case 'custom':
            output = await this.executeCustom(step);
            break;
          default:
            throw new Error(`Unknown step type: ${step.type}`);
        }

        // Success
        const duration = Date.now() - startTime;

        this.emitEvent('step.completed', {
          pipelineId: this.pipeline.id,
          stepId: step.id,
          stepName: step.name,
          duration
        });

        return {
          stepId: step.id,
          status: 'success',
          output,
          duration,
          timestamp: Date.now(),
          retryCount: attempt - 1
        };

      } catch (error: any) {
        if (attempt < maxAttempts) {
          // Retry
          const delay = this.calculateRetryDelay(step.retryPolicy, attempt);
          
          this.emitEvent('step.retrying', {
            pipelineId: this.pipeline.id,
            stepId: step.id,
            attempt,
            maxAttempts,
            delay
          });

          await this.sleep(delay);
        } else {
          // Final failure
          const duration = Date.now() - startTime;

          this.emitEvent('step.failed', {
            pipelineId: this.pipeline.id,
            stepId: step.id,
            stepName: step.name,
            error: error.message
          });

          return {
            stepId: step.id,
            status: 'failure',
            error: error.message,
            duration,
            timestamp: Date.now(),
            retryCount: attempt - 1
          };
        }
      }
    }

    throw new Error('Should not reach here');
  }

  // Step execution methods
  private async executeInstrument(step: PipelineStep): Promise<any> {
    // This would integrate with Lab402 instrument execution
    return {
      instrument: step.config.instrument,
      samples: step.config.samples,
      status: 'completed',
      results: [] // Placeholder
    };
  }

  private async executeAIAnalysis(step: PipelineStep): Promise<any> {
    // This would integrate with Lab402 AI model execution
    return {
      model: step.config.aiModel,
      task: step.config.task,
      results: {} // Placeholder
    };
  }

  private async executeTransform(step: PipelineStep): Promise<any> {
    if (!step.config.transform) {
      throw new Error('Transform function not provided');
    }

    const input = this.getStepInput(step);
    return await step.config.transform(input);
  }

  private async executeCondition(step: PipelineStep): Promise<any> {
    if (!step.config.condition) {
      throw new Error('Condition function not provided');
    }

    const input = this.getStepInput(step);
    const result = await step.config.condition(input);

    return { conditionResult: result };
  }

  private async executeStorage(step: PipelineStep): Promise<any> {
    const data = this.getStepInput(step);
    
    // Placeholder for actual storage implementation
    return {
      destination: step.config.destination,
      format: step.config.format,
      stored: true
    };
  }

  private async executeWebhook(step: PipelineStep): Promise<any> {
    if (!step.config.url) {
      throw new Error('Webhook URL not provided');
    }

    // Placeholder for actual HTTP request
    return {
      url: step.config.url,
      method: step.config.method,
      sent: true
    };
  }

  private async executeCustom(step: PipelineStep): Promise<any> {
    if (!step.config.execute) {
      throw new Error('Custom execute function not provided');
    }

    return await step.config.execute(this.pipeline.context);
  }

  // Helper methods
  private getStepInput(step: PipelineStep): any {
    if (step.config.input !== undefined) {
      return step.config.input;
    }

    // Get output from previous step
    if (step.dependsOn && step.dependsOn.length > 0) {
      const prevStepId = step.dependsOn[step.dependsOn.length - 1];
      return this.pipeline.context.results.get(prevStepId);
    }

    return null;
  }

  private inferStepType(config: PipelineStepConfig): PipelineStep['type'] {
    if (config.instrument) return 'instrument';
    if (config.aiModel) return 'ai-analysis';
    if (config.transform) return 'transform';
    if (config.condition) return 'condition';
    if (config.destination) return 'storage';
    if (config.url) return 'webhook';
    if (config.execute) return 'custom';
    return 'custom';
  }

  private calculateRetryDelay(policy: RetryPolicy | undefined, attempt: number): number {
    if (!policy) return 1000;

    const { backoff = 'exponential', initialDelay = 1000, maxDelay = 30000 } = policy;

    let delay: number;
    if (backoff === 'linear') {
      delay = initialDelay * attempt;
    } else {
      delay = initialDelay * Math.pow(2, attempt - 1);
    }

    return Math.min(delay, maxDelay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private emitEvent(type: PipelineEvent['type'], data?: any): void {
    const event: PipelineEvent = {
      type,
      pipelineId: this.pipeline.id,
      timestamp: Date.now(),
      data
    };

    this.emit(type, event);
    this.emit('event', event);
  }

  private generateId(): string {
    return `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateStepId(): string {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public getters
  getPipeline(): PipelineType {
    return this.pipeline;
  }

  getStatus(): PipelineStatus {
    return this.pipeline.status;
  }

  getResults(): Map<string, any> {
    return this.pipeline.context.results;
  }
}
