/**
 * 数据库迁移脚本
 * 从文件系统 JSON 迁移到 SQLite
 */

import { initializeDatabase, migrateFromFilesystem } from '../src/lib/database/sqlite';

async function main() {
  try {
    console.log('🚀 Starting database migration...');
    console.log('📊 Initializing SQLite database...');

    await initializeDatabase();
    console.log('✅ Database initialized');

    console.log('\n📂 Migrating data from file system...');
    const result = await migrateFromFilesystem();

    console.log('\n✅ Migration complete!');
    console.log(`   📦 Migrated: ${result.migrated} items`);
    console.log(`   ⏭️  Skipped: ${result.skipped} items (already in database)`);
    console.log(`   📊 Total: ${result.migrated + result.skipped} items`);

    console.log('\n💡 Next steps:');
    console.log('   1. Verify data integrity in your application');
    console.log('   2. Update API endpoints to use SQLite (see /api/recommend-v2 for example)');
    console.log('   3. Add caching layer (Redis or memory cache)');
    console.log('   4. Run performance tests');
    console.log('   5. Deploy to production');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
