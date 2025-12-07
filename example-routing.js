import { Lab402 } from '@lab402/sdk';

async function examples() {
  const lab = new Lab402({
    researcher: process.env.RESEARCHER_403_KEY || 'demo-researcher-key',
    wallet: process.env.SOLANA_WALLET || 'demo-wallet-address'
  });

  // Example 1: Cost-optimized routing
  console.log('\n=== Example 1: Cost-Optimized Routing ===\n');

  const costOptimized = await lab.request({
    instrument: 'dna-sequencer',
    sample: { type: 'genomic-dna' },
    routing: {
      strategy: 'cost-optimized',
      maxCost: 80.00,
      minQuality: 4
    }
  });

  console.log('Selected lab:', costOptimized.selectedLab?.name);
  console.log('Location:', costOptimized.selectedLab?.location);
  console.log('Cost:', costOptimized.getInvoice().totalCost);

  // Example 2: Fastest routing
  console.log('\n=== Example 2: Fastest Routing ===\n');

  const fastest = await lab.request({
    instrument: 'spectroscopy',
    sample: { type: 'compound' },
    routing: {
      strategy: 'fastest'
    }
  });

  console.log('Selected lab:', fastest.selectedLab?.name);
  console.log('Current load:', fastest.selectedLab?.currentLoad + '%');
  console.log('Uptime:', fastest.selectedLab?.uptime + '%');

  // Example 3: Highest quality
  console.log('\n=== Example 3: Highest Quality ===\n');

  const highestQuality = await lab.request({
    instrument: 'microscopy',
    sample: { type: 'cell-culture' },
    routing: {
      strategy: 'highest-quality',
      requireCertifications: ['ISO-9001', 'CLIA']
    }
  });

  console.log('Selected lab:', highestQuality.selectedLab?.name);
  console.log('Quality:', highestQuality.selectedLab?.quality + '/5 stars');
  console.log('Certifications:', highestQuality.selectedLab?.certifications.join(', '));

  // Example 4: Geographic routing
  console.log('\n=== Example 4: Geographic Routing ===\n');

  const geographic = await lab.request({
    instrument: 'dna-sequencer',
    sample: { type: 'dna' },
    routing: {
      strategy: 'balanced',
      preferredLocations: ['US'],
      excludeLabs: ['tokyo-biotech']
    }
  });

  console.log('Selected lab:', geographic.selectedLab?.name);
  console.log('Country:', geographic.selectedLab?.country);

  // Example 5: With fallback
  console.log('\n=== Example 5: With Fallback Labs ===\n');

  const withFallback = await lab.request({
    instrument: 'nmr',
    sample: { type: 'protein' },
    routing: {
      strategy: 'cost-optimized',
      fallback: [
        { lab: 'mit-biolab', priority: 1 },
        { lab: 'oxford-lab', priority: 2 }
      ]
    }
  });

  console.log('Selected lab:', withFallback.selectedLab?.name);

  // Example 6: Compare lab pricing
  console.log('\n=== Example 6: Compare Lab Pricing ===\n');

  const pricing = lab.getLabPricing('dna-sequencer');
  
  console.log('Available labs for DNA sequencing:\n');
  pricing.forEach(p => {
    console.log(`${p.labName}:`);
    console.log(`  Price: $${p.price.toFixed(2)}`);
    console.log(`  Quality: ${p.quality}/5 stars`);
    console.log(`  ETA: ${p.eta}`);
    console.log(`  Available: ${p.available ? 'Yes' : 'No'}`);
    console.log('');
  });

  // Example 7: View all labs
  console.log('\n=== Example 7: All Labs in Network ===\n');

  const allLabs = lab.getAllLabs();
  
  allLabs.forEach(labInfo => {
    console.log(`${labInfo.name} (${labInfo.location})`);
    console.log(`  Quality: ${labInfo.quality}/5`);
    console.log(`  Instruments: ${labInfo.instruments.join(', ')}`);
    console.log(`  Load: ${labInfo.currentLoad}%`);
    console.log('');
  });

  // Example 8: Event listening
  console.log('\n=== Example 8: Routing Events ===\n');

  lab.on('lab.selected', (event) => {
    console.log('Lab selected:', event.data.lab.name);
    console.log('Reasoning:', event.data.reasoning);
    
    if (event.data.alternatives.length > 0) {
      console.log('Alternatives:');
      event.data.alternatives.forEach(alt => {
        console.log(`  - ${alt.name} (${alt.location})`);
      });
    }
  });

  const withEvents = await lab.request({
    instrument: 'spectroscopy',
    sample: { type: 'solution' },
    routing: {
      strategy: 'balanced'
    }
  });

  await lab.close();
}

// Run examples
if (require.main === module) {
  examples().catch(console.error);
}

export { examples };
