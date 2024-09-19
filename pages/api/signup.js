import { ethers } from 'ethers';
import connectDB from '@/utils/connectDB';
import User from '@/models/schema';

connectDB();

async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log("Trying to sign up");
      const { name, email, blockchainAddress } = req.body;
      
      // Comprobar si el usuario ya existe
      const existingUser = await User.findOne({ $or: [{ email }, { blockchainAddress }] });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      } 

      let userBlockchainAddress = blockchainAddress;
      let blockchainPrivateKey = null;

      // Si no se proporciona una dirección blockchain, crear una nueva
      if (!userBlockchainAddress) {
        const wallet = ethers.Wallet.createRandom();
        userBlockchainAddress = wallet.address;
        blockchainPrivateKey = wallet.privateKey;
      }

      // Guardar datos del usuario en MongoDB      
      const newUser = new User({ 
        name: name || `User ${userBlockchainAddress.slice(0, 6)}`, 
        email: email || `${userBlockchainAddress.slice(0, 6)}@example.com`, 
        blockchainAddress: userBlockchainAddress 
      });
      await newUser.save();

      res.status(200).json({ 
        message: 'User registered successfully', 
        blockchainAddress: userBlockchainAddress,
        blockchainPrivateKey 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred during registration' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default handler;