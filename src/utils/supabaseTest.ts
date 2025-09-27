'use client';

import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';

// Direct Supabase query test for specific record
export async function testDirectSupabaseQuery() {
  console.log('🔍 DIRECT SUPABASE QUERY TEST STARTING...');

  if (!isSupabaseConfigured()) {
    console.error('❌ SUPABASE NOT CONFIGURED - Environment variables missing');
    return {
      success: false,
      error: 'Supabase environment variables not set',
      data: null
    };
  }

  try {
    // Test 1: Query the specific record by ID
    const targetId = 'df66d8ea-d3a7-47b0-8a45-bf90af220799';
    console.log(`🎯 Querying specific record ID: ${targetId}`);

    const { data: specificRecord, error: specificError } = await supabase!
      .from('health_metrics')
      .select('*')
      .eq('id', targetId)
      .single();

    if (specificError) {
      console.error('❌ SPECIFIC RECORD QUERY ERROR:', specificError);
    } else {
      console.log('✅ SPECIFIC RECORD FOUND:', specificRecord);
      console.log(`📊 BODY FAT: ${specificRecord.body_fat}%`);
      console.log(`⚖️ WEIGHT: ${specificRecord.weight}kg`);
      console.log(`👤 USER: ${specificRecord.user_name}`);
      console.log(`📅 DATE: ${specificRecord.date}`);
    }

    // Test 2: Query all recent records for Bob
    console.log('🔍 Querying all Bob records from last 7 days...');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data: bobRecords, error: bobError } = await supabase!
      .from('health_metrics')
      .select('*')
      .eq('user_name', 'Bob')
      .gte('date', sevenDaysAgoStr)
      .order('date', { ascending: false })
      .limit(10);

    if (bobError) {
      console.error('❌ BOB RECORDS QUERY ERROR:', bobError);
    } else {
      console.log(`✅ BOB RECORDS FOUND: ${bobRecords?.length || 0} records`);
      bobRecords?.forEach((record, index) => {
        console.log(`📊 Record ${index + 1}:`, {
          id: record.id,
          date: record.date,
          weight: record.weight,
          body_fat: record.body_fat,
          muscle_mass: record.muscle_mass,
          heart_rate: record.heart_rate,
          steps: record.steps,
          sleep_score: record.sleep_score
        });
      });
    }

    // Test 3: Raw table structure inspection
    console.log('🔍 Checking table structure...');
    const { data: structureTest, error: structureError } = await supabase!
      .from('health_metrics')
      .select('*')
      .limit(1);

    if (structureTest && structureTest.length > 0) {
      console.log('📋 TABLE COLUMNS AVAILABLE:', Object.keys(structureTest[0]));
    }

    return {
      success: true,
      specificRecord,
      bobRecords,
      totalBobRecords: bobRecords?.length || 0,
      availableColumns: structureTest?.[0] ? Object.keys(structureTest[0]) : []
    };

  } catch (error) {
    console.error('❌ DIRECT SUPABASE QUERY FAILED:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

// Hook to run the test and get results
export function useSupabaseTest() {
  const runTest = async () => {
    return await testDirectSupabaseQuery();
  };

  return { runTest };
}