import { SignJWT, jwtVerify } from 'jose';

// JWT secret key - must be set in environment variables for security
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
);

// Create a JWT token for authenticated sessions
export async function createToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })  // Use HMAC SHA-256 algorithm
    .setIssuedAt()                          // Set current timestamp
    .setExpirationTime('7d')                // Token valid for 7 days
    .sign(secret);                          // Sign with secret key
}
// Verify and decode a JWT token
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;  // Return decoded user data if valid
  } catch (error) {
    return null;     // Return null if token is invalid or expired) {
    return null;
  }
}
