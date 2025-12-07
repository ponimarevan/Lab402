import type {
  BatchRequest,
  BatchPricing,
  BatchAnalysisConfig,
  InstrumentType
} from './types';
import { BatchAnalysis } from './BatchAnalysis';
import { Payment402 } from './Payment402';

export class BatchManager {
  private batches: Map<string, BatchAnalysis>;
  private payment: Payment402;

  constructor(payment: Payment402) {
    this.batches = new Map();
    this.payment = payment;
  }

  calculateBatchPricing(
    instrument: InstrumentType,
    sampleCount: number,
    basePrice: number
  ): BatchPricing {
    const baseCost = basePrice * sampleCount;

    // Tiered discount rates
    let discountRate = 0;

    if (sampleCount >= 1000) {
      discountRate = 0.30; // 30% discount for 1000+
    } else if (sampleCount >= 500) {
      discountRate = 0.25; // 25% discount for 500+
    } else if (sampleCount >= 100) {
      discountRate = 0.20; // 20% discount for 100+
    } else if (sampleCount >= 50) {
      discountRate = 0.15; // 15% discount for 50+
    } else if (sampleCount >= 10) {
      discountRate = 0.10; // 10% discount for 10+
    }

    const savings = baseCost * discountRate;
    const discountedCost = baseCost - savings;
    const perSampleCost = discountedCost / sampleCount;

    console.log(`\n💰 Batch Pricing:`);
    console.log(`Samples: ${sampleCount}`);
    console.log(`Base cost: $${baseCost.toFixed(2)}`);
    console.log(`Discount: ${(discountRate * 100).toFixed(0)}%`);
    console.log(`Savings: $${savings.toFixed(2)}`);
    console.log(`Final cost: $${discountedCost.toFixed(2)}`);
    console.log(`Per sample: $${perSampleCost.toFixed(2)}`);

    return {
      baseCost,
      totalSamples: sampleCount,
      discountRate,
      discountedCost,
      savings,
      perSampleCost
    };
  }

  createBatch(request: BatchRequest, basePrice: number): BatchAnalysis {
    const batchId = this.generateBatchId();

    // Calculate pricing with discounts
    const pricing = this.calculateBatchPricing(
      request.instrument,
      request.samples.length,
      basePrice
    );

    // Determine parallelism based on sample count and priority
    const parallelism = this.determineParallelism(
      request.samples.length,
      request.priority
    );

    const config: BatchAnalysisConfig = {
      batchId,
      request,
      pricing,
      parallelism
    };

    const batch = new BatchAnalysis(config, this.payment);
    this.batches.set(batchId, batch);

    console.log(`\n✅ Batch created: ${batchId}`);

    return batch;
  }

  private determineParallelism(sampleCount: number, priority?: string): number {
    // Base parallelism on sample count and priority
    let parallelism = 10; // Default

    if (sampleCount < 10) {
      parallelism = sampleCount;
    } else if (sampleCount < 50) {
      parallelism = 10;
    } else if (sampleCount < 100) {
      parallelism = 20;
    } else if (sampleCount < 500) {
      parallelism = 50;
    } else {
      parallelism = 100;
    }

    // Adjust for priority
    if (priority === 'high') {
      parallelism = Math.min(parallelism * 2, 200);
    } else if (priority === 'low') {
      parallelism = Math.max(Math.floor(parallelism / 2), 5);
    }

    return parallelism;
  }

  getBatch(batchId: string): BatchAnalysis | undefined {
    return this.batches.get(batchId);
  }

  getAllBatches(): BatchAnalysis[] {
    return Array.from(this.batches.values());
  }

  getActiveBatches(): BatchAnalysis[] {
    return this.getAllBatches().filter(batch => {
      const progress = batch.getProgress();
      return progress.percentage < 100;
    });
  }

  getCompletedBatches(): BatchAnalysis[] {
    return this.getAllBatches().filter(batch => {
      const progress = batch.getProgress();
      return progress.percentage === 100;
    });
  }

  deleteBatch(batchId: string): boolean {
    return this.batches.delete(batchId);
  }

  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getTotalSamplesProcessed(): number {
    return this.getAllBatches().reduce((sum, batch) => {
      return sum + batch.getProgress().completed;
    }, 0);
  }

  getTotalCost(): number {
    return this.getAllBatches().reduce((sum, batch) => {
      return sum + batch.pricing.discountedCost;
    }, 0);
  }

  getTotalSavings(): number {
    return this.getAllBatches().reduce((sum, batch) => {
      return sum + batch.pricing.savings;
    }, 0);
  }
}
