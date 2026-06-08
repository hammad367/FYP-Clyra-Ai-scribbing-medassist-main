import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { Doctor } from '@/models/Doctor';

export async function PATCH(request) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { name, specialization, profileImage } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!specialization || !specialization.trim()) {
      return NextResponse.json({ error: 'Specialization is required' }, { status: 400 });
    }

    // Keep stored profile image reasonably sized when sent as base64 data URL.
    if (profileImage && profileImage.length > 2_000_000) {
      return NextResponse.json({ error: 'Profile image is too large' }, { status: 400 });
    }

    const updatedDoctor = await Doctor.updateById(payload.id, {
      name,
      specialization,
      profileImage: profileImage || '',
    });

    if (!updatedDoctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      doctor: {
        id: updatedDoctor._id.toString(),
        name: updatedDoctor.name,
        email: updatedDoctor.email,
        specialization: updatedDoctor.specialization,
        profileImage: updatedDoctor.profileImage || '',
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
