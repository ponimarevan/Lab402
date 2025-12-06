#!/usr/bin/env node

const { Lab402 } = require('../dist/index.js');

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  if (!command) {
    console.log('Lab402+ CLI');
    console.log('');
    console.log('Commands:');
    console.log('  request     Request a lab analysis');
    console.log('  instruments List available instruments');
    console.log('  pricing     View pricing tiers');
    console.log('  help        Show this help message');
    console.log('');
    console.log('Environment variables:');
    console.log('  RESEARCHER_403_KEY  Your researcher identity key');
    console.log('  SOLANA_WALLET       Your Solana wallet address');
    return;
  }

  const researcher = process.env.RESEARCHER_403_KEY;
  const wallet = process.env.SOLANA_WALLET;

  if (!researcher || !wallet) {
    console.error('Error: RESEARCHER_403_KEY and SOLANA_WALLET must be set');
    process.exit(1);
  }

  const lab = new Lab402({ researcher, wallet });

  switch (command) {
    case 'request':
      console.log('Lab analysis request flow (interactive mode coming soon)');
      break;

    case 'instruments':
      const instruments = await lab.getAvailableInstruments();
      console.log('\nAvailable Instruments:\n');
      instruments.forEach(inst => {
        console.log(`${inst.instrument}`);
        console.log(`  Status: ${inst.available ? 'Available' : 'Busy'}`);
        console.log(`  Location: ${inst.location}`);
        console.log(`  Capabilities: ${inst.capabilities.join(', ')}`);
        console.log('');
      });
      break;

    case 'pricing':
      const pricing = await lab.getPricing();
      console.log('\nPricing Tiers:\n');
      pricing.forEach(tier => {
        console.log(`${tier.tier.toUpperCase()}`);
        console.log(`  Compute: $${tier.computeRate}/ms`);
        console.log(`  AI: $${tier.aiRate}/request`);
        console.log(`  Storage: $${tier.storageRate}/GB`);
        console.log('');
      });
      break;

    case 'help':
      main();
      break;

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }

  await lab.close();
}

main().catch(console.error);
