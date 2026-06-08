import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { Patient } from '@/models/Patient';

// Add medication
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
    const medication = await request.json();

    const addedMedication = await Patient.addMedication(id, medication);

    return NextResponse.json({
      success: true,
      medication: addedMedication
    });

  } catch (error) {
    console.error('Add medication error:', error);
    return NextResponse.json(
      { error: 'Failed to add medication' },
      { status: 500 }
    );
  }
}

// Update medication
export async function PUT(request, { params }) {
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
    const { medicationId, ...updates } = await request.json();

    await Patient.updateMedication(id, medicationId, updates);

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Update medication error:', error);
    return NextResponse.json(
      { error: 'Failed to update medication' },
      { status: 500 }
    );
  }
}

// Delete medication
export async function DELETE(request, { params }) {
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
    const { medicationId } = await request.json();

    await Patient.removeMedication(id, medicationId);

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Delete medication error:', error);
    return NextResponse.json(
      { error: 'Failed to delete medication' },
      { status: 500 }
    );
  }
}
