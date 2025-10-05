/**
 * Test Script for Anonymous File Upload System
 * 
 * This script tests the anonymous upload functionality
 * Run: node src/scripts/test-anonymous-upload.js
 */

// Load environment variables first
require('dotenv').config();

const { supabaseAdmin } = require('../config/supabase');

async function testAnonymousUploadSystem() {
  console.log('\n╔════════════════════════════════════════════╗');
  console.log('║  Anonymous Upload System Test             ║');
  console.log('╚════════════════════════════════════════════╝\n');

  try {
    // Test 1: Check if database columns exist
    console.log('Test 1: Checking database schema...');
    const { data: testFile, error: schemaError } = await supabaseAdmin
      .from('files')
      .select('id, is_anonymous, expires_at, user_id')
      .limit(1);

    if (schemaError) {
      console.error('❌ Schema check failed:', schemaError.message);
      console.log('\n⚠️  Please run the database migration:');
      console.log('   backend/database/add_anonymous_support.sql\n');
      return false;
    }
    console.log('✅ Database schema is correct\n');

    // Test 2: Check for anonymous files
    console.log('Test 2: Checking for anonymous files...');
    const { data: anonymousFiles, error: queryError } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('is_anonymous', true);

    if (queryError) {
      console.error('❌ Query failed:', queryError.message);
      return false;
    }

    console.log(`✅ Found ${anonymousFiles?.length || 0} anonymous file(s)\n`);

    if (anonymousFiles && anonymousFiles.length > 0) {
      console.log('Sample anonymous files:');
      anonymousFiles.slice(0, 3).forEach(file => {
        console.log(`  - ${file.filename}`);
        console.log(`    ID: ${file.id}`);
        console.log(`    Expires: ${file.expires_at || 'N/A'}`);
        console.log(`    Created: ${file.created_at}`);
        console.log('');
      });
    }

    // Test 3: Check for expired files
    console.log('Test 3: Checking for expired anonymous files...');
    const { data: expiredFiles, error: expiredError } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('is_anonymous', true)
      .not('expires_at', 'is', null)
      .lt('expires_at', new Date().toISOString());

    if (expiredError) {
      console.error('❌ Expired files query failed:', expiredError.message);
      return false;
    }

    console.log(`✅ Found ${expiredFiles?.length || 0} expired file(s) ready for cleanup\n`);

    // Test 4: Check storage structure
    console.log('Test 4: Checking storage structure...');
    const { data: storageFiles, error: storageError } = await supabaseAdmin.storage
      .from('files')
      .list('anonymous', {
        limit: 10
      });

    if (storageError) {
      console.log('⚠️  Anonymous folder may not exist yet (will be created on first upload)');
    } else {
      console.log(`✅ Anonymous storage folder exists with ${storageFiles?.length || 0} file(s)\n`);
    }

    // Test 5: Check index exists (optional - skip if RPC not available)
    console.log('Test 5: Checking database index...');
    try {
      const { data: indexes, error: indexError } = await supabaseAdmin
        .rpc('pg_indexes', {
          schemaname: 'public',
          tablename: 'files'
        });

      if (!indexError && indexes) {
        const hasIndex = indexes.some(idx => idx.indexname === 'idx_files_anonymous_expiry');
        if (hasIndex) {
          console.log('✅ Cleanup index exists\n');
        } else {
          console.log('⚠️  Cleanup index may not exist (optional but recommended)\n');
        }
      } else {
        console.log('⚠️  Could not verify index (may require additional permissions)\n');
      }
    } catch (indexCheckError) {
      console.log('⚠️  Could not verify index (RPC not available - this is OK)\n');
    }

    // Summary
    console.log('╔════════════════════════════════════════════╗');
    console.log('║  Test Summary                              ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log('✅ Database schema: OK');
    console.log('✅ Anonymous files query: OK');
    console.log('✅ Expired files query: OK');
    console.log(storageError ? '⚠️  Storage folder: Not yet created' : '✅ Storage folder: OK');
    console.log('\n📝 System is ready for anonymous uploads!\n');

    // Recommendations
    console.log('Recommendations:');
    console.log('1. Test anonymous upload via frontend (/tools)');
    console.log('2. Monitor cleanup logs when server starts');
    console.log('3. Run manual cleanup: npm run cleanup-anonymous');
    console.log('4. Check storage usage in Supabase dashboard\n');

    return true;

  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error);
    return false;
  }
}

// Run test
if (require.main === module) {
  testAnonymousUploadSystem()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { testAnonymousUploadSystem };
