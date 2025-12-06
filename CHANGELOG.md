# Changelog

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
