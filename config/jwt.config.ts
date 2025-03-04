export const JWT_CONFIG = {
    secretKey: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: process.env.JWT_ISSUER || 'interview-app',
    audience: process.env.JWT_AUDIENCE || 'interview-app-users',
};