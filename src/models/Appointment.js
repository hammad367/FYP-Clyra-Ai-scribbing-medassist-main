import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Appointment model - manages patient appointment scheduling
export class Appointment {
  // Get appointments collection from database
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db('medical_transcription');
    return db.collection('appointments');
  }

  // Schedule a new appointment
  static async create({ patientId, doctorId, appointmentDate, appointmentTime, duration, reason, notes }) {
    const collection = await this.getCollection();
    
    const appointment = {
      patientId: new ObjectId(patientId),
      doctorId: new ObjectId(doctorId),
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      duration: duration || 30, // Default is 30 minute appointments
      reason: reason || '',
      notes: notes || '',
      status: 'scheduled', // Can be: scheduled, completed, cancelled, no-show
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await collection.insertOne(appointment);

    return {
      _id: result.insertedId,
      ...appointment,
    };
  }

  // Get all appointments for a doctor, optionally filtered by date range
  static async findByDoctor(doctorId, startDate = null, endDate = null) {
    const collection = await this.getCollection();
    
    const query = { doctorId: new ObjectId(doctorId) };
    
    // Add date range filter if provided
    if (startDate && endDate) {
      query.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    return await collection
      .find(query)
      .sort({ appointmentDate: 1, appointmentTime: 1 }) // Sort chronologically
      .toArray();
  }

  // Get patient's appointment history
  static async findByPatient(patientId) {
    const collection = await this.getCollection();
    return await collection
      .find({ patientId: new ObjectId(patientId) })
      .sort({ appointmentDate: -1 }) // Most recent first
      .toArray();
  }

  static async findById(id) {
    const collection = await this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  // Update appointment details
  static async update(id, updateData) {
    const collection = await this.getCollection();
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  }

  // Delete an appointment (for cancellations)
  static async delete(id) {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  // Quick method to update just the status
  static async updateStatus(id, status) {
    return await this.update(id, { status });
  }

  // Get today's appointments for the dashboard
  static async getTodayAppointments(doctorId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // End of today

    return await this.findByDoctor(doctorId, today, tomorrow);
  }

  // Get upcoming appointments
  static async getUpcomingAppointments(doctorId, limit = 10) {
    const collection = await this.getCollection();
    const now = new Date();

    return await collection
      .find({
        doctorId: new ObjectId(doctorId),
        appointmentDate: { $gte: now },
        status: 'scheduled'
      })
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(limit)
      .toArray();
  }
}
