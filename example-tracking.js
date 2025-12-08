import { Lab402 } from '@lab402/sdk';

async function sampleTrackingExample() {
  console.log('=== Lab402+ Sample Tracking Example ===\n');

  const lab = new Lab402({
    researcher: process.env.RESEARCHER_403_KEY || 'demo-researcher-key',
    wallet: process.env.SOLANA_WALLET || 'demo-wallet-address'
  });

  // Example 1: Register samples
  console.log('=== Example 1: Register Samples ===\n');

  const sample1 = lab.registerSample(
    'sample-001',
    'blood',
    {
      origin: 'Patient-A',
      collectionDate: Date.now(),
      storageConditions: '-80°C',
      handler: 'Dr. Smith',
      protocol: 'PROTO-2024-001',
      tags: ['clinical-trial', 'cohort-a']
    },
    lab.getSampleTracker().generateBarcode('BLOOD')
  );

  console.log(`Sample: ${sample1.id}`);
  console.log(`Barcode: ${sample1.barcode}`);
  console.log(`Status: ${sample1.status}`);

  const sample2 = lab.registerSample(
    'sample-002',
    'tissue',
    {
      origin: 'Patient-B',
      collectionDate: Date.now(),
      tags: ['clinical-trial', 'cohort-b']
    },
    lab.getSampleTracker().generateBarcode('TISSUE')
  );

  // Example 2: Update sample status
  console.log('\n=== Example 2: Update Sample Status ===\n');

  lab.updateSampleStatus('sample-001', 'stored', 'Tech-1', 'Stored in freezer A3');
  lab.updateSampleStatus('sample-001', 'in-preparation', 'Tech-2', 'Thawing sample');
  lab.updateSampleStatus('sample-001', 'ready', 'Tech-2', 'Sample prepared for analysis');

  // Example 3: Add history events
  console.log('\n=== Example 3: Add History Events ===\n');

  lab.addSampleHistory(
    'sample-001',
    'transferred',
    'Tech-3',
    'Transferred to analysis room',
    'Lab-Room-5'
  );

  lab.addSampleHistory(
    'sample-001',
    'analyzed',
    'Instrument-1',
    'DNA sequencing started'
  );

  // Example 4: Quality checks
  console.log('\n=== Example 4: Quality Checks ===\n');

  lab.addQualityCheck(
    'sample-001',
    'QC-Inspector-1',
    true,
    {
      purity: 98.5,
      concentration: 250,
      integrity: 9.2
    },
    'All metrics within acceptable range'
  );

  lab.addQualityCheck(
    'sample-002',
    'QC-Inspector-1',
    false,
    {
      purity: 75.0,
      concentration: 150
    },
    'Purity below threshold, requires re-extraction'
  );

  // Example 5: Query samples
  console.log('\n=== Example 5: Query Samples ===\n');

  // By status
  const readySamples = lab.querySamples({ status: 'ready' });
  console.log(`Ready samples: ${readySamples.length}`);

  // By tags
  const cohortA = lab.querySamples({ tags: ['cohort-a'] });
  console.log(`Cohort A samples: ${cohortA.length}`);

  // By type
  const bloodSamples = lab.querySamples({ type: 'blood' });
  console.log(`Blood samples: ${bloodSamples.length}`);

  // Example 6: Get sample by barcode
  console.log('\n=== Example 6: Get Sample by Barcode ===\n');

  const barcodeToFind = sample1.barcode!;
  const foundSample = lab.getSampleByBarcode(barcodeToFind);

  if (foundSample) {
    console.log(`Found sample: ${foundSample.id}`);
    console.log(`Type: ${foundSample.type}`);
    console.log(`Status: ${foundSample.status}`);
  }

  // Example 7: View sample history
  console.log('\n=== Example 7: Sample History ===\n');

  const tracker = lab.getSampleTracker();
  const history = tracker.getSampleHistory('sample-001');

  console.log(`Sample-001 history (${history.length} events):`);
  history.forEach((event, i) => {
    console.log(`  ${i + 1}. ${event.event} - ${event.details}`);
    if (event.actor) console.log(`     Actor: ${event.actor}`);
    if (event.location) console.log(`     Location: ${event.location}`);
  });

  // Example 8: View QC checks
  console.log('\n=== Example 8: Quality Checks ===\n');

  const qcChecks = tracker.getQualityChecks('sample-001');
  console.log(`Sample-001 QC checks: ${qcChecks.length}`);
  qcChecks.forEach((qc, i) => {
    console.log(`  ${i + 1}. ${qc.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`     Inspector: ${qc.inspector}`);
    if (qc.metrics) {
      console.log(`     Metrics:`, qc.metrics);
    }
    if (qc.notes) {
      console.log(`     Notes: ${qc.notes}`);
    }
  });

  // Example 9: Statistics
  console.log('\n=== Example 9: Statistics ===\n');

  const stats = tracker.getStatistics();
  console.log(`Total samples: ${stats.total}`);
  console.log(`By status:`, stats.byStatus);
  console.log(`By type:`, stats.byType);
  console.log(`Total QC checks: ${stats.totalQCChecks}`);
  console.log(`QC pass rate: ${stats.qcPassRate.toFixed(1)}%`);

  // Example 10: Export sample data
  console.log('\n=== Example 10: Export Sample Data ===\n');

  const exportedData = tracker.exportSampleData('sample-001');
  console.log('Sample-001 exported data:');
  console.log(exportedData.substring(0, 300) + '...');

  await lab.close();
}

// Run example
if (require.main === module) {
  sampleTrackingExample().catch(console.error);
}

export { sampleTrackingExample };
