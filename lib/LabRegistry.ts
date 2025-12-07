import type { LabInfo, InstrumentType, PricingTier } from './types';

export class LabRegistry {
  private labs: Map<string, LabInfo>;

  constructor() {
    this.labs = new Map();
    this.initializeLabs();
  }

  private initializeLabs(): void {
    // Mock lab data - in production would be fetched from API
    const mockLabs: LabInfo[] = [
      {
        id: 'mit-biolab',
        name: 'MIT BioLab',
        location: 'Boston, MA, USA',
        country: 'US',
        instruments: ['dna-sequencer', 'mass-spec', 'nmr'],
        pricing: {
          tier: 'performance',
          instrumentRate: 2.0,
          computeRate: 0.012,
          aiRate: 20.00,
          storageRate: 0.02
        },
        quality: 5,
        availability: 95,
        uptime: 99.9,
        currentLoad: 45,
        coordinates: { lat: 42.3601, lon: -71.0942 },
        certifications: ['ISO-9001', 'CLIA', 'CAP']
      },
      {
        id: 'stanford-lab',
        name: 'Stanford BioLab',
        location: 'Stanford, CA, USA',
        country: 'US',
        instruments: ['dna-sequencer', 'spectroscopy', 'microscopy'],
        pricing: {
          tier: 'standard',
          instrumentRate: 1.5,
          computeRate: 0.008,
          aiRate: 15.00,
          storageRate: 0.015
        },
        quality: 4.5,
        availability: 98,
        uptime: 99.5,
        currentLoad: 30,
        coordinates: { lat: 37.4275, lon: -122.1697 },
        certifications: ['ISO-9001', 'CLIA']
      },
      {
        id: 'oxford-lab',
        name: 'Oxford Research Lab',
        location: 'Oxford, UK',
        country: 'UK',
        instruments: ['dna-sequencer', 'x-ray-diffraction', 'nmr'],
        pricing: {
          tier: 'performance',
          instrumentRate: 2.2,
          computeRate: 0.013,
          aiRate: 22.00,
          storageRate: 0.025
        },
        quality: 5,
        availability: 90,
        uptime: 99.8,
        currentLoad: 65,
        coordinates: { lat: 51.7520, lon: -1.2577 },
        certifications: ['ISO-9001', 'UKAS']
      },
      {
        id: 'tokyo-biotech',
        name: 'Tokyo Biotech Center',
        location: 'Tokyo, Japan',
        country: 'JP',
        instruments: ['spectroscopy', 'microscopy', 'mass-spec'],
        pricing: {
          tier: 'standard',
          instrumentRate: 1.3,
          computeRate: 0.007,
          aiRate: 12.00,
          storageRate: 0.01
        },
        quality: 4,
        availability: 100,
        uptime: 99.0,
        currentLoad: 20,
        coordinates: { lat: 35.6762, lon: 139.6503 },
        certifications: ['ISO-9001']
      },
      {
        id: 'singapore-biolab',
        name: 'Singapore BioLab',
        location: 'Singapore',
        country: 'SG',
        instruments: ['dna-sequencer', 'microscopy', 'spectroscopy'],
        pricing: {
          tier: 'extreme',
          instrumentRate: 3.0,
          computeRate: 0.025,
          aiRate: 30.00,
          storageRate: 0.03
        },
        quality: 5,
        availability: 100,
        uptime: 99.99,
        currentLoad: 15,
        coordinates: { lat: 1.3521, lon: 103.8198 },
        certifications: ['ISO-9001', 'CLIA', 'CAP', 'NABL']
      }
    ];

    mockLabs.forEach(lab => {
      this.labs.set(lab.id, lab);
    });
  }

  getAllLabs(): LabInfo[] {
    return Array.from(this.labs.values());
  }

  getLabById(id: string): LabInfo | undefined {
    return this.labs.get(id);
  }

  getLabsByInstrument(instrument: InstrumentType): LabInfo[] {
    return this.getAllLabs().filter(lab => 
      lab.instruments.includes(instrument)
    );
  }

  getLabsByCountry(country: string): LabInfo[] {
    return this.getAllLabs().filter(lab => 
      lab.country === country
    );
  }

  getLabsByQuality(minQuality: number): LabInfo[] {
    return this.getAllLabs().filter(lab => 
      lab.quality >= minQuality
    );
  }

  getAvailableLabs(instrument: InstrumentType): LabInfo[] {
    return this.getLabsByInstrument(instrument).filter(lab => 
      lab.availability > 0 && lab.currentLoad < 90
    );
  }

  updateLabLoad(labId: string, load: number): void {
    const lab = this.labs.get(labId);
    if (lab) {
      lab.currentLoad = Math.max(0, Math.min(100, load));
    }
  }

  calculateDistance(lab: LabInfo, userLat: number, userLon: number): number {
    if (!lab.coordinates) return Infinity;

    // Haversine formula
    const R = 6371; // Earth radius in km
    const dLat = (lab.coordinates.lat - userLat) * Math.PI / 180;
    const dLon = (lab.coordinates.lon - userLon) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLat * Math.PI / 180) * Math.cos(lab.coordinates.lat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
