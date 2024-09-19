import { validateLogin } from '@/utils/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { signedMessage, nonce, address } = req.body;

    const token = await validateLogin(signedMessage, nonce, address);

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    res.status(400).json({ error: error.message });
  }
}