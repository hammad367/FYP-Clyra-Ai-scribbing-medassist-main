import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { MedicalRecord } from '@/models/MedicalRecord';

export async function GET(request, { params }) {
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

    // Await params in Next.js 15
    const { id } = await params;
    console.log('Fetching record ID:', id, 'for patient:', payload.patientId);

    // Get the specific medical record
    const record = await MedicalRecord.findById(id);

    if (!record) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    // Verify this record belongs to the authenticated patient
    if (record.patientId.toString() !== payload.patientId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Return record with clinical notes but exclude raw transcription/audio
    const sanitizedRecord = {
      _id: record._id,
      sessionDate: record.sessionDate,
      sessionTime: record.sessionTime,
      templateName: record.templateName,
      noteContent: record.noteContent, // Clinical notes are safe to show
      sessionSummary: record.sessionSummary,
      icdCodes: record.icdCodes || [],
      status: record.status,
      createdAt: record.createdAt,
      // Exclude: transcription, dialogue, audioFileName (privacy)
    };

    return NextResponse.json({
      success: true,
      record: sanitizedRecord,
    });
  } catch (error) {
    console.error('Patient record fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch record', details: error.message },
      { status: 500 }
    );
  }
}
