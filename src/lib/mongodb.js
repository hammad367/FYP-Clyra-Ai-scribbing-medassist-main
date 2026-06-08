import { MongoClient } from 'mongodb';

// Get MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI;

// Connection pool configuration for optimal performance
const options = {
  maxPoolSize: 10,                  // Limit concurrent connections
  serverSelectionTimeoutMS: 30000,  // Timeout for finding MongoDB server
  socketTimeoutMS: 45000,           // Socket inactivity timeout
  connectTimeoutMS: 30000,          // Initial connection timeout
  tls: true,                        // Enable SSL/TLS encryption
};

let client;
let clientPromise;

// Validate that MongoDB URI is configured
if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}
// In development mode, preserve connection across hot reloads
if (process.env.NODE_ENV === 'development') {
  // Store connection in global scope to survive Next.js hot reloading
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new connection instance
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Export promise that resolves to connected MongoDB client}

export default clientPromise;
