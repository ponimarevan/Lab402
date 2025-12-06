import { randomBytes } from 'crypto';
import type { 
  AnalysisRequest, 
  AnalysisMetrics, 
  AnalysisStatus,
  AIReport,
  UnifiedInvoice,
  Lab402Config 
} from './types';
import type { Payment402 } from './Payment402';

interface AnalysisConfig {
  request: AnalysisRequest;
  config: Required<Lab402Config>;
  payment: Payment402;
  invoice: UnifiedInvoice;
}

export class Analysis {
  public readonly id: string;
  private request: AnalysisRequest;
  private config: Required<Lab402Config>;
  private payment: Payment402;
  private invoice: UnifiedInvoice;
  private startTime: number;
  private status: AnalysisStatus;
  private costAccumulated: number;
  private dataGenerated: number;
  private report?: AIReport;

  constructor(config: AnalysisConfig) {
    this.id = randomBytes(16).toString('hex');
    this.request = config.request;
    this.config = config.config;
    this.payment = config.payment;
    this.invoice = config.invoice;
    this.startTime = 0;
    this.status = 'pending';
    this.costAccumulated = 0;
    this.dataGenerated = 0;
  }

  async start(): Promise<void> {
    if (this.status !== 'pending') {
      throw new Error('Analysis already started');
    }

    // Process 402 payment
    await this.payment.processPayment(this.invoice);

    this.status = 'running';
    this.startTime = Date.now();

    // Mock: Start instrument analysis
    console.log(`Starting ${this.request.instrument} analysis...`);
  }

  async run(): Promise<void> {
    if (this.status !== 'running') {
      throw new Error('Analysis not running');
    }

    // Mock: Run analysis pipeline
    this.status = 'processing';
    const instrumentTime = Math.random() * 60000 + 30000; // 30-90s
    await new Promise(resolve => setTimeout(resolve, instrumentTime));

    // Accumulate costs
    this.costAccumulated = this.invoice.instrumentCost;
    this.dataGenerated = Math.random() * 1000000000; // 0-1GB

    // If compute requested, run data processing
    if (this.request.compute) {
      const computeTime = Math.random() * 30000 + 10000; // 10-40s
      await new Promise(resolve => setTimeout(resolve, computeTime));
      this.costAccumulated += this.invoice.computeCost;
    }

    // If AI interpretation requested
    if (this.request.ai?.interpretation) {
      this.status = 'interpreting';
      const aiTime = Math.random() * 20000 + 10000; // 10-30s
      await new Promise(resolve => setTimeout(resolve, aiTime));
      this.costAccumulated += this.invoice.aiCost;

      // Generate AI report
      this.report = await this.generateReport();
    }

    this.status = 'completed';
  }

  private async generateReport(): Promise<AIReport> {
    const report: AIReport = {
      analysisId: this.id,
      summary: `Analysis completed using ${this.request.instrument}. Sample processed successfully.`,
      findings: [
        'Primary peaks identified at expected wavelengths',
        'No contamination detected',
        'Sample purity: 98.7%'
      ],
      anomalies: [],
      confidence: 0.95,
      recommendations: [
        'Recommend repeat analysis for verification',
        'Consider higher resolution for detailed structure'
      ],
      rawData: {
        instrument: this.request.instrument,
        dataSize: this.dataGenerated,
        timestamp: Date.now()
      },
      generatedAt: Date.now()
    };

    if (this.request.ai?.visualization) {
      report.visualizations = [
        'https://lab402.io/reports/' + this.id + '/graph1.png',
        'https://lab402.io/reports/' + this.id + '/graph2.png'
      ];
    }

    if (this.request.ai?.anomalyDetection) {
      // Mock anomaly detection
      if (Math.random() > 0.8) {
        report.anomalies.push('Unexpected peak at 450nm - possible impurity');
      }
    }

    return report;
  }

  async getReport(): Promise<AIReport> {
    if (this.status !== 'completed') {
      throw new Error('Analysis not yet completed');
    }

    if (!this.report) {
      throw new Error('No AI report available');
    }

    return this.report;
  }

  getMetrics(): AnalysisMetrics {
    const elapsed = this.startTime ? Date.now() - this.startTime : 0;

    return {
      instrumentTime: elapsed * 0.6, // Mock: 60% instrument time
      computeTime: this.request.compute ? elapsed * 0.3 : 0, // 30% compute
      aiProcessingTime: this.request.ai ? elapsed * 0.1 : 0, // 10% AI
      totalTime: elapsed,
      costAccumulated: this.costAccumulated,
      dataGenerated: this.dataGenerated,
      status: this.status
    };
  }

  async cancel(): Promise<void> {
    if (this.status === 'completed' || this.status === 'failed') {
      throw new Error('Cannot cancel completed or failed analysis');
    }

    this.status = 'cancelled';
    
    // Partial refund for cancelled analysis
    const refund = this.costAccumulated * 0.5;
    console.log(`Analysis cancelled. Refund: $${refund.toFixed(2)}`);
  }

  getStatus(): AnalysisStatus {
    return this.status;
  }

  getInvoice(): UnifiedInvoice {
    return { ...this.invoice };
  }
}
