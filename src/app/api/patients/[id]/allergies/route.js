import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { Patient } from '@/models/Patient';

// Add allergy
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
    const allergy = await request.json();

    const addedAllergy = await Patient.addAllergy(id, allergy);

    return NextResponse.json({
      success: true,
      allergy: addedAllergy
    });

  } catch (error) {
    console.error('Add allergy error:', error);
    return NextResponse.json(
      { error: 'Failed to add allergy' },
      { status: 500 }
    );
  }
}

// Delete allergy
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
    const { allergyId } = await request.json();

    await Patient.removeAllergy(id, allergyId);

    return NextResponse.json({
      success: true
    });

  } catch (error) {
    console.error('Delete allergy error:', error);
    return NextResponse.json(
      { error: 'Failed to delete allergy' },
      { status: 500 }
    );
  }
}
