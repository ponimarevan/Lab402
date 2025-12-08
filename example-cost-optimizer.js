// Cost Optimizer Examples - Lab402+ v1.5.0

import { Lab402 } from '@lab402/sdk';

const lab = new Lab402({
  researcher: process.env.RESEARCHER_403_KEY,
  wallet: process.env.SOLANA_WALLET
});

// ============================================
// Example 1: Basic Cost Optimization
// ============================================
async function basicOptimization() {
  console.log('=== Basic Cost Optimization ===\n');

  const optimized = lab.optimizeCost({
    instrument: 'dna-sequencer',
    samples: 100,
    constraints: {
      maxCost: 3000,
      minQuality: 4.0,
      priority: 'cost'
    }
  });

  console.log('Selected Lab:', optimized.lab.name);
  console.log('  Cost:', `$${optimized.lab.cost}`);
  console.log('  Quality:', `${optimized.lab.quality}/5`);
  console.log('  ETA:', optimized.lab.eta);

  console.log('\nSelected AI Model:', optimized.aiModel.name);
  console.log('  Cost per sample:', `$${optimized.aiModel.costPerSample}`);
  console.log('  Accuracy:', `${optimized.aiModel.accuracy}%`);

  console.log('\nCompute:', optimized.compute.tier);
  console.log('  GPU:', `${optimized.compute.gpu}x`);
  console.log('  VRAM:', `${optimized.compute.vram}GB`);

  if (optimized.batch) {
    console.log('\nBatch Discount:');
    console.log('  Samples:', optimized.batch.samples);
    console.log('  Discount:', `${optimized.batch.discount}%`);
    console.log('  Savings:', `$${optimized.batch.savings.toFixed(2)}`);
  }

  console.log('\n--- Totals ---');
  console.log('Base cost:', `$${optimized.totals.baseCost.toFixed(2)}`);
  console.log('Discounted:', `$${optimized.totals.discountedCost.toFixed(2)}`);
  console.log('Total savings:', `$${optimized.totals.totalSavings.toFixed(2)}`);
  console.log('Avg quality:', optimized.totals.averageQuality.toFixed(1));
}

// ============================================
// Example 2: Priority-Based Optimization
// ============================================
async function priorityComparison() {
  console.log('\n=== Priority Comparison ===\n');

  const priorities = ['cost', 'speed', 'quality', 'balanced'] as const;

  for (const priority of priorities) {
    const result = lab.optimizeCost({
      instrument: 'dna-sequencer',
      samples: 50,
      constraints: { priority }
    });

    console.log(`\n${priority.toUpperCase()}:`);
    console.log('  Lab:', result.lab.name);
    console.log('  AI:', result.aiModel.name);
    console.log('  Cost:', `$${result.totals.discountedCost.toFixed(2)}`);
    console.log('  Quality:', result.totals.averageQuality.toFixed(1));
    console.log('  Time:', result.lab.eta);
  }
}

// ============================================
// Example 3: What-If Scenarios
// ============================================
async function whatIfScenarios() {
  console.log('\n=== What-If Scenarios ===\n');

  const scenarios = lab.runWhatIf({
    instrument: 'dna-sequencer',
    samples: 100,
    constraints: { priority: 'cost', maxCost: 3000 }
  }, [
    {
      name: 'Double samples (200)',
      changes: { samples: 200 }
    },
    {
      name: 'High quality mode',
      changes: { priority: 'quality', minQuality: 4.5 }
    },
    {
      name: 'Rush job (speed)',
      changes: { priority: 'speed' }
    },
    {
      name: 'Budget cut ($2000)',
      changes: { maxCost: 2000 }
    }
  ]);

  scenarios.forEach(scenario => {
    const r = scenario.result;
    console.log(`\n${scenario.name}:`);
    console.log('  Lab:', r.lab.name);
    console.log('  AI:', r.aiModel.name);
    console.log('  Cost:', `$${r.totals.discountedCost.toFixed(2)}`);
    console.log('  Quality:', r.totals.averageQuality.toFixed(1));
    console.log('  Savings:', `$${r.totals.totalSavings.toFixed(2)}`);
  });
}

// ============================================
// Example 4: Savings Estimation
// ============================================
async function savingsEstimation() {
  console.log('\n=== Savings Estimation ===\n');

  const savings = lab.estimateSavings({
    instrument: 'dna-sequencer',
    samples: 100,
    constraints: { priority: 'cost' }
  });

  console.log('Worst Case (most expensive):');
  console.log('  Instrument:', `$${savings.worstCase.instrument.toFixed(2)}`);
  console.log('  Compute:', `$${savings.worstCase.compute.toFixed(2)}`);
  console.log('  AI:', `$${savings.worstCase.ai.toFixed(2)}`);
  console.log('  Storage:', `$${savings.worstCase.storage.toFixed(2)}`);
  console.log('  Total:', `$${savings.worstCase.total.toFixed(2)}`);

  console.log('\nOptimized:');
  console.log('  Instrument:', `$${savings.optimized.instrument.toFixed(2)}`);
  console.log('  Compute:', `$${savings.optimized.compute.toFixed(2)}`);
  console.log('  AI:', `$${savings.optimized.ai.toFixed(2)}`);
  console.log('  Storage:', `$${savings.optimized.storage.toFixed(2)}`);
  console.log('  Discount:', `-$${savings.optimized.discount.toFixed(2)}`);
  console.log('  Total:', `$${savings.optimized.total.toFixed(2)}`);

  console.log('\n💰 YOU SAVE:');
  console.log('  Amount:', `$${savings.savings.absolute.toFixed(2)}`);
  console.log('  Percentage:', `${savings.savings.percentage.toFixed(1)}%`);

  if (savings.recommendations.length > 0) {
    console.log('\n📝 Recommendations:');
    savings.recommendations.forEach(rec => {
      console.log('  -', rec);
    });
  }
}

// ============================================
// Example 5: Price Comparison
// ============================================
async function priceComparison() {
  console.log('\n=== Price Comparison ===\n');

  const comparison = lab.comparePrices({
    instrument: 'dna-sequencer',
    samples: 100,
    constraints: { priority: 'balanced' }
  });

  comparison.forEach(category => {
    console.log(`\n${category.metric}:`);
    
    // Sort by cost
    const sorted = [...category.options].sort((a, b) => a.cost - b.cost);
    
    sorted.forEach(option => {
      const marker = option.selected ? '✓' : ' ';
      const costStr = `$${option.cost.toFixed(2)}`.padEnd(10);
      const valueStr = `(value: ${option.value})`;
      
      console.log(`  [${marker}] ${option.name.padEnd(20)} ${costStr} ${valueStr}`);
    });
  });
}

// ============================================
// Example 6: Large Batch Optimization
// ============================================
async function largeBatchOptimization() {
  console.log('\n=== Large Batch Optimization ===\n');

  const sampleCounts = [10, 50, 100, 500, 1000];

  console.log('Batch Size | Base Cost | Discount | Final Cost | Savings');
  console.log('-----------|-----------|----------|------------|--------');

  for (const samples of sampleCounts) {
    const result = lab.optimizeCost({
      instrument: 'dna-sequencer',
      samples,
      constraints: { priority: 'cost' }
    });

    const baseCost = result.totals.baseCost;
    const discount = result.batch?.discount || 0;
    const finalCost = result.totals.discountedCost;
    const savings = result.totals.totalSavings;

    console.log(
      `${String(samples).padStart(10)} | ` +
      `$${baseCost.toFixed(2).padStart(8)} | ` +
      `${discount.toFixed(0).padStart(7)}% | ` +
      `$${finalCost.toFixed(2).padStart(9)} | ` +
      `$${savings.toFixed(2)}`
    );
  }
}

// ============================================
// Example 7: Real-World Use Case
// ============================================
async function realWorldCase() {
  console.log('\n=== Real-World Case: Clinical Trial ===\n');

  // Clinical trial: 500 patient samples
  // Budget: $20,000
  // Need high quality
  // Deadline: 48 hours

  const optimized = lab.optimizeCost({
    instrument: 'dna-sequencer',
    samples: 500,
    constraints: {
      maxCost: 20000,
      minQuality: 4.5,
      maxTime: '48h',
      priority: 'quality',
      requireCertifications: ['CLIA', 'CAP']
    }
  });

  console.log('REQUIREMENTS:');
  console.log('  Samples:', 500);
  console.log('  Budget:', '$20,000');
  console.log('  Min Quality:', '4.5/5');
  console.log('  Deadline:', '48 hours');
  console.log('  Required Certs:', 'CLIA, CAP');

  console.log('\nOPTIMAL SOLUTION:');
  console.log('  Lab:', optimized.lab.name, `(${optimized.lab.location})`);
  console.log('  Quality:', `${optimized.lab.quality}/5`);
  console.log('  ETA:', optimized.lab.eta);

  console.log('\n  AI Model:', optimized.aiModel.name);
  console.log('  Accuracy:', `${optimized.aiModel.accuracy}%`);

  console.log('\n  Batch Discount:', `${optimized.batch?.discount}%`);
  console.log('  Savings:', `$${optimized.batch?.savings.toFixed(2)}`);

  console.log('\n  TOTAL COST:', `$${optimized.totals.discountedCost.toFixed(2)}`);
  console.log('  Under budget by:', `$${(20000 - optimized.totals.discountedCost).toFixed(2)}`);

  console.log('\n  Avg Quality:', optimized.totals.averageQuality.toFixed(1));
  console.log('  Est. Time:', `${(optimized.totals.estimatedTime / 3600000).toFixed(1)} hours`);

  if (optimized.alternatives.length > 0) {
    console.log('\nALTERNATIVES:');
    optimized.alternatives.slice(0, 2).forEach((alt, i) => {
      console.log(`\n  Option ${i + 1}: ${alt.description}`);
      console.log('    Changes:', alt.changes.join(', '));
      console.log('    Cost:', `$${alt.cost.toFixed(2)}`);
      console.log('    Quality:', alt.quality.toFixed(1));
    });
  }
}

// ============================================
// Example 8: Budget Constraints
// ============================================
async function budgetConstraints() {
  console.log('\n=== Budget Constraints ===\n');

  const budgets = [1000, 2000, 3000, 5000];

  console.log('Testing different budget levels:\n');

  for (const budget of budgets) {
    try {
      const result = lab.optimizeCost({
        instrument: 'dna-sequencer',
        samples: 100,
        constraints: {
          maxCost: budget,
          priority: 'cost'
        }
      });

      console.log(`Budget: $${budget}`);
      console.log('  Lab:', result.lab.name);
      console.log('  AI:', result.aiModel.name);
      console.log('  Final cost:', `$${result.totals.discountedCost.toFixed(2)}`);
      console.log('  Quality:', result.totals.averageQuality.toFixed(1));
      console.log('  ✓ FEASIBLE\n');
    } catch (error) {
      console.log(`Budget: $${budget}`);
      console.log('  ✗ NOT FEASIBLE - Increase budget\n');
    }
  }
}

// ============================================
// Run all examples
// ============================================
async function main() {
  await basicOptimization();
  await priorityComparison();
  await whatIfScenarios();
  await savingsEstimation();
  await priceComparison();
  await largeBatchOptimization();
  await realWorldCase();
  await budgetConstraints();
}

main().catch(console.error);
