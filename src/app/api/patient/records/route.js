import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { MedicalRecord } from '@/models/MedicalRecord';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('patient_token');

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const payload = await verifyToken(token.value);

    if (!payload || payload.type !== 'patient') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get patient's medical records
    console.log('Fetching records for patient ID:', payload.patientId);
    const records = await MedicalRecord.findByPatient(payload.patientId);
    console.log('Found records:', records.length);

    // Filter sensitive information for patient view
    const sanitizedRecords = records.map(record => ({
      _id: record._id,
      sessionDate: record.sessionDate,
      sessionTime: record.sessionTime,
      templateName: record.templateName,
      sessionSummary: record.sessionSummary,
      icdCodes: record.icdCodes || [],
      status: record.status,
      createdAt: record.createdAt,
      // Exclude: transcription, dialogue, audioFileName (privacy)
    }));

    return NextResponse.json({
      success: true,
      records: sanitizedRecords,
    });
  } catch (error) {
    console.error('Patient records fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}
