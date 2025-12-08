// CostOptimizer - Multi-objective optimization engine for Lab402+

import type {
  OptimizationRequest,
  OptimizationResult,
  OptimizationConstraints,
  OptimizationAlternative,
  WhatIfScenario,
  CostBreakdown,
  SavingsEstimate,
  PriceComparison,
} from './cost-optimizer-types';

interface Lab {
  id: string;
  name: string;
  location: string;
  quality: number;
  pricing: { [instrument: string]: number };
  certifications: string[];
  averageLoad: number;
  eta: { [instrument: string]: string };
}

interface AIModel {
  id: string;
  name: string;
  pricing: { perSample: number };
  parameters: { accuracy: number };
  requirements: { minGPU: number; minVRAM: number };
}

interface ComputeTier {
  name: string;
  gpu: number;
  vram: number;
  costPerMs: number;
}

export class CostOptimizer {
  private labs: Lab[] = [];
  private aiModels: AIModel[] = [];
  private computeTiers: ComputeTier[] = [];

  constructor(labs: Lab[], aiModels: AIModel[], computeTiers: ComputeTier[]) {
    this.labs = labs;
    this.aiModels = aiModels;
    this.computeTiers = computeTiers;
  }

  /**
   * Find optimal configuration based on constraints
   */
  optimize(request: OptimizationRequest): OptimizationResult {
    const { instrument, samples, constraints } = request;

    // Filter labs by constraints
    let eligibleLabs = this.filterLabs(instrument, constraints);
    
    // Filter AI models
    let eligibleModels = this.filterAIModels(constraints);
    
    // Select compute tier
    const computeTier = this.selectComputeTier(constraints);

    // Score all combinations
    const combinations = this.scoreCombinations(
      eligibleLabs,
      eligibleModels,
      computeTier,
      instrument,
      samples,
      constraints
    );

    // Get best combination
    const best = combinations[0];

    // Calculate batch discount
    const discount = this.calculateBatchDiscount(samples);
    const savings = best.cost * discount;

    // Build result
    const result: OptimizationResult = {
      lab: {
        id: best.lab.id,
        name: best.lab.name,
        cost: best.lab.pricing[instrument],
        quality: best.lab.quality,
        eta: best.lab.eta[instrument],
        location: best.lab.location,
      },
      aiModel: {
        id: best.aiModel.id,
        name: best.aiModel.name,
        costPerSample: best.aiModel.pricing.perSample,
        accuracy: best.aiModel.parameters.accuracy,
      },
      compute: {
        tier: computeTier.name,
        gpu: computeTier.gpu,
        vram: computeTier.vram,
        costPerMs: computeTier.costPerMs,
      },
      batch: samples >= 10 ? {
        samples,
        discount: discount * 100,
        savings,
      } : undefined,
      totals: {
        baseCost: best.cost,
        discountedCost: best.cost - savings,
        totalSavings: savings,
        estimatedTime: this.parseTime(best.lab.eta[instrument]),
        averageQuality: (best.lab.quality + best.aiModel.parameters.accuracy) / 2,
      },
      alternatives: request.includeAlternatives 
        ? this.generateAlternatives(combinations, best, samples)
        : [],
    };

    return result;
  }

  /**
   * Filter labs by constraints
   */
  private filterLabs(instrument: string, constraints: OptimizationConstraints): Lab[] {
    return this.labs.filter(lab => {
      // Has instrument
      if (!lab.pricing[instrument]) return false;

      // Quality check
      if (constraints.minQuality && lab.quality < constraints.minQuality) return false;

      // Cost check
      if (constraints.maxCost && lab.pricing[instrument] > constraints.maxCost) return false;

      // Location preference
      if (constraints.preferredLocations?.length) {
        const matchesLocation = constraints.preferredLocations.some(loc =>
          lab.location.includes(loc)
        );
        if (!matchesLocation) return false;
      }

      // Certification requirements
      if (constraints.requireCertifications?.length) {
        const hasCerts = constraints.requireCertifications.every(cert =>
          lab.certifications.includes(cert)
        );
        if (!hasCerts) return false;
      }

      return true;
    });
  }

  /**
   * Filter AI models by constraints
   */
  private filterAIModels(constraints: OptimizationConstraints): AIModel[] {
    return this.aiModels.filter(model => {
      // Cost check
      if (constraints.maxCost && model.pricing.perSample > constraints.maxCost) return false;

      // Quality check (accuracy)
      if (constraints.minQuality) {
        const normalizedAccuracy = model.parameters.accuracy / 20; // 0-100 → 0-5
        if (normalizedAccuracy < constraints.minQuality) return false;
      }

      return true;
    });
  }

  /**
   * Select optimal compute tier
   */
  private selectComputeTier(constraints: OptimizationConstraints): ComputeTier {
    const { priority } = constraints;

    if (priority === 'cost') {
      return this.computeTiers[0]; // Standard
    } else if (priority === 'speed') {
      return this.computeTiers[2]; // Extreme
    } else {
      return this.computeTiers[1]; // Performance
    }
  }

  /**
   * Score all lab + AI model combinations
   */
  private scoreCombinations(
    labs: Lab[],
    aiModels: AIModel[],
    computeTier: ComputeTier,
    instrument: string,
    samples: number,
    constraints: OptimizationConstraints
  ) {
    const combinations = [];

    for (const lab of labs) {
      for (const aiModel of aiModels) {
        const instrumentCost = lab.pricing[instrument];
        const aiCost = aiModel.pricing.perSample * samples;
        const computeCost = computeTier.costPerMs * 3000 * samples; // ~3s per sample
        const storageCost = 0.01 * samples;

        const totalCost = instrumentCost + aiCost + computeCost + storageCost;

        // Score based on priority
        let score = 0;
        if (constraints.priority === 'cost') {
          score = 1 / totalCost; // Lower cost = higher score
        } else if (constraints.priority === 'speed') {
          const timeMs = this.parseTime(lab.eta[instrument]);
          score = 1 / timeMs; // Lower time = higher score
        } else if (constraints.priority === 'quality') {
          score = (lab.quality + aiModel.parameters.accuracy / 20) / 2; // Higher quality = higher score
        } else {
          // Balanced: normalize and average all metrics
          const costScore = 1 / totalCost;
          const timeScore = 1 / this.parseTime(lab.eta[instrument]);
          const qualityScore = (lab.quality + aiModel.parameters.accuracy / 20) / 2;
          score = (costScore * 1000 + timeScore * 0.001 + qualityScore) / 3;
        }

        combinations.push({ lab, aiModel, cost: totalCost, score });
      }
    }

    // Sort by score (descending)
    return combinations.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate batch discount percentage
   */
  private calculateBatchDiscount(samples: number): number {
    if (samples >= 1000) return 0.30;
    if (samples >= 500) return 0.25;
    if (samples >= 100) return 0.20;
    if (samples >= 50) return 0.15;
    if (samples >= 10) return 0.10;
    return 0;
  }

  /**
   * Generate alternative suggestions
   */
  private generateAlternatives(
    combinations: any[],
    best: any,
    samples: number
  ): OptimizationAlternative[] {
    const alternatives: OptimizationAlternative[] = [];

    // Top 3 alternatives
    for (let i = 1; i < Math.min(4, combinations.length); i++) {
      const alt = combinations[i];
      const discount = this.calculateBatchDiscount(samples);
      const altCost = alt.cost * (1 - discount);
      const bestCost = best.cost * (1 - discount);

      const changes: string[] = [];
      if (alt.lab.id !== best.lab.id) {
        changes.push(`Use ${alt.lab.name} instead of ${best.lab.name}`);
      }
      if (alt.aiModel.id !== best.aiModel.id) {
        changes.push(`Use ${alt.aiModel.name} instead of ${best.aiModel.name}`);
      }

      alternatives.push({
        description: `Alternative #${i}`,
        changes,
        cost: altCost,
        savings: bestCost - altCost,
        quality: (alt.lab.quality + alt.aiModel.parameters.accuracy / 20) / 2,
        time: alt.lab.eta[Object.keys(alt.lab.pricing)[0]],
      });
    }

    return alternatives;
  }

  /**
   * Run what-if scenarios
   */
  runWhatIf(
    baseRequest: OptimizationRequest,
    scenarios: Array<{ name: string; changes: any }>
  ): WhatIfScenario[] {
    const results: WhatIfScenario[] = [];

    for (const scenario of scenarios) {
      const modifiedRequest = {
        ...baseRequest,
        samples: scenario.changes.samples ?? baseRequest.samples,
        constraints: {
          ...baseRequest.constraints,
          ...scenario.changes,
        },
      };

      const result = this.optimize(modifiedRequest);

      results.push({
        name: scenario.name,
        changes: scenario.changes,
        result,
      });
    }

    return results;
  }

  /**
   * Estimate savings vs worst-case scenario
   */
  estimateSavings(request: OptimizationRequest): SavingsEstimate {
    // Worst case: most expensive lab + AI + compute
    const worstLab = this.labs.reduce((max, lab) => 
      (lab.pricing[request.instrument] || 0) > (max.pricing[request.instrument] || 0) ? lab : max
    );
    const worstAI = this.aiModels.reduce((max, ai) => 
      ai.pricing.perSample > max.pricing.perSample ? ai : max
    );
    const worstCompute = this.computeTiers[this.computeTiers.length - 1];

    const worstCost = this.calculateTotalCost(
      worstLab,
      worstAI,
      worstCompute,
      request.instrument,
      request.samples
    );

    // Optimized
    const optimized = this.optimize(request);
    const optimizedCost = optimized.totals.discountedCost;

    const savings = worstCost.total - optimizedCost;
    const percentage = (savings / worstCost.total) * 100;

    return {
      worstCase: worstCost,
      optimized: {
        instrument: optimized.lab.cost,
        compute: optimized.compute.costPerMs * 3000 * request.samples,
        ai: optimized.aiModel.costPerSample * request.samples,
        storage: 0.01 * request.samples,
        subtotal: optimized.totals.baseCost,
        discount: optimized.totals.totalSavings,
        total: optimizedCost,
      },
      savings: {
        absolute: savings,
        percentage,
      },
      recommendations: this.generateRecommendations(optimized, request),
    };
  }

  /**
   * Compare prices across different options
   */
  comparePrices(request: OptimizationRequest): PriceComparison[] {
    const optimized = this.optimize(request);
    const comparisons: PriceComparison[] = [];

    // Lab comparison
    const labOptions = this.labs
      .filter(lab => lab.pricing[request.instrument])
      .map(lab => ({
        name: lab.name,
        value: lab.quality,
        cost: lab.pricing[request.instrument],
        selected: lab.id === optimized.lab.id,
      }));

    comparisons.push({
      metric: 'Laboratory',
      options: labOptions,
    });

    // AI model comparison
    const aiOptions = this.aiModels.map(model => ({
      name: model.name,
      value: model.parameters.accuracy,
      cost: model.pricing.perSample * request.samples,
      selected: model.id === optimized.aiModel.id,
    }));

    comparisons.push({
      metric: 'AI Model',
      options: aiOptions,
    });

    // Compute tier comparison
    const computeOptions = this.computeTiers.map(tier => ({
      name: tier.name,
      value: tier.gpu,
      cost: tier.costPerMs * 3000 * request.samples,
      selected: tier.name === optimized.compute.tier,
    }));

    comparisons.push({
      metric: 'Compute Tier',
      options: computeOptions,
    });

    return comparisons;
  }

  /**
   * Calculate total cost for a specific configuration
   */
  private calculateTotalCost(
    lab: Lab,
    aiModel: AIModel,
    computeTier: ComputeTier,
    instrument: string,
    samples: number
  ): CostBreakdown {
    const instrumentCost = lab.pricing[instrument];
    const computeCost = computeTier.costPerMs * 3000 * samples;
    const aiCost = aiModel.pricing.perSample * samples;
    const storageCost = 0.01 * samples;

    const subtotal = instrumentCost + computeCost + aiCost + storageCost;
    const discount = this.calculateBatchDiscount(samples) * subtotal;
    const total = subtotal - discount;

    return {
      instrument: instrumentCost,
      compute: computeCost,
      ai: aiCost,
      storage: storageCost,
      subtotal,
      discount,
      total,
    };
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    result: OptimizationResult,
    request: OptimizationRequest
  ): string[] {
    const recommendations: string[] = [];

    // Batch size recommendation
    if (request.samples < 10) {
      recommendations.push('Increase batch size to 10+ samples to get 10% discount');
    } else if (request.samples < 50) {
      recommendations.push('Increase batch size to 50+ samples to get 15% discount');
    }

    // Quality vs cost tradeoff
    if (result.aiModel.accuracy < 95 && request.constraints.priority === 'cost') {
      recommendations.push('Consider higher accuracy AI model if quality is important');
    }

    // Time optimization
    if (result.totals.estimatedTime > 3600000) { // > 1 hour
      recommendations.push('Consider using priority queue or faster lab for urgent analyses');
    }

    // Location optimization
    if (!request.constraints.preferredLocations) {
      recommendations.push('Specify preferred locations to reduce shipping time/cost');
    }

    return recommendations;
  }

  /**
   * Parse time string to milliseconds
   */
  private parseTime(timeStr: string): number {
    const match = timeStr.match(/(\d+)([smhd])/);
    if (!match) return 0;

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers: { [key: string]: number } = {
      's': 1000,
      'm': 60000,
      'h': 3600000,
      'd': 86400000,
    };

    return value * multipliers[unit];
  }
}
