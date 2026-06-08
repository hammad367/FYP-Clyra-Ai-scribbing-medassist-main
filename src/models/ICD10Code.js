import { MongoClient } from 'mongodb';

// MongoDB connection setup
const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

// In development, reuse connection across hot reloads
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create new connection
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// ICD10Code model - handles medical diagnostic code lookups
export class ICD10Code {
  // Connect to ICD-10 codes collection
  static async getCollection() {
    const client = await clientPromise;
    const db = client.db('medical-scribe');
    return db.collection('icd_codes');
  }

  // Search for ICD-10 codes by keyword
  static async search(query, limit = 20) {
    const collection = await this.getCollection();
    
    // Case-insensitive regex search
    const searchRegex = new RegExp(query, 'i');
    
    // Search across code, description, and short description fields
    const results = await collection
      .find({
        $or: [
          { code: searchRegex },
          { description: searchRegex },
          { shortDescription: searchRegex }
        ]
      })
      .limit(limit)
      .toArray();

    return results;
  }

  // Look up a specific ICD-10 code
  static async getByCode(code) {
    const collection = await this.getCollection();
    return await collection.findOne({ code: code.toUpperCase() });
  }

  // Batch lookup of multiple codes
  static async getByCodes(codes) {
    const collection = await this.getCollection();
    return await collection
      .find({ code: { $in: codes.map(c => c.toUpperCase()) } })
      .toArray();
  }

  // Create database indexes for faster searching (run once during setup)
  static async createIndexes() {
    const collection = await this.getCollection();
    await collection.createIndex({ code: 1 }); // Index on code field
    await collection.createIndex({ description: 'text', shortDescription: 'text' }); // Text search index
  }
}

export default ICD10Code;
