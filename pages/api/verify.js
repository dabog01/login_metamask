import { verifyToken } from '@/utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);

    res.json({ message: 'Válido', userId: decoded.userId, address: decoded.address });
  } catch (err) {
    console.error('Error al verificar el token:', err);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}