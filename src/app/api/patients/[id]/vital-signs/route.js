import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { Patient } from '@/models/Patient';

// Add vital signs
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
    const vitals = await request.json();

    const addedVitals = await Patient.addVitalSigns(id, vitals);

    return NextResponse.json({
      success: true,
      vitalSigns: addedVitals
    });

  } catch (error) {
    console.error('Add vital signs error:', error);
    return NextResponse.json(
      { error: 'Failed to add vital signs' },
      { status: 500 }
    );
  }
}
