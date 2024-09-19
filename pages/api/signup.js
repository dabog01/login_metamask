import { ethers } from 'ethers';
import connectDB from '@/utils/connectDB';
import User from '@/models/schema';

connectDB();

async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log("Intentando registrarse");
      const { name, email, blockchainAddress } = req.body;

      // Validación básica de entrada
      if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Email inválido' });
      }

      // Comprobar si el usuario ya existe
      const existingUser = await User.findOne({ $or: [{ email }, { blockchainAddress }] });
      if (existingUser) {
        return res.status(400).json({ message: 'El usuario ya existe' });
      } 

      let userBlockchainAddress = blockchainAddress;
      
      // Si no se proporciona una dirección blockchain, crear una nueva
      if (!userBlockchainAddress) {
        const wallet = ethers.Wallet.createRandom();
        userBlockchainAddress = wallet.address;
        // No devolver la clave privada por razones de seguridad
      }

      // Guardar datos del usuario en MongoDB      
      const newUser = new User({ 
        name: name || `Usuario ${userBlockchainAddress.slice(0, 6)}`, 
        email: email || `${userBlockchainAddress.slice(0, 6)}@example.com`, 
        blockchainAddress: userBlockchainAddress 
      });
      await newUser.save();

      res.status(200).json({ 
        message: 'Usuario registrado exitosamente', 
        blockchainAddress: userBlockchainAddress,
        // No devolver blockchainPrivateKey aquí
      });
    } catch (error) {
      console.error('Error durante el registro:', error);
      res.status(500).json({ message: 'Ocurrió un error durante el registro' });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}

export default handler;