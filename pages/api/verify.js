import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Verificar que sea un método POST
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const authHeader = req.headers.authorization;

  // Verificar encabezado de autorización
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verificar el JWT
    const decoded = jwt.verify(token, process.env.secretKey);

    // Validar que los campos necesarios estén presentes
    if (!decoded.userId || !decoded.address) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Responder con el ID del usuario y la dirección
    res.json({ message: 'Válido', userId: decoded.userId, address: decoded.address });
  } catch (err) {
    console.error('Error al verificar el token:', err);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}