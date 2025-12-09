// Data Pipeline Examples - Lab402 v1.6.0

import { Lab402 } from '@lab402/sdk';

const lab = new Lab402({
  researcher: 'Dr. Sarah Chen',
  wallet: process.env.RESEARCHER_WALLET!
});

// ============================================
// Example 1: Simple Pipeline
// ============================================
async function simplePipeline() {
  console.log('=== Simple Pipeline ===\n');

  const pipeline = lab.createPipeline('simple-analysis')
    .addInstrument('dna-sequencer', { samples: 10 })
    .addAIAnalysis('bio-gpt', 'sequence-analysis')
    .addStorage('s3://results/simple');

  console.log('📊 Pipeline created with 3 steps');
  console.log('  1. DNA Sequencing (10 samples)');
  console.log('  2. AI Analysis (Bio-GPT)');
  console.log('  3. Storage (S3)');

  const result = await pipeline.execute();
  
  console.log(`\n✅ Pipeline completed in ${(result.executionTime / 1000).toFixed(1)}s`);
  console.log(`   Steps completed: ${result.stepsCompleted}`);
}

// ============================================
// Example 2: Genomics Analysis Template
// ============================================
async function genomicsTemplate() {
  console.log('\n=== Genomics Analysis Template ===\n');

  // Use built-in template
  const pipeline = lab.createPipelineFromTemplate('genomics-analysis', {
    samples: 100,
    quality: 'high',
    storageDestination: 's3://research/genomics'
  });

  console.log('📋 Using built-in template: genomics-analysis');
  console.log('  → DNA Sequencing');
  console.log('  → Quality Assessment');
  console.log('  → QC Check');
  console.log('  → AI Variant Calling');
  console.log('  → Generate Report');
  console.log('  → Store Results');

  // Listen for events
  pipeline.on('step.completed', (event) => {
    console.log(`  ✓ Step completed: ${event.data?.stepName}`);
  });

  const result = await pipeline.execute();
  
  console.log(`\n🎉 Genomics analysis complete!`);
  console.log(`   Time: ${(result.executionTime / 1000 / 60).toFixed(1)} minutes`);
}

// ============================================
// Example 3: Conditional Branching
// ============================================
async function conditionalPipeline() {
  console.log('\n=== Conditional Branching ===\n');

  const pipeline = lab.createPipeline('quality-control')
    .addInstrument('spectroscopy', { samples: 50 })
    .addAIAnalysis('pathology-ai', 'quality-check')
    .addCondition('QC Check', (data) => {
      const score = data.results?.qualityScore || 0;
      console.log(`  Quality score: ${(score * 100).toFixed(1)}%`);
      return score > 0.90;
    })
    .addCustom('Approve', async (context) => {
      console.log('  ✅ Batch APPROVED');
      return { approved: true };
    })
    .addWebhook('https://api.example.com/qc/approved');

  const result = await pipeline.execute();
  console.log(`\n${result.status === 'completed' ? '✅' : '❌'} QC Pipeline: ${result.status}`);
}

// ============================================
// Example 4: Error Handling & Retries
// ============================================
async function errorHandlingPipeline() {
  console.log('\n=== Error Handling & Retries ===\n');

  const pipeline = lab.createPipeline('robust-analysis')
    .addInstrument('mass-spec', { samples: 100 })
    .setTimeout(300000) // 5 minutes
    .setRetry({
      maxAttempts: 3,
      backoff: 'exponential',
      initialDelay: 2000,
      maxDelay: 10000
    })
    .onFailure('retry', { maxAttempts: 3 })
    .addAIAnalysis('chem-bert', 'compound-identification')
    .addStorage('s3://results/compounds');

  pipeline.on('step.retrying', (event) => {
    console.log(`  🔄 Retry ${event.data?.attempt}/${event.data?.maxAttempts} (delay: ${event.data?.delay}ms)`);
  });

  pipeline.on('step.failed', (event) => {
    console.log(`  ❌ Step failed: ${event.data?.stepName}`);
  });

  const result = await pipeline.execute();
  console.log(`\nResult: ${result.status}`);
}

// ============================================
// Example 5: Multi-Step Drug Discovery
// ============================================
async function drugDiscoveryPipeline() {
  console.log('\n=== Drug Discovery Pipeline ===\n');

  const pipeline = lab.createPipeline('drug-discovery')
    // Step 1: Mass Spectrometry
    .addInstrument('mass-spec', {
      samples: 50,
      priority: 'quality'
    })
    
    // Step 2: Compound Identification
    .addAIAnalysis('chem-bert', 'compound-identification')
    
    // Step 3: Efficacy Prediction
    .addAIAnalysis('drug-discovery', 'efficacy-prediction')
    
    // Step 4: Safety Analysis
    .addTransform((data) => {
      const compounds = data.results?.compounds || [];
      
      const safeCompounds = compounds.filter((c: any) => 
        c.toxicity < 0.3 && c.efficacy > 0.7
      );

      console.log(`  📊 Analyzed: ${compounds.length} compounds`);
      console.log(`  ✅ Safe candidates: ${safeCompounds.length}`);

      return {
        safeCompounds,
        totalAnalyzed: compounds.length,
        successRate: safeCompounds.length / compounds.length
      };
    }, 'Safety Filter')
    
    // Step 5: Generate Report
    .addStorage('s3://drug-discovery/results', 'json')
    
    // Step 6: Notify team
    .addWebhook('https://api.example.com/notify/drug-discovery');

  console.log('🧪 Starting drug discovery pipeline...\n');

  const result = await pipeline.execute();
  
  console.log(`\n✅ Discovery complete!`);
  console.log(`   Execution time: ${(result.executionTime / 1000 / 60).toFixed(1)} minutes`);
  console.log(`   Steps completed: ${result.stepsCompleted}/${result.stepsCompleted + result.stepsFailed}`);
}

// ============================================
// Example 6: Batch Processing
// ============================================
async function batchProcessing() {
  console.log('\n=== Batch Processing ===\n');

  const samples = Array.from({ length: 500 }, (_, i) => ({
    id: `sample-${i + 1}`,
    data: `data-${i + 1}`
  }));

  const pipeline = lab.createPipeline('high-throughput')
    // Prepare batches
    .addTransform((data) => {
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < samples.length; i += batchSize) {
        batches.push(samples.slice(i, i + batchSize));
      }
      
      console.log(`  📦 Created ${batches.length} batches of ${batchSize} samples`);
      return { batches, totalSamples: samples.length };
    }, 'Batch Preparation')
    
    // Process in batches
    .addInstrument('dna-sequencer', {
      samples: 500,
      priority: 'cost' // Optimize for cost in bulk
    })
    
    // AI Analysis
    .addAIAnalysis('bio-gpt', 'batch-analysis')
    
    // Aggregate results
    .addTransform((data) => {
      const processed = data.results?.length || 0;
      const successRate = data.results?.successRate || 0;
      
      console.log(`  📊 Processed: ${processed} samples`);
      console.log(`  ✅ Success rate: ${(successRate * 100).toFixed(1)}%`);
      
      return {
        totalProcessed: processed,
        successRate,
        costPerSample: data.totalCost / processed
      };
    }, 'Results Aggregation')
    
    // Store
    .addStorage('s3://batch-results', 'json');

  console.log('🔬 Starting batch processing...\n');

  const result = await pipeline.execute();
  
  console.log(`\n✅ Batch complete!`);
  console.log(`   Time: ${(result.executionTime / 1000).toFixed(1)}s`);
  console.log(`   Samples: 500`);
}

// ============================================
// Example 7: Parallel Processing
// ============================================
async function parallelPipeline() {
  console.log('\n=== Parallel Processing ===\n');

  const pipeline = lab.createPipeline('parallel-analysis')
    // Initial sample prep
    .addTransform((data) => {
      console.log('  📋 Sample preparation complete');
      return { samples: 100, ready: true };
    }, 'Sample Prep')
    
    // Run 3 analyses in parallel
    .addInstrument('spectroscopy', { samples: 100 })
    .addInstrument('microscopy', { samples: 100 })
    .addInstrument('mass-spec', { samples: 100 })
    .parallel('spectroscopy', 'microscopy', 'mass-spec')
    
    // Combine results
    .addTransform((data) => {
      console.log('  🔬 All parallel analyses complete');
      console.log('  📊 Combining results...');
      return {
        combined: true,
        analysisCount: 3
      };
    }, 'Combine Results')
    
    .addStorage('s3://parallel-results');

  console.log('⚡ Running analyses in parallel...\n');

  const result = await pipeline.execute();
  
  console.log(`\n✅ Parallel pipeline complete!`);
  console.log(`   Time saved by parallel execution`);
}

// ============================================
// Example 8: Real-Time Monitoring
// ============================================
async function monitoringPipeline() {
  console.log('\n=== Real-Time Pipeline Monitoring ===\n');

  const pipeline = lab.createPipeline('monitored-research')
    .addInstrument('dna-sequencer', { samples: 100 })
    .addAIAnalysis('genomics-llm', 'analysis')
    .addStorage('s3://results');

  // Monitor all events
  pipeline.on('event', (event) => {
    const timestamp = new Date(event.timestamp).toLocaleTimeString();
    console.log(`[${timestamp}] ${event.type}`, event.data?.stepName || '');
  });

  // Specific event handlers
  pipeline.on('step.started', (event) => {
    console.log(`  ▶️  Starting: ${event.data?.stepName}`);
  });

  pipeline.on('step.completed', (event) => {
    const duration = (event.data?.duration / 1000).toFixed(1);
    console.log(`  ✅ Completed: ${event.data?.stepName} (${duration}s)`);
  });

  pipeline.on('pipeline.completed', (event) => {
    console.log(`\n🎉 Pipeline completed successfully!`);
  });

  await pipeline.execute();
}

// ============================================
// Example 9: Custom Pipeline Template
// ============================================
async function customTemplate() {
  console.log('\n=== Custom Pipeline Template ===\n');

  // Register custom template
  const { PipelineTemplates } = await import('@lab402/sdk');
  
  PipelineTemplates.register({
    name: 'cancer-research',
    description: 'Cancer research analysis pipeline',
    version: '1.0.0',
    steps: [
      {
        name: 'Tissue Sample Analysis',
        type: 'instrument',
        config: {
          instrument: 'microscopy',
          samples: 50,
          priority: 'quality'
        }
      },
      {
        name: 'Pathology AI',
        type: 'ai-analysis',
        config: {
          aiModel: 'pathology-ai',
          task: 'cancer-detection'
        }
      },
      {
        name: 'Treatment Prediction',
        type: 'ai-analysis',
        config: {
          aiModel: 'medical-vision',
          task: 'treatment-prediction'
        }
      },
      {
        name: 'Generate Clinical Report',
        type: 'storage',
        config: {
          destination: 's3://cancer-research/reports',
          format: 'pdf'
        }
      }
    ],
    tags: ['cancer', 'pathology', 'medical']
  });

  // Use custom template
  const pipeline = lab.createPipelineFromTemplate('cancer-research');
  
  console.log('🏥 Running cancer research pipeline...');
  const result = await pipeline.execute();
  console.log(`\n✅ Research pipeline complete!`);
}

// ============================================
// Example 10: List Available Templates
// ============================================
function listTemplates() {
  console.log('\n=== Available Pipeline Templates ===\n');

  const templates = lab.listPipelineTemplates();
  
  console.log('Built-in templates:');
  templates.forEach((name) => {
    const info = lab.getPipelineTemplateInfo(name);
    if (info) {
      console.log(`\n📋 ${name}`);
      console.log(`   ${info.description}`);
      console.log(`   Steps: ${info.steps.length}`);
      if (info.tags) {
        console.log(`   Tags: ${info.tags.join(', ')}`);
      }
    }
  });
}

// ============================================
// Example 11: Complete Research Workflow
// ============================================
async function completeResearchWorkflow() {
  console.log('\n=== Complete Research Workflow ===\n');

  const pipeline = lab.createPipeline('complete-research')
    // 1. Sample Collection & Prep
    .addTransform((data) => {
      console.log('  📋 Sample collection: 200 samples');
      return { samples: 200, prepared: true };
    }, 'Sample Collection')
    
    // 2. Initial Screening
    .addInstrument('spectroscopy', {
      samples: 200,
      priority: 'speed'
    })
    
    // 3. Filter by quality
    .addCondition('Quality Filter', (data) => {
      return (data.results?.avgQuality || 0) > 0.8;
    })
    
    // 4. Detailed Analysis
    .addInstrument('mass-spec', {
      samples: 200,
      priority: 'quality'
    })
    
    // 5. AI Interpretation
    .addAIAnalysis('chem-bert', 'interpretation')
    
    // 6. Statistical Analysis
    .addTransform((data) => {
      console.log('  📊 Running statistical analysis...');
      return {
        mean: 0.85,
        stdDev: 0.12,
        pValue: 0.003,
        significant: true
      };
    }, 'Statistical Analysis')
    
    // 7. Generate Figures
    .addTransform((data) => {
      console.log('  📈 Generating publication figures...');
      return {
        figures: ['figure1.png', 'figure2.png', 'figure3.png'],
        tables: ['table1.csv', 'table2.csv']
      };
    }, 'Generate Figures')
    
    // 8. Store Results
    .addStorage('s3://research/publications', 'json')
    
    // 9. Notify Co-authors
    .addWebhook('https://api.example.com/notify/coauthors');

  console.log('🔬 Running complete research workflow...\n');

  const result = await pipeline.execute();
  
  console.log(`\n✅ Research workflow complete!`);
  console.log(`   Total time: ${(result.executionTime / 1000 / 60).toFixed(1)} minutes`);
  console.log(`   Steps: ${result.stepsCompleted}`);
  console.log(`   Ready for publication! 📄`);
}

// ============================================
// Run all examples
// ============================================
async function main() {
  try {
    await simplePipeline();
    await genomicsTemplate();
    await conditionalPipeline();
    await errorHandlingPipeline();
    await drugDiscoveryPipeline();
    await batchProcessing();
    await parallelPipeline();
    await monitoringPipeline();
    await customTemplate();
    listTemplates();
    await completeResearchWorkflow();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
