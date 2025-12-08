# Changelog

## v1.5.0 - Cost Optimizer (December 2025)

### 💰 Major Update: Multi-Objective Cost Optimization

Automatically find the most cost-effective configuration for your analysis while meeting quality and time requirements.

**Added:**
- **CostOptimizer**: Multi-objective optimization engine for balancing cost, speed, and quality
- **`lab.optimizeCost()`**: Automatically selects optimal lab + AI model + compute tier
- **`lab.runWhatIf()`**: Compare multiple configuration scenarios side-by-side
- **`lab.estimateSavings()`**: Calculate potential savings vs worst-case scenario
- **`lab.comparePrices()`**: Compare prices across all available options
- **4 Optimization Priorities**: `cost`, `speed`, `quality`, `balanced`
- **Advanced Constraints**: `maxCost`, `minQuality`, `maxTime`, `preferredLocations`, `requireCertifications`
- **Automatic Batch Discounts**: 10-30% off based on sample count
- **Alternative Suggestions**: Get multiple good options with pros/cons analysis
- **Detailed Cost Breakdown**: instrument + compute + AI + storage itemization
- **Savings Estimator**: Shows absolute and percentage savings
- **Real-time Price Comparison**: Compare across labs, AI models, and compute tiers

**Features:**

- **Multi-Objective Optimization**: Balance cost, speed, and quality based on priorities
- **Smart Lab Selection**: Automatically chooses best lab from global network (MIT, Stanford, Oxford, Tokyo, Singapore)
- **AI Model Optimization**: Selects optimal model from 7 available options
- **Batch Discount Integration**: Applies volume discounts up to 30%
- **What-If Scenarios**: Test different configurations (sample counts, priorities, budgets)
- **Budget Constraints**: Enforce maximum cost limits with feasibility checking
- **Quality Requirements**: Set minimum quality thresholds for lab and AI selection
- **Time Constraints**: Specify deadline requirements with automatic ETA checking
- **Location Preferences**: Prefer specific regions (US, EU, Asia)
- **Certification Requirements**: Require specific lab certifications (CLIA, CAP, ISO-9001)

**Use Cases:**

```javascript
// Basic optimization
const optimized = lab.optimizeCost({
  instrument: 'dna-sequencer',
  samples: 100,
  constraints: {
    maxCost: 3000,
    minQuality: 4.0,
    priority: 'cost'
  }
});
// Result: Stanford BioLab + Bio-GPT 7B + Performance tier
// Cost: $3,072 (save $1,728 with 20% batch discount)

// What-if scenarios
const scenarios = lab.runWhatIf(baseRequest, [
  { name: 'Double samples', changes: { samples: 200 } },
  { name: 'High quality', changes: { priority: 'quality' } },
  { name: 'Rush job', changes: { priority: 'speed' } }
]);

// Savings estimation
const savings = lab.estimateSavings(request);
// Worst case: $8,000
// Optimized: $3,072
// You save: $4,928 (61.6%)
```

**Savings by Batch Size:**

| Samples | Discount | Example (@ $50/sample) |
|---------|----------|------------------------|
| 10-49   | 10%      | $2,500 → $2,250 |
| 50-99   | 15%      | $5,000 → $4,250 |
| 100-499 | 20%      | $10,000 → $8,000 |
| 500-999 | 25%      | $50,000 → $37,500 |
| 1000+   | 30%      | $100,000 → $70,000 |

**Performance:**
- Optimization completes in < 50ms
- Supports up to 1000+ samples per batch
- Handles complex constraint combinations efficiently

**Documentation:**
- 8 comprehensive examples in `example-cost-optimizer.js`
- Complete API reference and usage patterns
- Real-world use cases for clinical trials, research labs, emergency analyses

---

## v1.4.0 - AI Model Selection (December 2025)

### 🤖 Major Update: AI Model Marketplace

Choose from 7 specialized AI models for optimal analysis quality and cost.

**Added:**
- **AIModelSelector**: Intelligent AI model selection system
- **7 AI Models**: Bio-GPT, Chem-BERT, Protein-Fold, Genomics-LLM, Drug-Discovery, Medical-Vision, Pathology-AI
- **Auto-Selection**: Automatic model recommendation by instrument and priority
- **Model Comparison**: Compare models by cost, accuracy, and capabilities
- **Search & Filter**: Find models by price, accuracy, and features
- **Cost Optimization**: Select by 'cost', 'accuracy', or 'speed' priority

**AI Models Available:**

1. **Bio-GPT 7B** ($0.50/sample, 94.5% accuracy)
   - General biological analysis
   - DNA sequences, proteins, gene expression
   - 7B parameters, 8K context

2. **Chem-BERT Base** ($0.75/sample, 96.2% accuracy)
   - Chemistry & pharmacology
   - Molecular structures, reactions, toxicity
   - 12B parameters

3. **Protein-Fold v3** ($2.00/sample, 98.1% accuracy)
   - Protein structure prediction
   - 3D structures, binding sites, mutations
   - 50B parameters, AlphaFold-derived

4. **Genomics-LLM 70B** ($3.50/sample, 97.8% accuracy)
   - Advanced genomic analysis
   - Variant calling, GWAS, epigenetics
   - 70B parameters, 32K context

5. **Drug-Discovery AI** ($5.00/sample, 95.5% accuracy)
   - Pharmaceutical research
   - Lead compounds, ADMET, clinical trials
   - 100B parameters

6. **Medical-Vision v4** ($1.50/sample, 97.2% accuracy)
   - Medical imaging analysis
   - Disease detection, tumor segmentation
   - 25B parameters, multi-modal

7. **Pathology-AI Pro** ($2.50/sample, 96.8% accuracy)
   - Digital pathology
   - Cell classification, tissue analysis
   - 35B parameters

**New API:**
```typescript
// Auto-select best model
const selection = lab.selectAIModel('dna-sequencer');
console.log(selection.model.name); // "Bio-GPT 7B"

// Select by priority
const costEffective = lab.selectAIModel('dna-sequencer', undefined, 'cost');
const mostAccurate = lab.selectAIModel('dna-sequencer', undefined, 'accuracy');

// Compare models
const comparison = lab.compareAIModels([
  'bio-gpt-7b',
  'genomics-llm-70b'
]);

// Search by criteria
const affordable = lab.searchAIModels({
  maxPrice: 1.00,
  minAccuracy: 95
});

// Use in analysis
const analysis = await lab.requestAnalysis({
  instrument: 'dna-sequencer',
  ai: {
    model: selection.model.id,
    interpretation: true
  }
});
```

**Model Selection:**
```typescript
const selection = lab.selectAIModel('microscopy', 'cell-analysis', 'accuracy');
// {
//   model: MedicalVision,
//   reason: "Highest accuracy (97.2%). Specialized for microscopy analysis.",
//   confidence: 94,
//   alternatives: [PathologyAI, ...]
// }
```

**Comparison:**
```typescript
const comparison = lab.compareAIModels(['bio-gpt-7b', 'genomics-llm-70b']);
// {
//   recommended: BioGPT,
//   alternatives: [{
//     model: GenomicsLLM,
//     pros: ["3.3% more accurate"],
//     cons: ["$3.00 more expensive per sample"],
//     costDiff: 3.00
//   }]
// }
```

**Use Cases:**
- Budget-constrained research: Select cost-optimized models
- Clinical diagnostics: Prioritize accuracy over cost
- High-throughput screening: Balance speed and accuracy
- Specialized analysis: Use domain-specific models

**Cost Savings:**
- Bio-GPT for routine analysis: $0.50/sample
- Genomics-LLM for complex cases: $3.50/sample
- Strategic selection: Save 30-50% on AI costs

**Fixes:**
- Fixed logo file permissions (read-only issue resolved)

---

## v1.3.0 - Sample Tracking & Metadata (December 2025)

### 🔬 Major Update: Sample Tracking System

Track samples through their entire lifecycle with rich metadata, quality checks, and audit logs.

**Added:**
- **SampleTracker**: Complete sample lifecycle management
- **Barcode System**: Auto-generated unique barcodes
- **Sample History**: Full audit trail of all events
- **Quality Checks**: QC metrics and pass/fail tracking
- **Rich Metadata**: Origin, dates, conditions, protocols, tags
- **Query System**: Filter by status, type, tags, dates, location
- **Statistics**: Aggregate stats and QC pass rates
- **Export**: JSON export of sample data

**New API:**
```typescript
// Register sample
const sample = lab.registerSample(
  'sample-001',
  'blood',
  {
    origin: 'Patient-A',
    collectionDate: Date.now(),
    tags: ['clinical-trial']
  },
  barcode
);

// Update status
lab.updateSampleStatus('sample-001', 'in-analysis', 'Tech-1');

// Add QC check
lab.addQualityCheck('sample-001', 'QC-1', true, {
  purity: 98.5,
  concentration: 250
});

// Query samples
const ready = lab.querySamples({ status: 'ready' });
const cohortA = lab.querySamples({ tags: ['cohort-a'] });
```

**Sample Statuses:**
- `registered` - Newly registered
- `stored` - In storage
- `in-preparation` - Being prepared
- `ready` - Ready for analysis
- `in-analysis` - Currently analyzing
- `completed` - Analysis complete
- `archived` - Archived
- `disposed` - Disposed

**Features:**
- Full sample lifecycle tracking
- Barcode generation and lookup
- Event history with timestamps
- QC metrics and pass/fail
- Custom metadata fields
- Multi-criteria queries
- Real-time statistics
- JSON data export

**Events:**
- `sample.registered`: New sample registered
- `sample.status.updated`: Status changed
- `sample.history.added`: Event added to history
- `sample.qc.checked`: QC check performed

**Use Cases:**
- Clinical trials sample management
- Quality control tracking
- Regulatory compliance
- Chain of custody
- Lab inventory management

---

## v1.2.0 - Batch Processing (December 2025)

### 🧪 Major Update: Batch Processing

Process hundreds or thousands of samples simultaneously with automatic parallelization and volume discounts!

**Added:**
- **BatchAnalysis**: Process multiple samples in parallel
- **BatchManager**: Manage and track multiple batches
- **Volume Discounts**: 
  - 10+ samples: 10% discount
  - 50+ samples: 15% discount
  - 100+ samples: 20% discount
  - 500+ samples: 25% discount
  - 1000+ samples: 30% discount
- **Parallel Processing**: Up to 200 samples simultaneously
- **Progress Tracking**: Real-time progress updates
- **Batch Reports**: Aggregate statistics and results
- **CSV Export**: Export batch results to CSV
- **Smart Scheduling**: Automatic parallelism based on volume

**New API:**
```typescript
const batch = await lab.createBatch({
  instrument: 'dna-sequencer',
  samples: [sample1, sample2, ...sample100],
  compute: { gpu: 16 },
  ai: { model: 'bio-gpt', interpretation: true }
});

// Track progress
batch.on('batch.progress', (e) => {
  console.log(`${e.data.progress.percentage}% complete`);
});

await batch.start();

// Get results
const report = batch.generateReport();
const csv = batch.exportToCSV();
```

**Pricing Example:**
```
100 samples at $50 each:
- Base cost: $5,000
- Discount: 20%
- Savings: $1,000
- Final: $4,000
- Per sample: $40
```

**Features:**
- Automatic parallelization (up to 200x)
- Real-time progress updates
- Per-sample status tracking
- Aggregate statistics
- Failed sample handling
- CSV export
- Batch management

**Performance:**
- Process 1000 samples in minutes
- 100x parallelism for large batches
- Smart scheduling based on priority

**Events:**
- `batch.created`: New batch created
- `batch.started`: Batch processing started
- `batch.progress`: Progress update
- `batch.sample.completed`: Individual sample done
- `batch.sample.failed`: Individual sample failed
- `batch.completed`: Entire batch done

---

## v1.1.0 - Multi-Lab Routing (December 2025)

### 🌍 Major Update: Multi-Lab Routing

**Added:**
- **Lab Registry**: Global network of 5+ labs (MIT, Stanford, Oxford, Tokyo, Singapore)
- **Smart Routing**: Automatic lab selection based on strategy
- **5 Routing Strategies**:
  - `cost-optimized`: Choose cheapest lab
  - `fastest`: Choose lab with lowest load
  - `highest-quality`: Choose highest-rated lab
  - `nearest`: Choose closest lab (geographic)
  - `balanced`: Optimal balance of all factors
- **Lab Comparison**: View pricing across all labs
- **Fallback System**: Automatic failover to backup labs
- **Geographic Filtering**: Prefer specific countries/regions
- **Quality Requirements**: Set minimum quality ratings
- **Certification Requirements**: Require specific certifications
- **Cost Limits**: Set maximum cost budgets
- **Real-time Lab Info**: Load, availability, uptime metrics

**New API:**
```typescript
const analysis = await lab.request({
  instrument: 'dna-sequencer',
  routing: {
    strategy: 'cost-optimized',
    maxCost: 80.00,
    minQuality: 4,
    preferredLocations: ['US', 'EU']
  }
});

// Get selected lab
console.log(analysis.selectedLab);

// Compare pricing
const pricing = lab.getLabPricing('dna-sequencer');

// View all labs
const allLabs = lab.getAllLabs();
```

**Labs in Network:**
- MIT BioLab (Boston, USA) - Quality 5/5
- Stanford BioLab (California, USA) - Quality 4.5/5
- Oxford Research Lab (UK) - Quality 5/5
- Tokyo Biotech Center (Japan) - Quality 4/5
- Singapore BioLab (Singapore) - Quality 5/5

**Features:**
- Automatic best lab selection
- Load balancing across network
- Geographic routing optimization
- Quality-based filtering
- Cost optimization
- Fallback handling
- Real-time availability

**Example:**
```typescript
// SDK picks Stanford (cheapest at $48)
const analysis = await lab.request({
  instrument: 'dna-sequencer',
  routing: { strategy: 'cost-optimized' }
});
```

---

## Initial Release (December 2025)

### Core Features

**Added:**
- **Unified 402 Invoice**: Single payment covers instrument, compute, and AI
- **Autonomous Analysis**: Instruments start automatically after payment
- **AI Scientific Reports**: Automated interpretation with graphs and anomalies
- **403 Access Control**: Researcher identity verification and clearance levels
- **Dynamic Compute Leasing**: GPUs auto-rent for data processing
- **Multiple Instruments**: DNA sequencer, spectroscopy, microscopy, mass-spec, NMR, X-ray

**Instruments:**
- DNA Sequencer (Clearance Level 2)
- Spectroscopy (Clearance Level 1)
- Microscopy (Clearance Level 1)
- Mass Spectrometry (Clearance Level 2)
- NMR (Clearance Level 2)
- X-ray Diffraction (Clearance Level 3)

**AI Models:**
- bio-gpt: Molecular biology and genomics
- chem-llm: Chemistry and spectroscopy
- lab-vision: Image analysis and microscopy
- generic: General scientific analysis

**Example:**
```typescript
const lab = new Lab402({
  researcher: '403-key',
  wallet: 'solana-wallet'
});

const analysis = await lab.request({
  instrument: 'dna-sequencer',
  compute: { gpu: 8, vram: 48 },
  ai: { 
    model: 'bio-gpt',
    interpretation: true 
  }
});

await analysis.start(); // 402 payment
await analysis.run();
const report = await analysis.getReport();
```

**Capabilities:**
- Remote laboratory access globally
- Real-time compute allocation
- AI-powered result interpretation
- Automated anomaly detection
- Visualization generation
- Multi-tier pricing (Standard, Performance, Extreme)
- Event-driven architecture
- TypeScript native with full type definitions
- CLI for instrument discovery and pricing
