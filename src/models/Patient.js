import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

// Patient model - handles all patient-related database operations
export class Patient {
  // Get the patients collection from MongoDB
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db('medical_transcription');
    return db.collection('patients');
  }

  // Generate unique MRN (Medical Record Number)
  // Format: CLY-YYYYMMDD-XXXX (e.g., CLY-20260414-0001)
  static async generateMRN() {
    const collection = await this.getCollection();
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    
    // Find the highest MRN for today
    const todayPrefix = `CLY-${dateStr}-`;
    const latestPatient = await collection
      .find({ mrn: { $regex: `^${todayPrefix}` } })
      .sort({ mrn: -1 })
      .limit(1)
      .toArray();
    
    let sequenceNumber = 1;
    if (latestPatient.length > 0) {
      // Extract sequence number from last MRN and increment
      const lastMRN = latestPatient[0].mrn;
      const lastSequence = parseInt(lastMRN.split('-')[2]);
      sequenceNumber = lastSequence + 1;
    }
    
    // Format: CLY-YYYYMMDD-0001
    const mrn = `${todayPrefix}${sequenceNumber.toString().padStart(4, '0')}`;
    return mrn;
  }

  // Create a new patient record
  static async create({ doctorId, name, age, sex, dob, mrn, demographics = {}, medicalHistory = {} }) {
    const collection = await this.getCollection();
    
    // Auto-generate MRN if not provided
    const patientMRN = mrn || await this.generateMRN();
    
    // Insert patient with auto-generated timestamps and EHR fields
    const result = await collection.insertOne({
      doctorId: new ObjectId(doctorId), // Link patient to their doctor
      name,
      age,
      sex,
      dob,
      mrn: patientMRN, // Medical Record Number (auto-generated)
      
      // Demographics (optional fields)
      demographics: {
        phone: demographics.phone || '',
        email: demographics.email || '',
        address: demographics.address || '',
        emergencyContact: {
          name: demographics.emergencyContactName || '',
          phone: demographics.emergencyContactPhone || '',
          relationship: demographics.emergencyContactRelationship || ''
        },
        insurance: {
          provider: demographics.insuranceProvider || '',
          policyNumber: demographics.insurancePolicyNumber || ''
        }
      },
      
      // Medical History (optional fields)
      medicalHistory: {
        conditions: medicalHistory.conditions || [],
        surgeries: medicalHistory.surgeries || [],
        familyHistory: medicalHistory.familyHistory || '',
        socialHistory: {
          smoking: medicalHistory.smoking || '',
          alcohol: medicalHistory.alcohol || '',
          exercise: medicalHistory.exercise || ''
        }
      },
      
      // EHR Data Arrays
      medications: [],
      allergies: [],
      vitalSigns: [],
      immunizations: [],
      timeline: [],
      
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      _id: result.insertedId,
      doctorId,
      name,
      age,
      sex,
      dob,
      mrn: patientMRN,
      demographics: result.insertedId.demographics,
      medicalHistory: result.insertedId.medicalHistory,
      medications: [],
      allergies: [],
      vitalSigns: [],
    };
  }

  // Get all patients for a specific doctor, sorted by newest first
  static async findByDoctor(doctorId) {
    const collection = await this.getCollection();
    return await collection
      .find({ doctorId: new ObjectId(doctorId) })
      .sort({ createdAt: -1 }) // Newest patients first
      .toArray();
  }

  // Find a single patient by ID
  static async findById(id) {
    const collection = await this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  // Update patient information
  static async update(id, data) {
    const collection = await this.getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...data,
          updatedAt: new Date() // Always update timestamp on changes
        } 
      }
    );
    return result;
  }

  // Find patient by Medical Record Number (MRN)
  static async findByMRN(mrn) {
    const collection = await this.getCollection();
    return await collection.findOne({ mrn });
  }

  // Find patient by email (for portal login)
  static async findByEmail(email) {
    const collection = await this.getCollection();
    return await collection.findOne({ email });
  }

  // Activate patient portal access (add email/password to existing patient)
  static async activatePortalAccess(patientId, { email, password }) {
    const collection = await this.getCollection();
    
    // Check if email is already in use
    const existingEmail = await this.findByEmail(email);
    if (existingEmail) {
      throw new Error('Email is already registered');
    }

    // Hash password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update patient with portal credentials
    await collection.updateOne(
      { _id: new ObjectId(patientId) },
      { 
        $set: { 
          email,
          password: hashedPassword,
          portalActivated: true,
          portalActivatedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    // Return updated patient (without password)
    const patient = await this.findById(patientId);
    const { password: _, ...patientData } = patient;
    return patientData;
  }

  // Verify patient password for login
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // ==================== EHR METHODS ====================

  // Add medication to patient record
  static async addMedication(patientId, medication) {
    const collection = await this.getCollection();
    const medicationEntry = {
      _id: new ObjectId(),
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      startDate: medication.startDate || new Date(),
      endDate: medication.endDate || null,
      prescribedBy: medication.prescribedBy || '',
      notes: medication.notes || '',
      active: medication.active !== false,
      addedAt: new Date()
    };

    await collection.updateOne(
      { _id: new ObjectId(patientId) },
      { 
        $push: { medications: medicationEntry },
        $set: { updatedAt: new Date() }
      }
    );

    return medicationEntry;
  }

  // Update medication
  static async updateMedication(patientId, medicationId, updates) {
    const collection = await this.getCollection();
    const updateFields = {};
    
    Object.keys(updates).forEach(key => {
      updateFields[`medications.$.${key}`] = updates[key];
    });

    await collection.updateOne(
      { 
        _id: new ObjectId(patientId),
        'medications._id': new ObjectId(medicationId)
      },
      { 
        $set: {
          ...updateFields,
          'medications.$.updatedAt': new Date(),
          updatedAt: new Date()
        }
      }
    );
  }

  // Remove medication
  static async removeMedication(patientId, medicationId) {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(patientId) },
      { 
        $pull: { medications: { _id: new ObjectId(medicationId) } },
        $set: { updatedAt: new Date() }
      }
    );
  }

  // Add allergy
  static async addAllergy(patientId, allergy) {
    const collection = await this.getCollection();
    const allergyEntry = {
      _id: new ObjectId(),
      allergen: allergy.allergen,
      reaction: allergy.reaction,
      severity: allergy.severity || 'moderate',
      notes: allergy.notes || '',
      addedAt: new Date()
    };

    await collection.updateOne(
      { _id: new ObjectId(patientId) },
      { 
        $push: { allergies: allergyEntry },
        $set: { updatedAt: new Date() }
      }
    );

    return allergyEntry;
  }

  // Remove allergy
  static async removeAllergy(patientId, allergyId) {
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: new ObjectId(patientId) },
      { 
        $pull: { allergies: { _id: new ObjectId(allergyId) } },
        $set: { updatedAt: new Date() }
      }
    );
  }

  // Add vital signs
  static async addVitalSigns(patientId, vitals) {
    const collection = await this.getCollection();
    const vitalEntry = {
      _id: new ObjectId(),
      date: vitals.date || new Date(),
      bloodPressureSystolic: vitals.bloodPressureSystolic || null,
      bloodPressureDiastolic: vitals.bloodPressureDiastolic || null,
      heartRate: vitals.heartRate || null,
      temperature: vitals.temperature || null,
      weight: vitals.weight || null,
      height: vitals.height || null,
      oxygenSaturation: vitals.oxygenSaturation || null,
      respiratoryRate: vitals.respiratoryRate || null,
      notes: vitals.notes || '',
      recordedBy: vitals.recordedBy || '',
      addedAt: new Date()
    };

    await collection.updateOne(
      { _id: new ObjectId(patientId) },
      { 
        $push: { vitalSigns: vitalEntry },
        $set: { updatedAt: new Date() }
      }
    );

    return vitalEntry;
  }

  // Add timeline entry
  static async addTimelineEntry(patientId, entry) {
    const collection = await this.getCollection();
    const timelineEntry = {
      _id: new ObjectId(),
      date: entry.date || new Date(),
      type: entry.type, // 'medication', 'diagnosis', 'procedure', 'note', etc.
      title: entry.title,
      description: entry.description || '',
      relatedRecordId: entry.relatedRecordId || null,
      addedAt: new Date()
    };

    await collection.updateOne(
      { _id: new ObjectId(patientId) },
      { 
        $push: { timeline: timelineEntry },
        $set: { updatedAt: new Date() }
      }
    );

    return timelineEntry;
  }

  // Bulk add EHR data (used by AI extraction)
  static async addBulkEHRData(patientId, ehrData) {
    const collection = await this.getCollection();
    const updates = { updatedAt: new Date() };
    const pushOperations = {};

    // Add medications
    if (ehrData.medications && ehrData.medications.length > 0) {
      pushOperations.medications = { 
        $each: ehrData.medications.map(med => ({
          _id: new ObjectId(),
          ...med,
          addedAt: new Date()
        }))
      };
    }

    // Add allergies
    if (ehrData.allergies && ehrData.allergies.length > 0) {
      pushOperations.allergies = { 
        $each: ehrData.allergies.map(allergy => ({
          _id: new ObjectId(),
          ...allergy,
          addedAt: new Date()
        }))
      };
    }

    // Add vital signs
    if (ehrData.vitalSigns) {
      pushOperations.vitalSigns = {
        _id: new ObjectId(),
        ...ehrData.vitalSigns,
        addedAt: new Date()
      };
    }

    // Add timeline entries
    if (ehrData.timeline && ehrData.timeline.length > 0) {
      pushOperations.timeline = { 
        $each: ehrData.timeline.map(entry => ({
          _id: new ObjectId(),
          ...entry,
          addedAt: new Date()
        }))
      };
    }

    if (Object.keys(pushOperations).length > 0) {
      await collection.updateOne(
        { _id: new ObjectId(patientId) },
        { 
          $push: pushOperations,
          $set: updates
        }
      );
    }

    return await this.findById(patientId);
  }
}
