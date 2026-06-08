import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { Patient } from '@/models/Patient';

export async function GET() {
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

    // Get patient data
    const patient = await Patient.findById(payload.patientId);

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Return patient data (without password)
    const { password: _, ...patientData } = patient;

    return NextResponse.json({
      patient: patientData,
    });
  } catch (error) {
    console.error('Patient auth check error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
