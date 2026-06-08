import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

// Doctor model - manages doctor accounts and authentication
export class Doctor {
  // Connect to doctors collection
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db('medical_transcription');
    return db.collection('doctors');
  }

  // Register a new doctor account
  static async create({ name, email, password, specialization }) {
    const collection = await this.getCollection();
    
    // Prevent duplicate accounts with same email
    const existingDoctor = await collection.findOne({ email });
    if (existingDoctor) {
      throw new Error('Doctor with this email already exists');
    }

    // Hash password for security (never store plain text passwords)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save doctor to database
    const result = await collection.insertOne({
      name,
      email,
      password: hashedPassword,
      specialization,
      profileImage: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Return doctor data without password
    return {
      _id: result.insertedId,
      name,
      email,
      specialization,
      profileImage: '',
    };
  }

  // Find doctor by email (used during login)
  static async findByEmail(email) {
    const collection = await this.getCollection();
    return await collection.findOne({ email });
  }

  // Find doctor by MongoDB ID
  static async findById(id) {
    const collection = await this.getCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  // Update doctor profile fields
  static async updateById(id, updates) {
    const collection = await this.getCollection();

    const allowedUpdates = {};

    if (typeof updates.name === 'string') {
      allowedUpdates.name = updates.name.trim();
    }

    if (typeof updates.specialization === 'string') {
      allowedUpdates.specialization = updates.specialization.trim();
    }

    if (typeof updates.profileImage === 'string') {
      allowedUpdates.profileImage = updates.profileImage;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      throw new Error('No valid profile fields to update');
    }

    allowedUpdates.updatedAt = new Date();

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: allowedUpdates }
    );

    return await this.findById(id);
  }

  // Check if login password matches stored hash
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
