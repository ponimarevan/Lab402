import { Lab402 } from '@lab402/sdk';

async function batchExample() {
  console.log('=== Lab402+ Batch Processing Example ===\n');

  const lab = new Lab402({
    researcher: process.env.RESEARCHER_403_KEY || 'demo-researcher-key',
    wallet: process.env.SOLANA_WALLET || 'demo-wallet-address'
  });

  // Example 1: Small batch (10 samples)
  console.log('\n=== Example 1: Small Batch (10 samples) ===\n');

  const smallBatch = await lab.createBatch({
    instrument: 'spectroscopy',
    samples: Array.from({ length: 10 }, (_, i) => ({
      id: `sample-${i + 1}`,
      data: { type: 'compound', concentration: Math.random() * 100 }
    })),
    compute: { gpu: 8, vram: 32 },
    ai: { model: 'chem-llm', interpretation: true }
  });

  // Listen to progress
  smallBatch.on('batch.progress', (event) => {
    const progress = event.data.progress;
    console.log(`Progress: ${progress.percentage.toFixed(1)}% (${progress.completed}/${progress.total})`);
  });

  smallBatch.on('batch.sample.completed', (event) => {
    console.log(`  ✅ Sample ${event.data.sampleId} completed`);
  });

  await smallBatch.start();

  const smallReport = smallBatch.generateReport();
  console.log(`\n📊 Small Batch Report:`);
  console.log(`Total: ${smallReport.totalSamples}`);
  console.log(`Completed: ${smallReport.completedSamples}`);
  console.log(`Failed: ${smallReport.failedSamples}`);
  console.log(`Avg time: ${(smallReport.averageProcessingTime / 1000).toFixed(2)}s`);
  console.log(`Total cost: $${smallReport.totalCost.toFixed(2)}`);

  // Example 2: Large batch (100 samples) with discount
  console.log('\n=== Example 2: Large Batch (100 samples) ===\n');

  const largeBatch = await lab.createBatch({
    instrument: 'dna-sequencer',
    samples: Array.from({ length: 100 }, (_, i) => ({
      id: `dna-sample-${i + 1}`,
      data: { type: 'genomic-dna', quality: 'high' },
      metadata: { patient: `patient-${i + 1}`, batch: 'cohort-A' }
    })),
    compute: { gpu: 16, vram: 64 },
    ai: { model: 'bio-gpt', interpretation: true, anomalyDetection: true },
    priority: 'high'
  });

  console.log(`\n💰 Pricing:`);
  console.log(`Base cost: $${largeBatch.pricing.baseCost.toFixed(2)}`);
  console.log(`Discount: ${(largeBatch.pricing.discountRate * 100).toFixed(0)}%`);
  console.log(`Savings: $${largeBatch.pricing.savings.toFixed(2)}`);
  console.log(`Final: $${largeBatch.pricing.discountedCost.toFixed(2)}`);
  console.log(`Per sample: $${largeBatch.pricing.perSampleCost.toFixed(2)}`);

  let lastProgress = 0;
  largeBatch.on('batch.progress', (event) => {
    const progress = event.data.progress;
    if (progress.percentage - lastProgress >= 10) {
      console.log(`Progress: ${progress.percentage.toFixed(0)}%`);
      lastProgress = progress.percentage;
    }
  });

  await largeBatch.start();

  const largeReport = largeBatch.generateReport();
  console.log(`\n📊 Large Batch Report:`);
  console.log(`Completed: ${largeReport.completedSamples}/${largeReport.totalSamples}`);
  console.log(`Average time: ${(largeReport.averageProcessingTime / 1000).toFixed(2)}s per sample`);
  console.log(`Total cost: $${largeReport.totalCost.toFixed(2)}`);

  // Example 3: Export to CSV
  console.log('\n=== Example 3: Export to CSV ===\n');

  const csv = largeBatch.exportToCSV();
  console.log('First 5 lines of CSV:');
  console.log(csv.split('\n').slice(0, 6).join('\n'));

  // Example 4: Batch Manager Statistics
  console.log('\n=== Example 4: Batch Manager Statistics ===\n');

  const batchManager = lab.getBatchManager();
  
  console.log(`Total batches: ${batchManager.getAllBatches().length}`);
  console.log(`Active batches: ${batchManager.getActiveBatches().length}`);
  console.log(`Completed batches: ${batchManager.getCompletedBatches().length}`);
  console.log(`Total samples processed: ${batchManager.getTotalSamplesProcessed()}`);
  console.log(`Total cost: $${batchManager.getTotalCost().toFixed(2)}`);
  console.log(`Total savings: $${batchManager.getTotalSavings().toFixed(2)}`);

  // Example 5: Massive batch (1000 samples) - maximum discount
  console.log('\n=== Example 5: Massive Batch (1000 samples) ===\n');

  const massiveBatch = await lab.createBatch({
    instrument: 'microscopy',
    samples: Array.from({ length: 1000 }, (_, i) => ({
      id: `cell-${i + 1}`,
      data: { type: 'cell-culture', magnification: '100x' }
    })),
    compute: { gpu: 32, vram: 128 },
    ai: { model: 'lab-vision', interpretation: true },
    priority: 'normal'
  });

  console.log(`\n💰 Maximum Discount Pricing:`);
  console.log(`Base cost: $${massiveBatch.pricing.baseCost.toFixed(2)}`);
  console.log(`Discount: ${(massiveBatch.pricing.discountRate * 100).toFixed(0)}%`);
  console.log(`Savings: $${massiveBatch.pricing.savings.toFixed(2)}`);
  console.log(`Final: $${massiveBatch.pricing.discountedCost.toFixed(2)}`);
  console.log(`Per sample: $${massiveBatch.pricing.perSampleCost.toFixed(2)}`);

  console.log(`\n🚀 Processing 1000 samples with 100x parallelism...`);

  await massiveBatch.start();

  const massiveReport = massiveBatch.generateReport();
  console.log(`\n📊 Massive Batch Report:`);
  console.log(`Completed: ${massiveReport.completedSamples}`);
  console.log(`Average: ${(massiveReport.averageProcessingTime / 1000).toFixed(2)}s`);
  console.log(`Total cost: $${massiveReport.totalCost.toFixed(2)}`);
  console.log(`Savings vs individual: $${massiveBatch.pricing.savings.toFixed(2)}`);

  // Example 6: Batch with failures
  console.log('\n=== Example 6: Handling Failures ===\n');

  const batchWithFailures = await lab.createBatch({
    instrument: 'mass-spec',
    samples: Array.from({ length: 20 }, (_, i) => ({
      id: `sample-f-${i + 1}`,
      data: { type: 'protein' }
    }))
  });

  batchWithFailures.on('batch.sample.failed', (event) => {
    console.log(`❌ Failed: ${event.data.sampleId} - ${event.data.error}`);
  });

  await batchWithFailures.start();

  const failedResults = batchWithFailures.getFailedResults();
  console.log(`\nFailed samples: ${failedResults.length}`);
  
  await lab.close();
}

// Run examples
if (require.main === module) {
  batchExample().catch(console.error);
}

export { batchExample };
