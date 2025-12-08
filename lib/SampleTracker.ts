import { EventEmitter } from 'events';
import type {
  TrackedSample,
  SampleMetadata,
  SampleHistory,
  SampleEventType,
  SampleStatus,
  QualityCheck,
  SampleQuery,
  Lab402Event
} from './types';

export class SampleTracker extends EventEmitter {
  private samples: Map<string, TrackedSample>;
  private barcodeIndex: Map<string, string>; // barcode -> sampleId

  constructor() {
    super();
    this.samples = new Map();
    this.barcodeIndex = new Map();
  }

  registerSample(
    id: string,
    type: string,
    metadata: SampleMetadata = {},
    barcode?: string
  ): TrackedSample {
    if (this.samples.has(id)) {
      throw new Error(`Sample ${id} already registered`);
    }

    if (barcode && this.barcodeIndex.has(barcode)) {
      throw new Error(`Barcode ${barcode} already in use`);
    }

    const sample: TrackedSample = {
      id,
      barcode,
      type,
      metadata,
      status: 'registered',
      history: [
        {
          timestamp: Date.now(),
          event: 'registered',
          details: 'Sample registered in system'
        }
      ],
      analyses: [],
      qcChecks: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.samples.set(id, sample);
    
    if (barcode) {
      this.barcodeIndex.set(barcode, id);
    }

    console.log(`📝 Sample registered: ${id}`);
    if (barcode) {
      console.log(`  Barcode: ${barcode}`);
    }
    console.log(`  Type: ${type}`);

    this.emitEvent('sample.registered', { sample });

    return sample;
  }

  updateStatus(
    sampleId: string,
    status: SampleStatus,
    actor?: string,
    details?: string
  ): void {
    const sample = this.samples.get(sampleId);
    
    if (!sample) {
      throw new Error(`Sample ${sampleId} not found`);
    }

    const oldStatus = sample.status;
    sample.status = status;
    sample.updatedAt = Date.now();

    const historyEntry: SampleHistory = {
      timestamp: Date.now(),
      event: this.statusToEvent(status),
      actor,
      details: details || `Status changed: ${oldStatus} → ${status}`
    };

    sample.history.push(historyEntry);

    console.log(`🔄 Sample ${sampleId}: ${oldStatus} → ${status}`);

    this.emitEvent('sample.status.updated', {
      sampleId,
      oldStatus,
      newStatus: status,
      sample
    });
  }

  addHistory(
    sampleId: string,
    event: SampleEventType,
    actor?: string,
    details?: string,
    location?: string
  ): void {
    const sample = this.samples.get(sampleId);
    
    if (!sample) {
      throw new Error(`Sample ${sampleId} not found`);
    }

    const historyEntry: SampleHistory = {
      timestamp: Date.now(),
      event,
      actor,
      details,
      location
    };

    sample.history.push(historyEntry);
    sample.updatedAt = Date.now();

    if (location) {
      sample.location = location;
    }

    this.emitEvent('sample.history.added', {
      sampleId,
      event,
      sample
    });
  }

  addQualityCheck(
    sampleId: string,
    inspector: string,
    passed: boolean,
    metrics?: Record<string, number>,
    notes?: string
  ): void {
    const sample = this.samples.get(sampleId);
    
    if (!sample) {
      throw new Error(`Sample ${sampleId} not found`);
    }

    const qcCheck: QualityCheck = {
      timestamp: Date.now(),
      inspector,
      passed,
      metrics,
      notes
    };

    sample.qcChecks.push(qcCheck);
    sample.updatedAt = Date.now();

    console.log(`✅ QC check: ${sampleId} - ${passed ? 'PASSED' : 'FAILED'}`);

    this.emitEvent('sample.qc.checked', {
      sampleId,
      passed,
      sample
    });
  }

  linkAnalysis(sampleId: string, analysisId: string): void {
    const sample = this.samples.get(sampleId);
    
    if (!sample) {
      throw new Error(`Sample ${sampleId} not found`);
    }

    if (!sample.analyses.includes(analysisId)) {
      sample.analyses.push(analysisId);
      sample.updatedAt = Date.now();

      this.addHistory(
        sampleId,
        'analyzed',
        undefined,
        `Analysis started: ${analysisId}`
      );
    }
  }

  getSample(sampleId: string): TrackedSample | undefined {
    return this.samples.get(sampleId);
  }

  getSampleByBarcode(barcode: string): TrackedSample | undefined {
    const sampleId = this.barcodeIndex.get(barcode);
    return sampleId ? this.samples.get(sampleId) : undefined;
  }

  querySamples(query: SampleQuery): TrackedSample[] {
    let results = Array.from(this.samples.values());

    // Filter by IDs
    if (query.ids && query.ids.length > 0) {
      results = results.filter(s => query.ids!.includes(s.id));
    }

    // Filter by barcodes
    if (query.barcodes && query.barcodes.length > 0) {
      results = results.filter(s => s.barcode && query.barcodes!.includes(s.barcode));
    }

    // Filter by type
    if (query.type) {
      results = results.filter(s => s.type === query.type);
    }

    // Filter by status
    if (query.status) {
      const statuses = Array.isArray(query.status) ? query.status : [query.status];
      results = results.filter(s => statuses.includes(s.status));
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      results = results.filter(s => 
        s.metadata.tags && 
        query.tags!.some(tag => s.metadata.tags!.includes(tag))
      );
    }

    // Filter by origin
    if (query.origin) {
      results = results.filter(s => s.metadata.origin === query.origin);
    }

    // Filter by date range
    if (query.dateRange) {
      results = results.filter(s =>
        s.createdAt >= query.dateRange!.start &&
        s.createdAt <= query.dateRange!.end
      );
    }

    // Filter by location
    if (query.location) {
      results = results.filter(s => s.location === query.location);
    }

    return results;
  }

  getAllSamples(): TrackedSample[] {
    return Array.from(this.samples.values());
  }

  getSamplesByStatus(status: SampleStatus): TrackedSample[] {
    return this.querySamples({ status });
  }

  getSamplesByType(type: string): TrackedSample[] {
    return this.querySamples({ type });
  }

  getSampleHistory(sampleId: string): SampleHistory[] {
    const sample = this.samples.get(sampleId);
    return sample ? sample.history : [];
  }

  getQualityChecks(sampleId: string): QualityCheck[] {
    const sample = this.samples.get(sampleId);
    return sample ? sample.qcChecks : [];
  }

  generateBarcode(prefix: string = 'LAB'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  exportSampleData(sampleId: string): string {
    const sample = this.samples.get(sampleId);
    
    if (!sample) {
      throw new Error(`Sample ${sampleId} not found`);
    }

    return JSON.stringify(sample, null, 2);
  }

  getStatistics() {
    const samples = this.getAllSamples();
    
    const stats = {
      total: samples.length,
      byStatus: {} as Record<SampleStatus, number>,
      byType: {} as Record<string, number>,
      totalQCChecks: 0,
      qcPassRate: 0,
      totalAnalyses: 0
    };

    // Count by status
    samples.forEach(s => {
      stats.byStatus[s.status] = (stats.byStatus[s.status] || 0) + 1;
      stats.byType[s.type] = (stats.byType[s.type] || 0) + 1;
      stats.totalQCChecks += s.qcChecks.length;
      stats.totalAnalyses += s.analyses.length;
    });

    // Calculate QC pass rate
    const allQCChecks = samples.flatMap(s => s.qcChecks);
    if (allQCChecks.length > 0) {
      const passed = allQCChecks.filter(qc => qc.passed).length;
      stats.qcPassRate = (passed / allQCChecks.length) * 100;
    }

    return stats;
  }

  private statusToEvent(status: SampleStatus): SampleEventType {
    const map: Record<SampleStatus, SampleEventType> = {
      'registered': 'registered',
      'stored': 'stored',
      'in-preparation': 'prepared',
      'ready': 'prepared',
      'in-analysis': 'analyzed',
      'completed': 'completed',
      'archived': 'archived',
      'disposed': 'disposed'
    };

    return map[status] || 'created';
  }

  private emitEvent(type: Lab402Event['type'], data: any): void {
    const event: Lab402Event = {
      type: type as any,
      timestamp: Date.now(),
      data
    };

    this.emit(type, event);
  }
}
