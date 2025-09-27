import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';

export async function GET() {
  console.log('🔍 STARTING DIRECT SUPABASE CONNECTION TEST...');

  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.error('❌ SUPABASE NOT CONFIGURED');
      return NextResponse.json({
        success: false,
        error: 'Supabase environment variables not configured',
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }, { status: 500 });
    }

    console.log('✅ SUPABASE CONFIGURATION FOUND');
    console.log('🔗 URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔑 ANON KEY (first 20 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20));

    // Test 1: Query the specific target record
    const targetId = 'df66d8ea-d3a7-47b0-8a45-bf90af220799';
    console.log(`🎯 TESTING SPECIFIC RECORD: ${targetId}`);

    const { data: specificRecord, error: specificError } = await supabase!
      .from('health_metrics')
      .select('*')
      .eq('id', targetId)
      .single();

    if (specificError) {
      console.error('❌ SPECIFIC RECORD ERROR:', specificError);
      return NextResponse.json({
        success: false,
        error: `Specific record query failed: ${specificError.message}`,
        errorCode: specificError.code,
        targetId
      }, { status: 500 });
    }

    console.log('✅ SPECIFIC RECORD FOUND:', specificRecord);

    // Test 2: Query recent Bob records
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const { data: bobRecords, error: bobError } = await supabase!
      .from('health_metrics')
      .select('*')
      .eq('user_name', 'Bob')
      .gte('date', '2025-09-20')
      .order('date', { ascending: false })
      .limit(5);

    if (bobError) {
      console.error('❌ BOB RECORDS ERROR:', bobError);
    } else {
      console.log(`✅ BOB RECORDS FOUND: ${bobRecords?.length || 0} records`);
    }

    // Test 3: Table structure inspection
    const { data: tableStructure, error: structureError } = await supabase!
      .from('health_metrics')
      .select('*')
      .limit(1);

    const availableColumns = tableStructure?.[0] ? Object.keys(tableStructure[0]) : [];

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,

      // Specific record test results
      targetRecord: {
        id: specificRecord?.id,
        user_name: specificRecord?.user_name,
        date: specificRecord?.date,
        weight: specificRecord?.weight,
        body_fat: specificRecord?.body_fat,
        muscle_mass: specificRecord?.muscle_mass,
        heart_rate: specificRecord?.heart_rate,
        steps: specificRecord?.steps,
        sleep_score: specificRecord?.sleep_score,
        data_source: specificRecord?.data_source,
        last_synced: specificRecord?.last_synced
      },

      // Bob records summary
      bobRecords: {
        count: bobRecords?.length || 0,
        records: bobRecords?.slice(0, 3).map(record => ({
          id: record.id,
          date: record.date,
          weight: record.weight,
          body_fat: record.body_fat
        }))
      },

      // Database structure
      database: {
        availableColumns,
        totalColumns: availableColumns.length
      },

      // Expected vs actual values for target record
      expectedValues: {
        body_fat: 20.2,
        weight: 77.26
      },
      actualValues: {
        body_fat: specificRecord?.body_fat,
        weight: specificRecord?.weight
      },

      valuesMatch: {
        body_fat: specificRecord?.body_fat === 20.2,
        weight: specificRecord?.weight === 77.26
      }
    });

  } catch (error) {
    console.error('❌ SUPABASE TEST FAILED:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}