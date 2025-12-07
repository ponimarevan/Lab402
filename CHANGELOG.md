# Changelog

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
