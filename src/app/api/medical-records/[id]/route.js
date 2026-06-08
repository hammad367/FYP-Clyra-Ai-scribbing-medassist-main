import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { MedicalRecord } from '@/models/MedicalRecord';

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
    const { noteContent, icdCodes, sessionSummary } = await request.json();

    // Update the medical record
    const updated = await MedicalRecord.update(id, {
      noteContent,
      icdCodes,
      sessionSummary,
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, record: updated });
  } catch (error) {
    console.error('Update medical record error:', error);
    return NextResponse.json(
      { error: 'Failed to update medical record' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
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
    const record = await MedicalRecord.findById(id);

    if (!record) {
      return NextResponse.json(
        { error: 'Record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ record });
  } catch (error) {
    console.error('Get medical record error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch medical record' },
      { status: 500 }
    );
  }
}
