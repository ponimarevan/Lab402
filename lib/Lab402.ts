import { EventEmitter } from 'events';
import { Analysis } from './Analysis';
import { Payment402 } from './Payment402';
import { Identity403 } from './Identity403';
import type {
  Lab402Config,
  AnalysisRequest,
  UnifiedInvoice,
  InstrumentAvailability,
  PricingTier,
  ResearcherIdentity,
  EventType,
  Lab402Event,
  InstrumentType
} from './types';

export class Lab402 extends EventEmitter {
  private config: Required<Lab402Config>;
  private payment: Payment402;
  private identity: Identity403;
  private researcherIdentity?: ResearcherIdentity;
  private activeAnalyses: Map<string, Analysis>;

  constructor(config: Lab402Config) {
    super();

    this.config = {
      researcher: config.researcher,
      wallet: config.wallet,
      endpoint: config.endpoint || 'https://api.lab402.io',
      timeout: config.timeout || 60000,
      retries: config.retries || 3
    };

    this.payment = new Payment402(this.config.wallet, this.config.endpoint);
    this.identity = new Identity403(this.config.researcher);
    this.activeAnalyses = new Map();

    this.initialize();
  }

  private async initialize(): Promise<void> {
    // Verify researcher identity
    this.researcherIdentity = await this.identity.verifyIdentity();
    this.emitEvent('identity.verified', { identity: this.researcherIdentity });
  }

  async request(analysisRequest: AnalysisRequest): Promise<Analysis> {
    if (!this.researcherIdentity) {
      throw new Error('Researcher identity not verified');
    }

    // Check access permissions
    await this.identity.checkAccess(analysisRequest.instrument, this.researcherIdentity);

    // Generate unified 402 invoice
    const invoice = this.generateInvoice(analysisRequest);

    // Create analysis instance
    const analysis = new Analysis({
      request: analysisRequest,
      config: this.config,
      payment: this.payment,
      invoice
    });

    this.activeAnalyses.set(analysis.id, analysis);

    // Log access
    await this.identity.logAccess(analysisRequest.instrument, analysis.id);

    this.emitEvent('analysis.requested', { 
      analysisId: analysis.id,
      instrument: analysisRequest.instrument,
      invoice 
    });

    return analysis;
  }

  private generateInvoice(request: AnalysisRequest): UnifiedInvoice {
    const pricing = this.getPricingForTier(request.compute?.tier || 'standard');

    // Calculate costs
    const instrumentCost = this.calculateInstrumentCost(request.instrument);
    const computeCost = request.compute 
      ? this.calculateComputeCost(request.compute, pricing)
      : 0;
    const aiCost = request.ai?.interpretation 
      ? this.calculateAICost(request.ai, pricing)
      : 0;
    const storageCost = 0.01; // $0.01 per analysis for storage

    const totalCost = instrumentCost + computeCost + aiCost + storageCost;

    return {
      analysisId: '', // Will be set by Analysis
      instrumentCost,
      computeCost,
      aiCost,
      storageCost,
      totalCost,
      paymentAddress: this.config.wallet,
      expiresAt: Date.now() + 3600000 // 1 hour
    };
  }

  private calculateInstrumentCost(instrument: InstrumentType): number {
    const baseCosts: Record<InstrumentType, number> = {
      'dna-sequencer': 50.00,
      'spectroscopy': 10.00,
      'microscopy': 15.00,
      'mass-spec': 40.00,
      'nmr': 60.00,
      'x-ray-diffraction': 80.00
    };

    return baseCosts[instrument] || 10.00;
  }

  private calculateComputeCost(compute: any, pricing: PricingTier): number {
    const gpu = compute.gpu || 0;
    const cpu = compute.cpu || 0;
    const estimatedTime = 30000; // 30 seconds

    return (gpu * pricing.computeRate * estimatedTime) / 1000;
  }

  private calculateAICost(ai: any, pricing: PricingTier): number {
    let cost = pricing.aiRate;

    if (ai.visualization) cost += 5.00;
    if (ai.anomalyDetection) cost += 3.00;

    return cost;
  }

  private getPricingForTier(tier: string): PricingTier {
    const tiers: Record<string, PricingTier> = {
      standard: {
        tier: 'standard',
        instrumentRate: 1.0,
        computeRate: 0.004,
        aiRate: 10.00,
        storageRate: 0.01
      },
      performance: {
        tier: 'performance',
        instrumentRate: 2.0,
        computeRate: 0.012,
        aiRate: 20.00,
        storageRate: 0.02
      },
      extreme: {
        tier: 'extreme',
        instrumentRate: 4.0,
        computeRate: 0.032,
        aiRate: 40.00,
        storageRate: 0.04
      }
    };

    return tiers[tier] || tiers.standard;
  }

  async getAvailableInstruments(): Promise<InstrumentAvailability[]> {
    // Mock implementation
    return [
      {
        instrument: 'dna-sequencer',
        available: true,
        location: 'MIT BioLab',
        capabilities: ['Illumina NovaSeq', 'High-throughput', '150 GB/run']
      },
      {
        instrument: 'spectroscopy',
        available: true,
        location: 'Stanford ChemLab',
        capabilities: ['UV-Vis', 'IR', 'Raman']
      },
      {
        instrument: 'microscopy',
        available: false,
        nextAvailable: Date.now() + 3600000,
        location: 'UCSF Imaging',
        capabilities: ['Confocal', 'Electron', 'Super-resolution']
      }
    ];
  }

  async getPricing(): Promise<PricingTier[]> {
    return [
      this.getPricingForTier('standard'),
      this.getPricingForTier('performance'),
      this.getPricingForTier('extreme')
    ];
  }

  getActiveAnalyses(): Analysis[] {
    return Array.from(this.activeAnalyses.values());
  }

  async close(): Promise<void> {
    // Cancel all active analyses
    for (const analysis of this.activeAnalyses.values()) {
      if (analysis.getStatus() === 'running' || analysis.getStatus() === 'processing') {
        await analysis.cancel();
      }
    }

    this.activeAnalyses.clear();
    this.removeAllListeners();
  }

  private emitEvent(type: EventType, data: any): void {
    const event: Lab402Event = {
      type,
      data,
      timestamp: Date.now()
    };
    this.emit(type, event);
  }
}
