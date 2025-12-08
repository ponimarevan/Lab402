import { Lab402 } from '@lab402/sdk';

async function aiModelSelectionExample() {
  console.log('=== Lab402+ AI Model Selection Example ===\n');

  const lab = new Lab402({
    researcher: process.env.RESEARCHER_403_KEY || 'demo-researcher-key',
    wallet: process.env.SOLANA_WALLET || 'demo-wallet-address'
  });

  // Example 1: Auto-select best model
  console.log('=== Example 1: Auto-Select Best Model ===\n');

  const selection = lab.selectAIModel('dna-sequencer');

  console.log(`🤖 Recommended: ${selection.model.name}`);
  console.log(`Type: ${selection.model.type}`);
  console.log(`Version: ${selection.model.version}`);
  console.log(`Reason: ${selection.reason}`);
  console.log(`Confidence: ${selection.confidence}%`);
  console.log(`Price: $${selection.model.pricing.perSample}/sample`);
  
  if (selection.model.parameters) {
    console.log(`\nParameters:`);
    console.log(`  Size: ${selection.model.parameters.size}`);
    console.log(`  Accuracy: ${selection.model.parameters.accuracy}%`);
    console.log(`  Context: ${selection.model.parameters.contextWindow} tokens`);
  }

  console.log(`\nCapabilities:`);
  selection.model.capabilities.forEach((cap, i) => {
    console.log(`  ${i + 1}. ${cap}`);
  });

  // Example 2: Select by priority
  console.log('\n=== Example 2: Select by Priority ===\n');

  // Cost-optimized
  const costOptimized = lab.selectAIModel('dna-sequencer', undefined, 'cost');
  console.log(`💰 Cost-optimized: ${costOptimized.model.name}`);
  console.log(`Price: $${costOptimized.model.pricing.perSample}/sample`);

  // Accuracy-optimized
  const accuracyOptimized = lab.selectAIModel('dna-sequencer', undefined, 'accuracy');
  console.log(`\n🎯 Accuracy-optimized: ${accuracyOptimized.model.name}`);
  console.log(`Accuracy: ${accuracyOptimized.model.parameters?.accuracy}%`);

  // Example 3: Get all models
  console.log('\n=== Example 3: Browse All AI Models ===\n');

  const allModels = lab.getAllAIModels();
  console.log(`Total models available: ${allModels.length}\n`);

  allModels.forEach(model => {
    console.log(`📦 ${model.name} (${model.version})`);
    console.log(`   Type: ${model.type}`);
    console.log(`   Price: $${model.pricing.perSample}/sample`);
    if (model.parameters?.accuracy) {
      console.log(`   Accuracy: ${model.parameters.accuracy}%`);
    }
    console.log(`   Description: ${model.description}`);
    console.log('');
  });

  // Example 4: Compare models
  console.log('=== Example 4: Compare Models ===\n');

  const comparison = lab.compareAIModels([
    'bio-gpt-7b',
    'genomics-llm-70b'
  ]);

  console.log(`✅ Recommended: ${comparison.recommended.name}`);
  console.log(`Price: $${comparison.recommended.pricing.perSample}/sample`);
  console.log(`Accuracy: ${comparison.recommended.parameters?.accuracy}%`);

  console.log(`\nAlternatives:`);
  comparison.alternatives.forEach(alt => {
    console.log(`\n  ${alt.model.name}:`);
    
    if (alt.pros.length > 0) {
      console.log(`  Pros:`);
      alt.pros.forEach(pro => console.log(`    + ${pro}`));
    }
    
    if (alt.cons.length > 0) {
      console.log(`  Cons:`);
      alt.cons.forEach(con => console.log(`    - ${con}`));
    }
  });

  // Example 5: Search models
  console.log('\n=== Example 5: Search Models ===\n');

  // Affordable models
  const affordable = lab.searchAIModels({
    maxPrice: 1.00
  });
  console.log(`Models under $1/sample: ${affordable.length}`);
  affordable.forEach(m => {
    console.log(`  - ${m.name}: $${m.pricing.perSample}/sample`);
  });

  // High accuracy models
  const accurate = lab.searchAIModels({
    minAccuracy: 96
  });
  console.log(`\nModels with 96%+ accuracy: ${accurate.length}`);
  accurate.forEach(m => {
    console.log(`  - ${m.name}: ${m.parameters?.accuracy}%`);
  });

  // Models with specific capability
  const proteinModels = lab.searchAIModels({
    capabilities: ['protein']
  });
  console.log(`\nModels with protein capabilities: ${proteinModels.length}`);
  proteinModels.forEach(m => {
    console.log(`  - ${m.name}`);
  });

  // Example 6: Get specific model
  console.log('\n=== Example 6: Get Specific Model ===\n');

  const bioGPT = lab.getAIModel('bio-gpt-7b');
  
  if (bioGPT) {
    console.log(`Model: ${bioGPT.name}`);
    console.log(`Description: ${bioGPT.description}`);
    console.log(`\nTraining Data: ${bioGPT.trainingData}`);
    console.log(`\nSpecialization:`);
    bioGPT.specialization?.forEach(s => {
      console.log(`  - ${s}`);
    });
    console.log(`\nRequirements:`);
    console.log(`  GPU: ${bioGPT.requirements.minGPU}x`);
    console.log(`  VRAM: ${bioGPT.requirements.minVRAM}GB`);
    console.log(`  RAM: ${bioGPT.requirements.minRAM}GB`);
  }

  // Example 7: Model selection for different instruments
  console.log('\n=== Example 7: Model Selection by Instrument ===\n');

  const instruments = [
    'dna-sequencer',
    'spectroscopy',
    'microscopy',
    'mass-spectrometry'
  ] as const;

  instruments.forEach(instrument => {
    const model = lab.selectAIModel(instrument);
    console.log(`${instrument}:`);
    console.log(`  → ${model.model.name} ($${model.model.pricing.perSample}/sample)`);
  });

  // Example 8: Cost analysis
  console.log('\n=== Example 8: Cost Analysis ===\n');

  const models = [
    'bio-gpt-7b',
    'genomics-llm-70b',
    'drug-discovery-ai'
  ];

  console.log('Cost for 100 samples:\n');
  models.forEach(modelId => {
    const model = lab.getAIModel(modelId);
    if (model) {
      const cost = model.pricing.perSample * 100;
      console.log(`${model.name}:`);
      console.log(`  Single: $${model.pricing.perSample.toFixed(2)}/sample`);
      console.log(`  100 samples: $${cost.toFixed(2)}`);
      console.log(`  1000 samples: $${(cost * 10).toFixed(2)}`);
      console.log('');
    }
  });

  // Example 9: Real-world analysis with model selection
  console.log('=== Example 9: Complete Analysis Workflow ===\n');

  // Step 1: Select best model for task
  const modelChoice = lab.selectAIModel(
    'dna-sequencer',
    'genomic-variant-analysis',
    'accuracy'
  );

  console.log(`Step 1: AI Model Selected`);
  console.log(`Model: ${modelChoice.model.name}`);
  console.log(`Reason: ${modelChoice.reason}`);

  // Step 2: Create analysis with selected model
  console.log(`\nStep 2: Creating Analysis`);
  const analysis = await lab.requestAnalysis({
    instrument: 'dna-sequencer',
    sample: {
      id: 'sample-001',
      type: 'genomic-dna',
      data: { sequenceLength: 3000000 }
    },
    compute: {
      gpu: modelChoice.model.requirements.minGPU,
      vram: modelChoice.model.requirements.minVRAM,
      ram: modelChoice.model.requirements.minRAM
    },
    ai: {
      model: modelChoice.model.id,
      interpretation: true,
      reportFormat: 'detailed'
    }
  });

  console.log(`Analysis ID: ${analysis.id}`);
  console.log(`Estimated cost: $${analysis.invoice.amount.usd.toFixed(2)}`);

  // Example 10: Budget-based selection
  console.log('\n=== Example 10: Budget-Based Selection ===\n');

  const budget = 100; // $100 budget
  const samplesNeeded = 50;
  const maxPerSample = budget / samplesNeeded;

  console.log(`Budget: $${budget}`);
  console.log(`Samples: ${samplesNeeded}`);
  console.log(`Max per sample: $${maxPerSample.toFixed(2)}`);

  const budgetModels = lab.searchAIModels({
    maxPrice: maxPerSample
  });

  console.log(`\nModels within budget: ${budgetModels.length}`);
  budgetModels.forEach(m => {
    const totalCost = m.pricing.perSample * samplesNeeded;
    console.log(`  ${m.name}:`);
    console.log(`    Per sample: $${m.pricing.perSample.toFixed(2)}`);
    console.log(`    Total: $${totalCost.toFixed(2)}`);
    console.log(`    Accuracy: ${m.parameters?.accuracy}%`);
  });

  await lab.close();
}

// Run example
if (require.main === module) {
  aiModelSelectionExample().catch(console.error);
}

export { aiModelSelectionExample };
