import type { 
  LabInfo, 
  InstrumentType, 
  RoutingOptions, 
  LabSelection,
  LabPricing 
} from './types';
import { LabRegistry } from './LabRegistry';

export class Router {
  private registry: LabRegistry;
  private userLocation?: { lat: number; lon: number };

  constructor(registry: LabRegistry, userLocation?: { lat: number; lon: number }) {
    this.registry = registry;
    this.userLocation = userLocation;
  }

  selectLab(
    instrument: InstrumentType,
    routing?: RoutingOptions
  ): LabSelection {
    // Get available labs for this instrument
    let candidates = this.registry.getAvailableLabs(instrument);

    if (candidates.length === 0) {
      throw new Error(`No labs available for ${instrument}`);
    }

    // Apply filters
    candidates = this.applyFilters(candidates, routing);

    if (candidates.length === 0) {
      throw new Error('No labs match routing criteria');
    }

    // Select best lab based on strategy
    const strategy = routing?.strategy || 'balanced';
    const selected = this.selectByStrategy(candidates, strategy, routing);

    // Get alternatives
    const alternatives = candidates
      .filter(lab => lab.id !== selected.id)
      .slice(0, 3);

    return {
      lab: selected,
      score: this.calculateScore(selected, strategy, routing),
      reasoning: this.generateReasoning(selected, strategy),
      alternatives
    };
  }

  private applyFilters(labs: LabInfo[], routing?: RoutingOptions): LabInfo[] {
    let filtered = labs;

    if (!routing) return filtered;

    // Max cost filter
    if (routing.maxCost !== undefined) {
      filtered = filtered.filter(lab => {
        const baseCost = this.estimateCost(lab);
        return baseCost <= routing.maxCost!;
      });
    }

    // Min quality filter
    if (routing.minQuality !== undefined) {
      filtered = filtered.filter(lab => lab.quality >= routing.minQuality!);
    }

    // Max distance filter
    if (routing.maxDistance !== undefined && this.userLocation) {
      filtered = filtered.filter(lab => {
        const distance = this.registry.calculateDistance(
          lab,
          this.userLocation!.lat,
          this.userLocation!.lon
        );
        return distance <= routing.maxDistance!;
      });
    }

    // Preferred locations filter
    if (routing.preferredLocations && routing.preferredLocations.length > 0) {
      filtered = filtered.filter(lab =>
        routing.preferredLocations!.includes(lab.country)
      );
    }

    // Exclude labs filter
    if (routing.excludeLabs && routing.excludeLabs.length > 0) {
      filtered = filtered.filter(lab =>
        !routing.excludeLabs!.includes(lab.id)
      );
    }

    // Required certifications filter
    if (routing.requireCertifications && routing.requireCertifications.length > 0) {
      filtered = filtered.filter(lab =>
        routing.requireCertifications!.every(cert =>
          lab.certifications.includes(cert)
        )
      );
    }

    return filtered;
  }

  private selectByStrategy(
    labs: LabInfo[],
    strategy: string,
    routing?: RoutingOptions
  ): LabInfo {
    const scores = labs.map(lab => ({
      lab,
      score: this.calculateScore(lab, strategy, routing)
    }));

    scores.sort((a, b) => b.score - a.score);

    return scores[0].lab;
  }

  private calculateScore(
    lab: LabInfo,
    strategy: string,
    routing?: RoutingOptions
  ): number {
    let score = 0;

    switch (strategy) {
      case 'cost-optimized':
        // Lower cost = higher score
        const cost = this.estimateCost(lab);
        score = 100 - (cost / 2); // Normalize to 0-100
        break;

      case 'fastest':
        // Lower load and higher uptime = higher score
        score = (100 - lab.currentLoad) * 0.7 + lab.uptime * 0.3;
        break;

      case 'highest-quality':
        // Quality is main factor
        score = lab.quality * 20; // Convert 1-5 to 0-100
        break;

      case 'nearest':
        // Distance is main factor
        if (this.userLocation && lab.coordinates) {
          const distance = this.registry.calculateDistance(
            lab,
            this.userLocation.lat,
            this.userLocation.lon
          );
          score = Math.max(0, 100 - (distance / 100)); // Closer = higher score
        } else {
          score = 50; // Default if no location data
        }
        break;

      case 'balanced':
      default:
        // Balance all factors
        const costScore = 100 - (this.estimateCost(lab) / 2);
        const qualityScore = lab.quality * 20;
        const availabilityScore = (100 - lab.currentLoad) * 0.5 + lab.availability * 0.5;
        const uptimeScore = lab.uptime;

        score = (
          costScore * 0.3 +
          qualityScore * 0.3 +
          availabilityScore * 0.2 +
          uptimeScore * 0.2
        );
        break;
    }

    return score;
  }

  private estimateCost(lab: LabInfo): number {
    // Estimate base cost for typical analysis
    const instrumentCost = 50 * lab.pricing.instrumentRate;
    const computeCost = 10 * lab.pricing.computeRate;
    const aiCost = lab.pricing.aiRate;
    
    return instrumentCost + computeCost + aiCost;
  }

  private generateReasoning(lab: LabInfo, strategy: string): string {
    const reasons: string[] = [];

    switch (strategy) {
      case 'cost-optimized':
        reasons.push(`Lowest cost at ~$${this.estimateCost(lab).toFixed(2)}`);
        break;
      case 'fastest':
        reasons.push(`Low load (${lab.currentLoad}%) and high uptime (${lab.uptime}%)`);
        break;
      case 'highest-quality':
        reasons.push(`Highest quality rating (${lab.quality}/5 stars)`);
        break;
      case 'nearest':
        reasons.push(`Closest to your location`);
        break;
      case 'balanced':
        reasons.push(`Best overall balance of cost, quality, and availability`);
        break;
    }

    if (lab.quality >= 4.5) {
      reasons.push(`Excellent quality (${lab.quality}/5)`);
    }

    if (lab.uptime >= 99.5) {
      reasons.push(`High reliability (${lab.uptime}% uptime)`);
    }

    if (lab.certifications.length > 2) {
      reasons.push(`Multiple certifications: ${lab.certifications.join(', ')}`);
    }

    return reasons.join('. ');
  }

  getLabPricing(instrument: InstrumentType): LabPricing[] {
    const labs = this.registry.getLabsByInstrument(instrument);

    return labs.map(lab => ({
      lab: lab.id,
      labName: lab.name,
      price: this.estimateCost(lab),
      quality: lab.quality,
      eta: this.estimateETA(lab),
      available: lab.availability > 0 && lab.currentLoad < 90
    })).sort((a, b) => a.price - b.price);
  }

  private estimateETA(lab: LabInfo): string {
    // Estimate time based on current load
    if (lab.currentLoad < 30) return '30 minutes';
    if (lab.currentLoad < 60) return '1-2 hours';
    if (lab.currentLoad < 80) return '2-4 hours';
    return '4+ hours';
  }

  tryFallback(
    instrument: InstrumentType,
    routing?: RoutingOptions
  ): LabInfo | null {
    if (!routing?.fallback || routing.fallback.length === 0) {
      return null;
    }

    // Sort by priority
    const sorted = routing.fallback.sort((a, b) => a.priority - b.priority);

    // Try each fallback lab
    for (const fallback of sorted) {
      const lab = this.registry.getLabById(fallback.lab);
      if (lab && lab.availability > 0 && lab.currentLoad < 90) {
        return lab;
      }
    }

    return null;
  }
}
