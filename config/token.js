import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || 'musical_app_secret_goth_vibes_2026';

/**
 * Crée un jeton d'authentification signé HMAC-SHA256
 * @param {string|object} userId
 * @returns {string}
 */
export const createToken = (userId) => {
  if (!userId) return null;
  const payload = Buffer.from(JSON.stringify({ userId: String(userId), ts: Date.now() })).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

/**
 * Vérifie un jeton d'authentification HMAC-SHA256
 * @param {string} token
 * @returns {string|null} userId si valide, sinon null
 */
export const verifyToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  if (signature !== expectedSignature) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    // Valide pendant 30 jours
    if (Date.now() - data.ts > 30 * 24 * 60 * 60 * 1000) return null;
    return data.userId;
  } catch {
    return null;
  }
};
