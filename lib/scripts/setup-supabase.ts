const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

interface SupabaseError {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Constants updated with current values
const CURRENT_TIMESTAMP = '2025-04-12 08:54:10';
const CURRENT_USER = 'MilkywayRides';

async function setupSupabase() {
  try {
    // First, try to update the bucket with the desired settings
    const { error: updateError } = await supabase
      .storage
      .updateBucket('project-files', {
        public: false,
        fileSizeLimit: 52428800, // 50MB in bytes
        allowedMimeTypes: ['image/png', 'image/jpeg', 'video/mp4', 'audio/mpeg', 'application/pdf']
      });

    if (updateError) {
      // If the bucket doesn't exist, the update will fail with a "not found" error
      if (updateError.message?.includes('not found')) {
        // Create the bucket since it doesn't exist
        const { error: createError } = await supabase
          .storage
          .createBucket('project-files', {
            public: false,
            fileSizeLimit: 52428800,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'video/mp4', 'audio/mpeg', 'application/pdf']
          });
        if (createError) {
          console.error('Bucket creation error:', createError);
          throw createError;
        }
        console.log('Storage bucket created');
      } else {
        // Some other error occurred during update
        console.error('Bucket update error:', updateError);
        throw updateError;
      }
    } else {
      console.log('Storage bucket updated');
    }

    // Verify bucket settings
    const { data: bucketData, error: getError } = await supabase.storage.getBucket('project-files');
    if (getError) {
      console.error('Error getting bucket details:', getError);
    } else {
      console.log('Bucket details:', bucketData);
    }

    // Proceed with uploading the dummy file
    const { error: policyError } = await supabase
      .storage
      .from('project-files')
      .upload('policy-setup.png', new Blob([Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
      ])], { type: 'image/png' }), {
        cacheControl: '0',
        upsert: true
      });

    if (policyError && !policyError.message?.includes('already exists')) {
      console.error('Policy creation error:', policyError);
      throw policyError;
    }
    console.log('Storage policies ready');

    // Create initial database structure
    const { error: dbError } = await supabase
      .from('projects')
      .upsert({
        id: '00000000-0000-0000-0000-000000000000',
        title: 'Schema Initialization',
        excerpt: 'Initial database setup',
        content: { 
          version: '1.0', 
          timestamp: CURRENT_TIMESTAMP,
          created_by: CURRENT_USER
        },
        status: 'DRAFT',
        authorId: CURRENT_USER,
        views: 0,
        visibility: 'private',
        is_paid: false,
        createdAt: CURRENT_TIMESTAMP,
        updatedAt: CURRENT_TIMESTAMP,
        storage_path: 'init'
      });

    if (dbError) {
      console.error('Database initialization error:', dbError);
      throw dbError;
    }
    console.log('Initial project record inserted');

    // Insert schema version record
    const { error: schemaVersionError } = await supabase
      .from('schema_versions')
      .upsert({
        version: 1,
        name: 'init',
        timestamp: CURRENT_TIMESTAMP,
        applied_by: CURRENT_USER,
        description: 'Initial schema setup'
      });

    if (schemaVersionError && !schemaVersionError.message?.includes('already exists')) {
      console.error('Schema version insertion error:', schemaVersionError);
      throw schemaVersionError;
    }
    console.log('Schema version recorded');

    // Remove the policy setup file
    const { error: removeError } = await supabase
      .storage
      .from('project-files')
      .remove(['policy-setup.png']);

    if (removeError) {
      console.error('Error removing policy setup file:', removeError);
      throw removeError;
    }
    console.log('Policy setup file removed');

    console.log('Setup completed successfully!');
  } catch (error: unknown) {
    const supabaseError = error as SupabaseError;
    console.error('Setup failed. Details:', {
      message: supabaseError.message || 'Unknown error',
      code: supabaseError.code || 'NO_CODE',
      details: supabaseError.details || 'No details available',
      hint: supabaseError.hint || 'No hint available'
    });
    process.exit(1);
  }
}

setupSupabase();