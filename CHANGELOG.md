# Changelog

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
