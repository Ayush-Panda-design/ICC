/**
 * One-shot: repair broken apply URLs in the current DB (no full reseed).
 * Usage: node scripts/repair-urls.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { repairUrlsFromCatalog, runUrlHealthCheck } = require('../services/jobSync/urlRepair');
const { syncPlatformHubs } = require('../services/jobSync');

async function main() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/interview-command-center');
  console.log('Repairing from catalog…');
  const repaired = await repairUrlsFromCatalog();
  console.log('Repaired rows:', repaired);

  console.log('Linking platform hubs…');
  await syncPlatformHubs(null);

  console.log('Health-checking sample…');
  const health = await runUrlHealthCheck(null, { limit: 40 });
  console.log('Health:', health);

  const Company = require('../models/Company');
  const tcs = await Company.find({ name: /^TCS/ }).select('name applyUrl urlStatus');
  console.log('TCS links:', tcs.map((c) => `${c.name} -> ${c.applyUrl} [${c.urlStatus}]`));

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
