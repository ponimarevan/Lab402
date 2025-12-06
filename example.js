import { Lab402 } from '@lab402/sdk';

async function example() {
  // Initialize Lab402 with researcher identity and wallet
  const lab = new Lab402({
    researcher: process.env.RESEARCHER_403_KEY || 'demo-researcher-key',
    wallet: process.env.SOLANA_WALLET || 'demo-wallet-address'
  });

  // Listen for events
  lab.on('analysis.requested', (event) => {
    console.log('Analysis requested:', event.data.instrument);
  });

  lab.on('analysis.completed', (event) => {
    console.log('Analysis completed!');
  });

  // Example 1: DNA Sequencing with AI interpretation
  console.log('\n=== Example 1: DNA Sequencing ===\n');
  
  const sequencing = await lab.request({
    instrument: 'dna-sequencer',
    sample: {
      type: 'genomic-dna',
      concentration: '50 ng/μL',
      volume: '20 μL'
    },
    compute: {
      gpu: 4,
      vram: 32,
      tier: 'performance'
    },
    ai: {
      model: 'bio-gpt',
      interpretation: true,
      visualization: true,
      anomalyDetection: true
    }
  });

  // View invoice before starting
  const invoice = sequencing.getInvoice();
  console.log('Unified 402 Invoice:');
  console.log(`  Instrument: $${invoice.instrumentCost.toFixed(2)}`);
  console.log(`  Compute: $${invoice.computeCost.toFixed(2)}`);
  console.log(`  AI: $${invoice.aiCost.toFixed(2)}`);
  console.log(`  Storage: $${invoice.storageCost.toFixed(2)}`);
  console.log(`  Total: $${invoice.totalCost.toFixed(2)}\n`);

  // Start analysis (processes 402 payment)
  await sequencing.start();

  // Run the analysis
  await sequencing.run();

  // Get AI-generated report
  const report = await sequencing.getReport();
  console.log('\nAI Report:');
  console.log('Summary:', report.summary);
  console.log('Findings:', report.findings);
  console.log('Confidence:', (report.confidence * 100).toFixed(1) + '%');
  
  if (report.anomalies.length > 0) {
    console.log('Anomalies:', report.anomalies);
  }

  // Get metrics
  const metrics = sequencing.getMetrics();
  console.log('\nMetrics:');
  console.log(`  Total Time: ${(metrics.totalTime / 1000).toFixed(2)}s`);
  console.log(`  Cost: $${metrics.costAccumulated.toFixed(2)}`);
  console.log(`  Data Generated: ${(metrics.dataGenerated / 1000000).toFixed(2)} MB`);

  // Example 2: Spectroscopy (simple, no AI)
  console.log('\n\n=== Example 2: Spectroscopy ===\n');

  const spectro = await lab.request({
    instrument: 'spectroscopy',
    sample: {
      type: 'chemical-compound',
      state: 'solution'
    }
  });

  await spectro.start();
  await spectro.run();

  const spectroMetrics = spectro.getMetrics();
  console.log('Spectroscopy completed!');
  console.log(`Cost: $${spectroMetrics.costAccumulated.toFixed(2)}`);

  // Example 3: Check available instruments
  console.log('\n\n=== Available Instruments ===\n');

  const instruments = await lab.getAvailableInstruments();
  instruments.forEach(inst => {
    console.log(`${inst.instrument}: ${inst.available ? 'Available' : 'Busy'}`);
    console.log(`  Location: ${inst.location}`);
    console.log(`  Capabilities: ${inst.capabilities.join(', ')}`);
  });

  // Example 4: View pricing
  console.log('\n\n=== Pricing Tiers ===\n');

  const pricing = await lab.getPricing();
  pricing.forEach(tier => {
    console.log(`${tier.tier.toUpperCase()}:`);
    console.log(`  Compute: $${tier.computeRate}/ms`);
    console.log(`  AI: $${tier.aiRate}/request`);
  });

  // Close all active analyses
  await lab.close();
}

// Run example
if (require.main === module) {
  example().catch(console.error);
}

export { example };
