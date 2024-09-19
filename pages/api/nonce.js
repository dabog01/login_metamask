import crypto from 'crypto';
import connectDB from '@/utils/connectDB';
import User from '@/models/schema';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    const { address } = req.body;

    // Buscar usuario por dirección blockchain
    let user = await User.findOne({ blockchainAddress: address });

    // Si no existe el usuario, crearlo con valores predeterminados
    if (!user) {
      user = new User({
        blockchainAddress: address,
        nonce: null,
        nonceCreatedAt: null,
        email: `${address}@domain.com`, // Valor predeterminado para email
        name: 'user', // Valor predeterminado para nombre
      });
    }

    // Generar un nuevo nonce
    const nonce = crypto.randomBytes(32).toString('hex');
    user.nonce = nonce;
    user.nonceCreatedAt = new Date();
    
    await user.save(); // Guardar usuario y nonce

    res.status(200).json({ nonce });
  } catch (error) {
    console.error('Error in /api/nonce:', error);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
}