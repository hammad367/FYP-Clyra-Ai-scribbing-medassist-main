import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { Patient } from '@/models/Patient';

// Add bulk EHR data (used by AI extraction approval)
export async function POST(request, { params }) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;
    const ehrData = await request.json();

    console.log('Adding EHR data for patient:', id);
    console.log('EHR data received:', JSON.stringify(ehrData, null, 2));

    // Add bulk EHR data to patient
    const updatedPatient = await Patient.addBulkEHRData(id, ehrData);

    console.log('EHR data added successfully. Updated patient:', updatedPatient?._id);

    return NextResponse.json({
      success: true,
      patient: updatedPatient
    });

  } catch (error) {
    console.error('Add EHR data error:', error);
    return NextResponse.json(
      { error: 'Failed to add EHR data' },
      { status: 500 }
    );
  }
}
