import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// MedicalRecord model - stores clinical notes and session data
export class MedicalRecord {
  // Connect to medical records collection
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db('medical_transcription');
    return db.collection('medical_records');
  }

  // Create a new medical record from a session
  static async create({ patientId, doctorId, recordData, sessionData = {} }) {
    const collection = await this.getCollection();
    
    const sessionDateTime = new Date();
    
    const record = {
      patientId: new ObjectId(patientId),
      doctorId: new ObjectId(doctorId),
      
      // Session metadata
      sessionDate: sessionDateTime,
      sessionTime: sessionDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      
      // The generated clinical note
      noteContent: recordData.content || '',
      templateName: sessionData.templateName || 'SOAP Note',
      templateId: sessionData.templateId || 'soap',
      
      // AI-generated summary for quick preview
      sessionSummary: sessionData.sessionSummary || this.generateSummary(recordData.content),
      
      // ICD-10 diagnostic codes
      icdCodes: sessionData.icdCodes || [],
      
      // Original transcription and audio data
      transcription: sessionData.transcription || '',
      dialogue: sessionData.dialogue || [], // Separated speaker dialogue
      audioFileName: sessionData.audioFileName || '',
      
      // Session details
      duration: sessionData.duration || 0, // Recording length in seconds
      recordingType: sessionData.recordingType || 'upload', // 'upload' or 'live'
      
      // Status
      status: 'completed',
      
      createdAt: sessionDateTime,
      updatedAt: sessionDateTime,
    };

    const result = await collection.insertOne(record);

    return {
      _id: result.insertedId,
      ...record,
    };
  }

  // Generate a brief summary from the note content
  static generateSummary(content) {
    if (!content) return 'No summary available';
    
    // Try to extract first sentence, or use first 200 chars
    const text = content.substring(0, 200).trim();
    const firstSentence = text.split('.')[0];
    
    if (firstSentence.length > 20) {
      return firstSentence + '.';
    }
    
    return text + (content.length > 200 ? '...' : '');
  }

  // Get all medical records for a patient
  static async findByPatient(patientId) {
    const collection = await this.getCollection();
    return await collection
      .find({ patientId: new ObjectId(patientId) })
      .sort({ createdAt: -1 }) // Most recent first
      .toArray();
  }

  // Find a specific medical record
  static async findById(id) {
    const collection = await this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  // Get the most recent record for a patient (for context)
  static async getLatestByPatient(patientId) {
    const collection = await this.getCollection();
    return await collection
      .findOne({ patientId: new ObjectId(patientId) })
      .sort({ createdAt: -1 });
  }

  // Update an existing medical record
  static async update(id, updateData) {
    const collection = await this.getCollection();
    
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result?.value || result;
  }
}
