import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import connectDB from '@/utils/connectDB';
import User from '@/models/schema';

const secretKey = process.env.secretKey;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    await connectDB();
    const { signedMessage, nonce, address } = req.body;

    // Validación de campos requeridos
    if (!signedMessage || !nonce || !address) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    let user = await User.findOne({ blockchainAddress: address });

    // Crear nuevo usuario si no existe
    if (!user) {
      user = new User({
        blockchainAddress: address,
        nonce: null,
        nonceCreatedAt: null,
        email: `${address}@domain.com`, // Valor predeterminado para email
        name: 'Usuario Desconocido', // Valor predeterminado para nombre
      });
      await user.save(); // Guardar nuevo usuario
    }

    // Verificar existencia y validez del nonce
    if (!user.nonce || !user.nonceCreatedAt) {
      return res.status(400).json({ error: 'Nonce no encontrado' });
    }

    const nonceAge = (new Date() - user.nonceCreatedAt) / 1000 / 60;
    if (nonceAge > 5) {
      return res.status(400).json({ error: 'El nonce ha expirado' });
    }

    if (user.nonce !== nonce) {
      return res.status(400).json({ error: 'Nonce inválido' });
    }

    // Verificar firma del mensaje
    const recoveredAddress = ethers.verifyMessage(nonce, signedMessage);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: 'Firma inválida' });
    }

    // Generar token JWT
    const token = jwt.sign({ userId: user._id, address }, secretKey, { expiresIn: '1h' });

    // Limpiar el nonce después del inicio de sesión exitoso
    user.nonce = null;
    user.nonceCreatedAt = null;
    await user.save();

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error en inicio de sesión:', error);
    res.status(500).json({ error: 'Ocurrió un error durante el inicio de sesión' });
  }
}