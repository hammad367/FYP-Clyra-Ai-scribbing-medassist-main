import { NextResponse } from 'next/server';
import { Patient } from '@/models/Patient';
import { createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { name, email, password, mrn } = await request.json();

    if (!name || !email || !password || !mrn) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate MRN exists in system (patient must be registered by doctor first)
    const existingPatient = await Patient.findByMRN(mrn);
    
    if (!existingPatient) {
      return NextResponse.json(
        { error: 'Invalid MRN. Please contact your healthcare provider.' },
        { status: 404 }
      );
    }

    // Check if patient already has portal access
    if (existingPatient.email) {
      return NextResponse.json(
        { error: 'This MRN is already registered. Please login instead.' },
        { status: 400 }
      );
    }

    // Verify name matches
    if (existingPatient.name.toLowerCase() !== name.toLowerCase()) {
      return NextResponse.json(
        { error: 'Name does not match our records. Please verify your information.' },
        { status: 400 }
      );
    }

    // Activate patient portal access
    const patient = await Patient.activatePortalAccess(existingPatient._id, {
      email,
      password,
    });

    // Create JWT token
    const token = await createToken({
      patientId: patient._id.toString(),
      email: patient.email,
      type: 'patient',
    });

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('patient_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Return patient data (without password)
    const { password: _, ...patientData } = patient;

    return NextResponse.json({
      success: true,
      patient: patientData,
    });
  } catch (error) {
    console.error('Patient signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
