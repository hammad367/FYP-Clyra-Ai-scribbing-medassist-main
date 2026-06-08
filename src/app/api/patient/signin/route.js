import { NextResponse } from 'next/server';
import { Patient } from '@/models/Patient';
import { createToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find patient by email
    const patient = await Patient.findByEmail(email);
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await Patient.verifyPassword(password, patient.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createToken({
      patientId: patient._id.toString(),
      email: patient.email,
      type: 'patient', // Distinguish from doctor tokens
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
    console.error('Patient signin error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
