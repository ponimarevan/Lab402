import { EventEmitter } from 'events';
import type {
  BatchAnalysisConfig,
  BatchProgress,
  SampleResult,
  BatchReport,
  BatchSample,
  Lab402Event
} from './types';
import { Analysis } from './Analysis';
import { Payment402 } from './Payment402';

export class BatchAnalysis extends EventEmitter {
  private config: BatchAnalysisConfig;
  private payment: Payment402;
  private results: Map<string, SampleResult>;
  private activeAnalyses: Map<string, Analysis>;
  private progress: BatchProgress;
  private startedAt?: number;
  private completedAt?: number;

  constructor(config: BatchAnalysisConfig, payment: Payment402) {
    super();
    this.config = config;
    this.payment = payment;
    this.results = new Map();
    this.activeAnalyses = new Map();

    // Initialize progress
    this.progress = {
      total: config.request.samples.length,
      pending: config.request.samples.length,
      running: 0,
      completed: 0,
      failed: 0,
      percentage: 0
    };

    // Initialize sample results
    config.request.samples.forEach(sample => {
      this.results.set(sample.id, {
        sampleId: sample.id,
        status: 'pending'
      });
    });

    console.log(`\n🧪 Batch created: ${config.batchId}`);
    console.log(`Samples: ${config.request.samples.length}`);
    console.log(`Parallelism: ${config.parallelism}`);
    console.log(`Total cost: $${config.pricing.discountedCost.toFixed(2)}`);
    console.log(`Savings: $${config.pricing.savings.toFixed(2)} (${(config.pricing.discountRate * 100).toFixed(0)}% discount)`);
  }

  async start(): Promise<void> {
    this.startedAt = Date.now();

    console.log(`\n🚀 Starting batch processing...`);

    this.emitEvent('batch.started', {
      batchId: this.config.batchId,
      totalSamples: this.config.request.samples.length
    });

    // Process payment for entire batch
    const invoice = await this.payment.createInvoice(
      this.config.batchId,
      this.config.pricing.discountedCost,
      'USD'
    );

    console.log(`💳 Batch invoice: $${this.config.pricing.discountedCost.toFixed(2)}`);

    // Process samples in parallel batches
    await this.processSamples();

    this.completedAt = Date.now();

    console.log(`\n✅ Batch completed!`);
    console.log(`Processed: ${this.progress.completed} samples`);
    console.log(`Failed: ${this.progress.failed} samples`);
    console.log(`Time: ${((this.completedAt - this.startedAt) / 1000).toFixed(2)}s`);

    this.emitEvent('batch.completed', {
      batchId: this.config.batchId,
      progress: this.progress,
      report: this.generateReport()
    });
  }

  private async processSamples(): Promise<void> {
    const samples = this.config.request.samples;
    const parallelism = this.config.parallelism;

    // Process in chunks
    for (let i = 0; i < samples.length; i += parallelism) {
      const chunk = samples.slice(i, i + parallelism);
      
      await Promise.all(
        chunk.map(sample => this.processSample(sample))
      );
    }
  }

  private async processSample(sample: BatchSample): Promise<void> {
    const result = this.results.get(sample.id)!;
    
    try {
      // Update status
      result.status = 'running';
      result.startedAt = Date.now();
      this.updateProgress();

      console.log(`  Processing sample: ${sample.id}`);

      // Simulate analysis (in production: real instrument execution)
      await this.delay(this.getRandomProcessingTime());

      // Mock result
      result.analysis = {
        sampleId: sample.id,
        data: sample.data,
        measurements: this.generateMockMeasurements(),
        quality: 'high'
      };

      // Generate AI report if requested
      if (this.config.request.ai?.interpretation) {
        result.aiReport = await this.generateAIReport(sample, result.analysis);
      }

      // Complete
      result.status = 'completed';
      result.completedAt = Date.now();
      result.processingTime = result.completedAt - result.startedAt!;

      this.updateProgress();

      this.emitEvent('batch.sample.completed', {
        batchId: this.config.batchId,
        sampleId: sample.id,
        result,
        progress: this.progress
      });

    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.completedAt = Date.now();

      this.updateProgress();

      this.emitEvent('batch.sample.failed', {
        batchId: this.config.batchId,
        sampleId: sample.id,
        error: result.error,
        progress: this.progress
      });

      console.log(`  ❌ Sample ${sample.id} failed: ${result.error}`);
    }
  }

  private updateProgress(): void {
    const results = Array.from(this.results.values());

    this.progress = {
      total: results.length,
      pending: results.filter(r => r.status === 'pending').length,
      running: results.filter(r => r.status === 'running').length,
      completed: results.filter(r => r.status === 'completed').length,
      failed: results.filter(r => r.status === 'failed').length,
      percentage: (results.filter(r => r.status === 'completed' || r.status === 'failed').length / results.length) * 100
    };

    // Calculate ETA
    const completedCount = this.progress.completed + this.progress.failed;
    if (completedCount > 0 && this.startedAt) {
      const elapsed = Date.now() - this.startedAt;
      const avgTime = elapsed / completedCount;
      const remaining = this.progress.pending + this.progress.running;
      this.progress.estimatedTimeRemaining = avgTime * remaining;
    }

    this.emitEvent('batch.progress', {
      batchId: this.config.batchId,
      progress: this.progress
    });
  }

  private async generateAIReport(sample: BatchSample, analysis: any): Promise<any> {
    // Mock AI report generation
    await this.delay(500);

    return {
      summary: `Analysis of sample ${sample.id}`,
      findings: [
        'Measurement within normal range',
        'Quality indicators good'
      ],
      anomalies: [],
      confidence: 0.95,
      recommendations: ['Continue monitoring'],
      generatedAt: Date.now()
    };
  }

  private generateMockMeasurements(): any {
    return {
      value1: Math.random() * 100,
      value2: Math.random() * 50,
      value3: Math.random() * 200
    };
  }

  private getRandomProcessingTime(): number {
    // Random time between 1-3 seconds (simulating real analysis)
    return 1000 + Math.random() * 2000;
  }

  getProgress(): BatchProgress {
    return { ...this.progress };
  }

  getResult(sampleId: string): SampleResult | undefined {
    return this.results.get(sampleId);
  }

  getAllResults(): SampleResult[] {
    return Array.from(this.results.values());
  }

  getCompletedResults(): SampleResult[] {
    return this.getAllResults().filter(r => r.status === 'completed');
  }

  getFailedResults(): SampleResult[] {
    return this.getAllResults().filter(r => r.status === 'failed');
  }

  generateReport(): BatchReport {
    const results = this.getAllResults();
    const completedResults = this.getCompletedResults();

    const totalProcessingTime = completedResults.reduce(
      (sum, r) => sum + (r.processingTime || 0),
      0
    );

    const report: BatchReport = {
      batchId: this.config.batchId,
      totalSamples: results.length,
      completedSamples: this.progress.completed,
      failedSamples: this.progress.failed,
      averageProcessingTime: completedResults.length > 0 
        ? totalProcessingTime / completedResults.length 
        : 0,
      totalCost: this.config.pricing.discountedCost,
      results,
      aggregateStatistics: this.calculateStatistics(completedResults),
      generatedAt: Date.now()
    };

    return report;
  }

  private calculateStatistics(results: SampleResult[]): Record<string, any> {
    if (results.length === 0) {
      return {};
    }

    // Calculate aggregate statistics from results
    const measurements = results
      .filter(r => r.analysis?.measurements)
      .map(r => r.analysis.measurements);

    if (measurements.length === 0) {
      return {};
    }

    return {
      sampleCount: measurements.length,
      averageValue1: this.average(measurements.map(m => m.value1)),
      averageValue2: this.average(measurements.map(m => m.value2)),
      averageValue3: this.average(measurements.map(m => m.value3))
    };
  }

  private average(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  exportToCSV(): string {
    const results = this.getAllResults();
    
    let csv = 'Sample ID,Status,Processing Time (ms),Value1,Value2,Value3\n';
    
    results.forEach(result => {
      const measurements = result.analysis?.measurements || {};
      csv += `${result.sampleId},${result.status},${result.processingTime || 0},`;
      csv += `${measurements.value1 || ''},${measurements.value2 || ''},${measurements.value3 || ''}\n`;
    });

    return csv;
  }

  private emitEvent(type: Lab402Event['type'], data: any): void {
    const event: Lab402Event = {
      type,
      timestamp: Date.now(),
      data
    };

    this.emit(type, event);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  get id(): string {
    return this.config.batchId;
  }

  get sampleCount(): number {
    return this.config.request.samples.length;
  }

  get pricing(): any {
    return this.config.pricing;
  }
}
